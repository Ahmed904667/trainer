"use client";
import {
  Activity,
  CalendarDays,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  Dumbbell,
  Flame,
  Layers3,
  ListChecks,
  Moon,
  Play,
  Repeat2,
  SlidersHorizontal,
  Target,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  catalog,
  display,
  localDay,
  previous,
  scheduled,
  shifted,
  start,
  streaks,
  weekStart,
  type Journal,
  type Plan,
} from "@/lib/model";
import type { Exercise } from "@/lib/library";
import { edit } from "@/lib/store";
export function Dashboard({
  j,
  go,
  detail,
}: {
  j: Journal;
  go: (v: string) => void;
  detail: (e: Exercise) => void;
}) {
  const now = new Date(),
    today = localDay(now),
    week = weekStart(now),
    active = j.active,
    done = j.history.find((s) => s.date === today);
  const plan =
    j.plans.find(
      (p) => p.id === (active?.planId ?? done?.planId ?? j.prefs.next),
    ) ?? j.plans[0];
  const lib = catalog(j),
    items =
      active?.items.map((i) => ({
        target: i.target,
        ex: i.exercise,
        done: i.skipped || i.sets.every((s) => s.done),
      })) ??
      done?.items.map((i) => ({
        target: i.target,
        ex: i.exercise,
        done: i.sets.some((s) => s.done),
      })) ??
      plan.items.map((t) => ({
        target: t,
        ex: lib.find((e) => e.id === t.exerciseId)!,
        done: false,
      }));
  const rest = !scheduled(now, j.prefs) && !active && !done;
  const count = items.reduce((v, i) => v + i.target.count, 0),
    minutes = Math.max(
      5,
      Math.round(
        items.reduce((v, i) => v + i.target.count * (45 + i.target.rest), 0) /
          300,
      ) * 5,
    );
  const weekLogs = j.history.filter(
    (s) => s.date >= localDay(week) && s.date <= today,
  );
  const goal = Array.from({ length: 7 }, (_, i) => shifted(week, i)).filter(
    (d) => scheduled(d, j.prefs),
  ).length;
  function launch(p: Plan) {
    if (!active) void edit((j) => start(j, p));
    go("Workout");
  }
  const selected = j.plans.findIndex((p) => p.id === j.prefs.next);
  const title = rest ? "Rest day" : (active?.name ?? done?.name ?? plan.name);
  return (
    <div className="dashboard">
      <div className="main-column">
        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow accent">
              <span className="dot" />
              {active
                ? "In progress"
                : done
                  ? "Workout complete"
                  : rest
                    ? "Recovery day"
                    : "Scheduled workout"}
            </div>
            <h2>{title}</h2>
            <p>
              {rest
                ? "Next up · " + plan.name
                : (active?.focus ?? done?.focus ?? plan.focus)}
            </p>
            {!rest && (
              <small className="hero-muscles">
                {[...new Set(items.map((i) => i.ex.muscle))].join(" · ")}
              </small>
            )}
            <div className="hero-stats">
              <span>
                <Dumbbell />
                {items.length} exercises
              </span>
              <span>
                <Layers3 />
                {count} sets
              </span>
              <span>
                <Clock3 />~{minutes} min
              </span>
            </div>
            <Button
              onClick={() =>
                rest
                  ? go("Plan")
                  : done && !active
                    ? go("History")
                    : launch(plan)
              }
            >
              {rest ? (
                <CalendarDays />
              ) : done && !active ? (
                <CircleCheck />
              ) : (
                <Play fill="currentColor" />
              )}
              {rest
                ? "View training plan"
                : active
                  ? "Resume workout"
                  : done
                    ? "View workout"
                    : "Start workout"}
            </Button>
          </div>
        </section>
        <section className="panel lineup">
          <div className="panel-title">
            <div>
              <div className="eyebrow muted">Session plan</div>
              <h2>{rest ? "Next workout exercises" : "Exercise lineup"}</h2>
            </div>
            <button
              className="mini-control"
              aria-label="Edit workout plan"
              onClick={() => go("Plan")}
            >
              <SlidersHorizontal size={17} />
            </button>
          </div>
          {items.map(({ target: t, ex, done: completed }, i) => {
            const prev = previous(j.history, ex.id);
            return (
              <button
                className="exercise-row"
                key={i}
                onClick={() => detail(ex)}
              >
                <span className="row-number">
                  {completed ? (
                    <Check size={16} />
                  ) : (
                    String(i + 1).padStart(2, "0")
                  )}
                </span>
                <span className="row-info">
                  <strong>{ex.name}</strong>
                  <small>
                    {ex.muscle}
                    {prev.length
                      ? " · Last " +
                        display(prev[0].weight!, j.prefs.unit) +
                        " " +
                        j.prefs.unit
                      : ""}
                  </small>
                </span>
                <span className="set-chip">
                  {t.count} × {t.min}–{t.max}
                  {ex.unilateral ? " / side" : ""}
                </span>
                <ChevronRight className="row-chevron" size={15} />
              </button>
            );
          })}
        </section>
      </div>
      <aside className="right-column">
        <section className="panel week-card">
          <div className="panel-title">
            <h2>This week</h2>
            <CalendarDays className="muted" size={18} />
          </div>
          <div className="week-range">
            {week.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}{" "}
            –{" "}
            {shifted(week, 6).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="week-strip">
            {Array.from({ length: 7 }, (_, i) => {
              const d = shifted(week, i),
                date = localDay(d),
                logged = weekLogs.some((s) => s.date === date);
              return (
                <div
                  key={i}
                  className={date === today ? "current" : ""}
                  title={
                    d.toLocaleDateString() +
                    " · " +
                    (logged
                      ? "Completed"
                      : scheduled(d, j.prefs)
                        ? "Training"
                        : "Rest")
                  }
                >
                  <small>{["M", "T", "W", "T", "F", "S", "S"][i]}</small>
                  <b>{d.getDate()}</b>
                  <i
                    className={
                      logged
                        ? "logged"
                        : scheduled(d, j.prefs)
                          ? "train"
                          : "off"
                    }
                  />
                </div>
              );
            })}
          </div>
          <div className="week-goal">
            <span>Weekly workouts</span>
            <strong>
              {weekLogs.length} <em>/ {goal}</em>
            </strong>
          </div>
          <div className="track">
            <i
              style={{
                width:
                  Math.min(100, (weekLogs.length / Math.max(1, goal)) * 100) +
                  "%",
              }}
            />
          </div>
          <div className="week-metrics">
            <span>
              <Flame size={16} /> Current streak
            </span>
            <b>{streaks(j).current} days</b>
          </div>
          <div className="week-metrics">
            <span>
              <ListChecks size={16} /> Total workouts
            </span>
            <b>{j.history.length}</b>
          </div>
          {rest && (
            <div className="week-metrics">
              <span>Last workout</span>
              <b>{j.history[0]?.name ?? "None yet"}</b>
            </div>
          )}
        </section>
        <section className="panel rotation">
          <div className="panel-title">
            <h2>Workout rotation</h2>
            <Repeat2 className="muted" size={18} />
          </div>
          <div className="rotation-list">
            {j.plans.map((p, i) => {
              const I = [Dumbbell, Activity, Layers3][i % 3];
              return (
                <div
                  key={p.id}
                  className={
                    "rotation-row " + (i === selected ? "selected" : "")
                  }
                >
                  <div className="rotation-icon">
                    <I size={16} />
                  </div>
                  <span>{p.name}</span>
                  {i === selected && (
                    <small>
                      <span className="dot" />
                      {active ? "Current" : "Up next"}
                    </small>
                  )}
                </div>
              );
            })}
          </div>
          <button className="panel-link" onClick={() => go("Plan")}>
            <Target size={16} /> Manage plan <ChevronRight size={15} />
          </button>
        </section>
        {rest && (
          <Button variant="secondary" onClick={() => launch(plan)}>
            <Moon size={16} />
            Train on rest day
          </Button>
        )}
      </aside>
    </div>
  );
}
