import { z } from "zod";
import { exercises, type Exercise } from "./library";

const id = z.string().min(1).max(160);
const label = z.string().min(1).max(160);
const note = z.string().max(4000);
const n = (max: number) => z.number().nonnegative().max(max);
export const exerciseSchema = z.object({
  id,
  name: label,
  muscle: label,
  secondary: z.array(label).max(20),
  equipment: label,
  kind: z.enum(["Compound", "Isolation"]),
  category: z.enum(["Push", "Pull", "Legs", "Core"]),
  difficulty: label,
  reps: label,
  instructions: z.array(note).max(30),
  posture: note,
  range: note,
  breathing: note,
  mistakes: note,
  safety: note,
  alternatives: z.array(id).max(30),
  unilateral: z.boolean(),
  image: z
    .string()
    .regex(/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/)
    .max(220000)
    .optional(),
  notes: note.optional(),
});
const targetSchema = z
  .object({
    exerciseId: id,
    count: z.int().min(1).max(50),
    min: z.int().min(1).max(200),
    max: z.int().min(1).max(200),
    rest: z.int().min(0).max(1800),
    weight: n(5000).nullable(),
  })
  .refine((x) => x.min <= x.max, "Minimum reps exceed maximum");
export type Target = z.infer<typeof targetSchema>;
export const planSchema = z.object({
  id,
  name: label,
  focus: label,
  notes: note,
  items: z.array(targetSchema).max(100),
});
export type Plan = z.infer<typeof planSchema>;
export const setSchema = z
  .object({
    id,
    weight: n(5000).nullable(),
    reps: z.int().min(1).max(999).nullable(),
    done: z.boolean(),
    at: z.number().nullable(),
    warm: z.boolean(),
    rpe: n(10).nullable(),
    rir: z.int().min(0).max(20).nullable(),
    notes: note,
  })
  .refine(
    (s) => !s.done || (s.weight !== null && s.reps !== null),
    "Completed sets require load and reps",
  );
export type LogSet = z.infer<typeof setSchema>;
const itemSchema = z.object({
  id,
  exercise: exerciseSchema,
  target: targetSchema,
  skipped: z.boolean(),
  sets: z.array(setSchema).max(100),
});
export type Item = z.infer<typeof itemSchema>;
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const sessionSchema = z.object({
  id,
  planId: id,
  name: label,
  focus: label,
  notes: note,
  date: day,
  zone: label,
  started: z.number(),
  ended: z.number().nullable(),
  paused: z.number().nullable(),
  pausedMs: n(1e14),
  restEnd: z.number().nullable(),
  restLeft: n(86400).nullable(),
  restBase: n(1800),
  items: z.array(itemSchema).max(100),
});
export type Session = z.infer<typeof sessionSchema>;
const days = z
  .array(z.int().min(0).max(6))
  .min(1)
  .max(7)
  .refine((x) => new Set(x).size === x.length);
export const prefsSchema = z.object({
  next: id,
  days,
  calendar: z.array(z.object({ from: day, days })).max(5000),
  unit: z.enum(["kg", "lb"]),
  rest: z.int().min(0).max(1800),
  autoRest: z.boolean(),
  sound: z.boolean(),
  suggest: z.boolean(),
  increment: z.number().positive().max(50),
  theme: z.enum(["dark", "light", "system"]),
});
export type Prefs = z.infer<typeof prefsSchema>;
export type Journal = {
  prefs: Prefs;
  plans: Plan[];
  custom: Exercise[];
  active: Session | null;
  history: Session[];
};
export const uid = () => crypto.randomUUID();
export function newSet(
  previous?: LogSet,
  weight: number | null = null,
): LogSet {
  return {
    id: uid(),
    weight: previous?.weight ?? weight,
    reps: previous?.reps ?? null,
    done: false,
    at: null,
    warm: false,
    rpe: null,
    rir: null,
    notes: "",
  };
}
const formats = [
  [
    [3, 6, 10],
    [3, 8, 12],
    [3, 8, 12],
    [3, 12, 15],
    [3, 10, 15],
    [2, 10, 15],
  ],
  [
    [3, 8, 12],
    [3, 8, 12],
    [3, 10, 12],
    [3, 12, 15],
    [3, 10, 12],
    [2, 10, 15],
  ],
  [
    [3, 6, 10],
    [3, 10, 12],
    [3, 12, 15],
    [3, 10, 15],
    [4, 10, 15],
  ],
  [
    [3, 8, 12],
    [3, 8, 12],
    [3, 12, 15],
    [3, 12, 20],
    [3, 8, 12],
    [2, 10, 15],
  ],
  [
    [3, 6, 10],
    [3, 8, 10],
    [3, 10, 12],
    [3, 12, 15],
    [3, 8, 12],
    [2, 10, 15],
  ],
  [
    [3, 6, 10],
    [3, 8, 12],
    [3, 10, 15],
    [2, 8, 12],
    [4, 12, 20],
  ],
];
export function defaultPlans(): Plan[] {
  let index = 0;
  return ["Push A", "Pull A", "Legs A", "Push B", "Pull B", "Legs B"].map(
    (name, p) => ({
      id: name.toLowerCase().replace(" ", "-"),
      name,
      focus: [
        "Chest focus",
        "Back width focus",
        "Quadriceps focus",
        "Shoulder & chest focus",
        "Back thickness focus",
        "Posterior chain focus",
      ][p],
      notes: "",
      items: formats[p].map(([count, min, max]) => {
        const ex = exercises[index++];
        return {
          exerciseId: ex.id,
          count,
          min,
          max,
          rest: ex.kind === "Compound" ? (min === 6 ? 180 : 120) : 90,
          weight: null,
        };
      }),
    }),
  );
}
export function initial(): Journal {
  return {
    prefs: {
      next: "push-a",
      days: [2, 3, 5, 6, 0],
      calendar: [],
      unit: "kg",
      rest: 90,
      autoRest: true,
      sound: false,
      suggest: true,
      increment: 2.5,
      theme: "dark",
    },
    plans: defaultPlans(),
    custom: [],
    active: null,
    history: [],
  };
}
export const catalog = (j: Journal) => [...exercises, ...j.custom];
export function localDay(d = new Date()) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}
export function shifted(d: Date, delta: number) {
  const v = new Date(d);
  v.setDate(v.getDate() + delta);
  return v;
}
export function weekStart(d = new Date()) {
  return shifted(d, -((d.getDay() + 6) % 7));
}
export function scheduled(d: Date, p: Prefs) {
  const date = localDay(d);
  const rule = p.calendar.filter((x) => x.from <= date).at(-1);
  return (
    rule?.days ?? (p.calendar.length ? [2, 3, 5, 6, 0] : p.days)
  ).includes(d.getDay());
}
export function previous(history: Session[], exerciseId: string) {
  for (const s of history) {
    const i = s.items.find(
      (x) =>
        x.exercise.id === exerciseId &&
        !x.skipped &&
        x.sets.some((r) => r.done && !r.warm),
    );
    if (i) return working(i);
  }
  return [];
}
export function makeItem(
  ex: Exercise,
  target: Target,
  history: Session[],
): Item {
  const prev = previous(history, ex.id);
  return {
    id: uid(),
    exercise: structuredClone(ex) as Item["exercise"],
    target: { ...target },
    skipped: false,
    sets: Array.from({ length: target.count }, (_, i) =>
      newSet(prev[i], target.weight),
    ),
  };
}
export function start(j: Journal, plan: Plan, now = new Date()): Journal {
  if (j.active) return j;
  const lib = catalog(j);
  return {
    ...j,
    active: {
      id: uid(),
      planId: plan.id,
      name: plan.name,
      focus: plan.focus,
      notes: plan.notes,
      date: localDay(now),
      zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      started: +now,
      ended: null,
      paused: null,
      pausedMs: 0,
      restEnd: null,
      restLeft: null,
      restBase: j.prefs.rest,
      items: plan.items.map((t) =>
        makeItem(
          lib.find((e) => e.id === t.exerciseId)!,
          t,
          j.history,
        ),
      ),
    },
  };
}
export function finish(j: Journal, id: string, now = Date.now()): Journal {
  const a = j.active;
  if (
    !a ||
    a.id !== id ||
    !a.items.some((i) => !i.skipped && i.sets.some((s) => s.done))
  )
    return j;
  const pos = j.plans.findIndex((p) => p.id === a.planId);
  return {
    ...j,
    active: null,
    prefs: { ...j.prefs, next: j.plans[(pos + 1) % j.plans.length].id },
    history: [
      {
        ...a,
        ended: now,
        paused: null,
        pausedMs: a.pausedMs + (a.paused ? now - a.paused : 0),
        restEnd: null,
        restLeft: null,
      },
      ...j.history,
    ],
  };
}
export const working = (i: Item) =>
  i.skipped ? [] : i.sets.filter((s) => s.done && !s.warm);
export const sets = (s: Session) => s.items.flatMap(working);
export const volume = (s: Session) =>
  sets(s).reduce((a, r) => a + r.weight! * r.reps!, 0);
export const duration = (s: Session, now = Date.now()) =>
  Math.max(
    0,
    Math.floor(((s.paused ?? s.ended ?? now) - s.started - s.pausedMs) / 1000),
  );
export const clock = (sec: number) =>
  [Math.floor(sec / 60), Math.floor(sec % 60)]
    .map((x) => String(x).padStart(2, "0"))
    .join(":");
export const display = (kg: number, unit: Prefs["unit"]) =>
  Number((kg * (unit === "lb" ? 2.20462262 : 1)).toFixed(2));
export const asKg = (value: number, unit: Prefs["unit"]) =>
  unit === "kg" ? value : value / 2.20462262;
export function suggestion(i: Item, j: Journal) {
  const prev = previous(j.history, i.exercise.id);
  if (
    !j.prefs.suggest ||
    prev.length < i.target.count ||
    !prev[0]?.weight ||
    i.exercise.id === "assisted-pull-up"
  )
    return null;
  return prev.every(
    (s) => s.reps! >= i.target.max && s.weight === prev[0].weight,
  )
    ? display(prev[0].weight, j.prefs.unit) + j.prefs.increment
    : null;
}
export function streaks(j: Journal, today = new Date()) {
  const logged = new Set(j.history.map((s) => s.date));
  if (!logged.size) return { current: 0, longest: 0 };
  const earliest = [...logged].sort()[0];
  let current = 0,
    longest = 0;
  for (
    let d = new Date(earliest + "T12:00:00");
    localDay(d) <= localDay(today);
    d = shifted(d, 1)
  ) {
    if (logged.has(localDay(d))) {
      current++;
      longest = Math.max(longest, current);
    } else if (scheduled(d, j.prefs) && localDay(d) !== localDay(today))
      current = 0;
  }
  return { current, longest };
}
export function records(s: Session, history: Session[]) {
  const older = history.filter((h) => h.started < s.started);
  return s.items
    .filter((i) => {
      const current = working(i);
      if (!current.length) return false;
      const prior = older.flatMap((h) =>
        h.items.filter((x) => x.exercise.id === i.exercise.id).flatMap(working),
      );
      return (
        prior.length > 0 &&
        current.some(
          (r) =>
            r.weight! > Math.max(...prior.map((v) => v.weight!)) ||
            (prior.some((v) => v.weight === r.weight) &&
              r.reps! >
                Math.max(
                  ...prior
                    .filter((v) => v.weight === r.weight)
                    .map((v) => v.reps!),
                )),
        )
      );
    })
    .map((i) => i.exercise.name);
}
