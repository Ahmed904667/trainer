import { actor, db, fail, sameSite, unavailable } from "@/lib/server";
import { changeSchema } from "@/lib/wire";
import { exercises } from "@/lib/library";
import type { Session } from "@/lib/model";
import type { Prisma } from "@/lib/generated/prisma/client";
export const dynamic = "force-dynamic";
type Json = Prisma.InputJsonValue;
export async function GET(req: Request) {
  try {
    const user = await actor();
    if (
      !user ||
      (req.headers.has("x-journal-owner") &&
        req.headers.get("x-journal-owner") !== user.id)
    )
      return fail("Sign in to sync.", 401);
    const row = await db().member.findUniqueOrThrow({
      where: { id: user.id },
      select: {
        revision: true,
        preferences: true,
        templates: { orderBy: { position: "asc" } },
        customExercises: true,
        sessions: {
          orderBy: { startedAt: "desc" },
          include: {
            exercises: {
              orderBy: { position: "asc" },
              include: { sets: { orderBy: { position: "asc" } } },
            },
          },
        },
      },
    });
    const all = row.sessions.map((w) => ({
      ...(w.snapshot as object),
      items: w.exercises.map((e) => ({
        ...(e.snapshot as object),
        sets: e.sets.map((s) => s.data),
      })),
    })) as Session[];
    return Response.json({
      revision: row.revision,
      journal: row.preferences
        ? {
            prefs: row.preferences,
            plans: row.templates.map((p) => p.definition),
            custom: row.customExercises.map((e) => e.definition),
            active: all.find((s) => s.ended === null) ?? null,
            history: all.filter((s) => s.ended !== null),
          }
        : null,
    });
  } catch {
    return unavailable();
  }
}
export async function POST(req: Request) {
  if (!sameSite(req)) return fail("Invalid origin", 403);
  try {
    const user = await actor();
    if (
      !user ||
      (req.headers.has("x-journal-owner") &&
        req.headers.get("x-journal-owner") !== user.id)
    )
      return fail("Sign in to sync.", 401);
    const parsed = changeSchema.safeParse(await req.json());
    if (!parsed.success)
      return fail("Invalid workout data. Review your inputs.", 400);
    const { revision, id, config, sessions, removed } = parsed.data;
    if (config) {
      const ids = new Set([...exercises, ...config.custom].map((e) => e.id));
      if (
        !config.plans.some((p) => p.id === config.prefs.next) ||
        config.plans.some((p) => p.items.some((i) => !ids.has(i.exerciseId)))
      )
        return fail("Invalid rotation or exercise reference.", 400);
    }
    const memberId = user.id;
    const result = await db().$transaction(
      async (tx) => {
        const updated = await tx.member.updateMany({
          where: { id: memberId, revision },
          data: {
            revision: { increment: 1 },
            lastChange: id,
            ...(config ? { preferences: config.prefs } : {}),
          },
        });
        if (!updated.count) {
          const latest = await tx.member.findUniqueOrThrow({
            where: { id: memberId },
            select: { revision: true, lastChange: true },
          });
          return latest.lastChange === id ? latest.revision : null;
        }
        if (config) {
          await tx.plan.deleteMany({ where: { memberId } });
          await tx.customExercise.deleteMany({ where: { memberId } });
          await tx.plan.createMany({
            data: config.plans.map((p, position) => ({
              id: p.id,
              memberId,
              position,
              definition: p,
            })),
          });
          if (config.custom.length)
            await tx.customExercise.createMany({
              data: config.custom.map((e) => ({
                id: e.id,
                memberId,
                definition: e,
              })),
            });
        }
        await tx.workout.deleteMany({
          where: {
            memberId,
            id: { in: [...removed, ...sessions.map((s) => s.id)] },
          },
        });
        for (const s of sessions) {
          const { items, ...snapshot } = s;
          await tx.workout.create({
            data: {
              id: s.id,
              memberId,
              active: s.ended === null,
              startedAt: new Date(s.started),
              snapshot,
            },
          });
          if (items.length)
            await tx.workoutExercise.createMany({
              data: items.map((item, position) => ({
                memberId,
                workoutId: s.id,
                id: item.id,
                position,
                snapshot: {
                  id: item.id,
                  target: item.target,
                  exercise: item.exercise,
                  skipped: item.skipped,
                } as Json,
              })),
            });
          const logs = items.flatMap((i) =>
            i.sets.map((set, position) => ({
              memberId,
              workoutId: s.id,
              exerciseId: i.id,
              id: set.id,
              position,
              data: set,
            })),
          );
          if (logs.length) await tx.loggedSet.createMany({ data: logs });
        }
        return revision + 1;
      },
      { timeout: 30000 },
    );
    return result === null
      ? fail("Another device changed this journal.", 409)
      : Response.json({ revision: result });
  } catch {
    return unavailable();
  }
}
