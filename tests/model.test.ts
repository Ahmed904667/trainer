import test from "node:test";
import assert from "node:assert/strict";
import { exercises } from "../lib/library";
import {
  asKg,
  defaultPlans,
  display,
  duration,
  finish,
  initial,
  localDay,
  previous,
  records,
  scheduled,
  sessionSchema,
  shifted,
  start,
  streaks,
  suggestion,
  volume,
  type Journal,
} from "../lib/model";
const tuesday = new Date(2026, 10, 17, 9);
function logged(j: Journal, date = tuesday, load = 20, reps = 12) {
  const active = start(
    j,
    j.plans.find((p) => p.id === j.prefs.next)!,
    date,
  );
  active.active!.items[0].sets.forEach((s) =>
    Object.assign(s, { done: true, weight: load, reps, at: +date }),
  );
  return finish(active, active.active!.id, +date + 3600000);
}
test("six templates include the 34 prescribed movements and linked alternatives", () => {
  const plans = defaultPlans();
  assert.equal(exercises.length, 47);
  assert.equal(new Set(exercises.map((e) => e.id)).size, 47);
  assert.deepEqual(
    plans.map((p) => p.items.length),
    [6, 6, 5, 6, 6, 5],
  );
  assert.deepEqual(
    plans.map((p) => p.items.reduce((v, t) => v + t.count, 0)),
    [17, 17, 16, 17, 17, 15],
  );
  for (const e of exercises)
    for (const a of e.alternatives)
      assert.ok(exercises.some((x) => x.id === a));
});
test("rest days, missed sessions and continuous rotation over two weeks", () => {
  let j = initial();
  const workouts: string[] = [];
  const monday = shifted(tuesday, -1);
  for (let i = 0; i < 14; i++) {
    const d = shifted(monday, i);
    assert.equal(scheduled(d, j.prefs), ![1, 4].includes(d.getDay()));
    if (scheduled(d, j.prefs)) {
      workouts.push(j.prefs.next);
      j = logged(j, d);
    }
  }
  assert.deepEqual(workouts, [
    "push-a",
    "pull-a",
    "legs-a",
    "push-b",
    "pull-b",
    "legs-b",
    "push-a",
    "pull-a",
    "legs-a",
    "push-b",
  ]);
  const idle = initial();
  assert.equal(
    start(idle, idle.plans[0], shifted(tuesday, 10)).prefs.next,
    "push-a",
  );
});
test("start, discard, re-entry and retried completion preserve rotation", () => {
  const j = initial(),
    active = start(j, j.plans[0], tuesday);
  assert.equal(active.prefs.next, j.prefs.next);
  assert.equal(start(active, j.plans[1]), active);
  assert.equal(finish(active, active.active!.id), active);
  assert.equal({ ...active, active: null }.prefs.next, j.prefs.next);
  const saved = logged(j);
  assert.equal(finish(saved, saved.history[0].id), saved);
  assert.equal(saved.history.length, 1);
  assert.equal(saved.prefs.next, "pull-a");
  assert.equal(duration(saved.history[0]), 3600);
});
test("snapshots, honest blanks, previous performance and configurable progression", () => {
  let j = initial();
  assert.equal(start(j, j.plans[0]).active!.items[0].sets[0].weight, null);
  j = logged(j, tuesday, 40, 10);
  const a = start(j, j.plans[0], shifted(tuesday, 2)).active!;
  assert.equal(a.items[0].sets[1].weight, 40);
  assert.equal(a.items[0].sets[0].done, false);
  assert.equal(suggestion(a.items[0], j), 42.5);
  assert.equal(
    suggestion(a.items[0], { ...j, prefs: { ...j.prefs, suggest: false } }),
    null,
  );
  j.plans[0].items[0].min = 1;
  assert.equal(j.history[0].items[0].target.min, 6);
  assert.equal(previous(j.history, a.items[0].exercise.id).length, 3);
});
test("set accounting excludes warmups, skips, and unfinished sets", () => {
  const j = logged(initial()),
    s = j.history[0];
  assert.equal(volume(s), 720);
  s.items[0].sets[0].warm = true;
  assert.equal(volume(s), 480);
  s.items[0].sets[1].done = false;
  assert.equal(volume(s), 240);
  s.items[0].skipped = true;
  assert.equal(volume(s), 0);
  s.items[0].sets[2].weight = null;
  assert.equal(sessionSchema.safeParse(s).success, false);
});
test("records and streaks recalculate from history and rest schedules", () => {
  const j = logged(initial());
  j.prefs.next = "push-a";
  const next = logged(j, shifted(tuesday, 1), 25);
  assert.deepEqual(records(next.history[0], next.history), [
    "Barbell Bench Press",
  ]);
  assert.deepEqual(streaks(next, shifted(tuesday, 2)), {
    current: 2,
    longest: 2,
  });
  next.prefs.calendar = [{ from: localDay(shifted(tuesday, 3)), days: [1] }];
  assert.equal(scheduled(tuesday, next.prefs), true);
  assert.equal(scheduled(shifted(tuesday, 3), next.prefs), false);
  assert.equal(display(asKg(100, "lb"), "lb"), 100);
});
