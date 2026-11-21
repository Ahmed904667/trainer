import { z } from "zod";
import {
  actor,
  db,
  fail,
  issue,
  passwordHash,
  revoke,
  sameSite,
  throttle,
  unavailable,
  verify,
} from "@/lib/server";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return Response.json({
      account: await actor(),
      configured: Boolean(process.env.DATABASE_URL),
    });
  } catch {
    return unavailable();
  }
}
const credentials = z.object({
  action: z.enum(["login", "register"]),
  email: z
    .email()
    .max(254)
    .transform((x) => x.trim().toLowerCase()),
  password: z.string().min(10).max(128),
});
export async function POST(req: Request) {
  if (!sameSite(req)) return fail("Invalid origin", 403);
  try {
    const body = await req.json();
    if (body.action === "logout") {
      await revoke();
      return Response.json({ ok: true });
    }
    const data = credentials.safeParse(body);
    if (!data.success)
      return fail(
        "Enter a valid email and a password of 10–128 characters.",
        400,
      );
    const { action, email, password } = data.data;
    if (!(await throttle(email, req)))
      return fail("Too many attempts. Try again in 15 minutes.", 429);
    let account;
    if (action === "register") {
      try {
        account = await db().member.create({
          data: { email, passwordHash: await passwordHash(password) },
          select: { id: true, email: true },
        });
      } catch (e) {
        if ((e as { code?: string }).code === "P2002")
          return fail(
            "This account could not be created. Try signing in.",
            409,
          );
        throw e;
      }
    } else {
      const row = await db().member.findUnique({ where: { email } });
      const good = await verify(
        password,
        row?.passwordHash ??
          "00000000000000000000000000000000." + "0".repeat(128),
      );
      if (!row || !good) return fail("Email or password is incorrect.", 401);
      account = { id: row.id, email: row.email };
    }
    await issue(account.id);
    return Response.json({ account });
  } catch {
    return unavailable();
  }
}
