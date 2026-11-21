import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { cookies } from "next/headers";
import {
  createHash,
  randomBytes,
  scrypt as derive,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(derive);
const shared = globalThis as typeof globalThis & { trainingDb?: PrismaClient };
export function db() {
  if (!process.env.DATABASE_URL) throw new Error("unconfigured");
  return (shared.trainingDb ??= new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      max: 3,
    }),
  }));
}
const digest = (v: string) => createHash("sha256").update(v).digest("hex");
export async function passwordHash(
  password: string,
  salt = randomBytes(16).toString("hex"),
) {
  return (
    salt + "." + ((await scrypt(password, salt, 64)) as Buffer).toString("hex")
  );
}
export async function verify(password: string, hash: string) {
  const test = await passwordHash(password, hash.split(".")[0]);
  return (
    test.length === hash.length &&
    timingSafeEqual(Buffer.from(test), Buffer.from(hash))
  );
}
export async function actor() {
  const raw = (await cookies()).get("ppl_session")?.value;
  if (!raw) return null;
  const token = await db().loginToken.findUnique({
    where: { hash: digest(raw) },
    include: { member: { select: { id: true, email: true } } },
  });
  return token && token.expiresAt > new Date() ? token.member : null;
}
export async function issue(memberId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 30 * 86400000);
  await db().loginToken.create({
    data: { memberId, hash: digest(token), expiresAt },
  });
  (await cookies()).set("ppl_session", token, {
    httpOnly: true,
    secure: process.env.VERCEL === "1" || process.env.COOKIE_SECURE === "true",
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}
export async function revoke() {
  const jar = await cookies();
  const raw = jar.get("ppl_session")?.value;
  if (raw) await db().loginToken.deleteMany({ where: { hash: digest(raw) } });
  jar.delete("ppl_session");
}
export function sameSite(req: Request) {
  const raw = req.headers.get("origin");
  if (!raw) return false;
  try {
    const origin = new URL(raw);
    return (
      origin.host === req.headers.get("host") &&
      origin.protocol ===
        (process.env.VERCEL === "1" ? "https:" : new URL(req.url).protocol) &&
      req.headers.get("content-type")?.startsWith("application/json")
    );
  } catch {
    return false;
  }
}
export const fail = (message: string, status: number) =>
  Response.json({ error: message }, { status });
export function unavailable() {
  return process.env.DATABASE_URL
    ? fail("The database is unavailable. Your device copy is safe.", 503)
    : fail(
        "Account sync needs a Neon connection. Add DATABASE_URL in Vercel and redeploy. You can keep training on this device.",
        503,
      );
}
export async function throttle(email: string, request: Request) {
  const ip =
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0] ?? "local";
  const results = await Promise.all(
    [
      ["ip", ip, 60],
      ["email", email, 12],
    ].map(async ([scope, value, limit]) => {
      const key = digest(scope + ":" + value);
      const rows = await db().$queryRaw<
        { count: number }[]
      >`INSERT INTO "AuthAttempt" ("key","count","since") VALUES (${key},1,NOW()) ON CONFLICT ("key") DO UPDATE SET "count"=CASE WHEN "AuthAttempt"."since"<NOW()-interval '15 minutes' THEN 1 ELSE "AuthAttempt"."count"+1 END, "since"=CASE WHEN "AuthAttempt"."since"<NOW()-interval '15 minutes' THEN NOW() ELSE "AuthAttempt"."since" END RETURNING "count"`;
      return rows[0].count <= Number(limit);
    }),
  );
  return results.every(Boolean);
}
