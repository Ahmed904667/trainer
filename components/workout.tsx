"use client";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  Dumbbell,
  Flag,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipForward,
  Timer,
  Trash2,
} from "lucide-react";
import type { Exercise } from "@/lib/library";
import {
  asKg,
  catalog,
  clock,
  display,
  duration,
  finish,
  localDay,
  makeItem,
  newSet,
  previous,
  records,
  sets,
  start,
  suggestion,
  volume,
  type Item,
  type Journal,
  type LogSet,
  type Session,
} from "@/lib/model";
import { edit } from "@/lib/store";
import { Button } from "./ui/button";
import { Empty, Field, Modal, Picker, reorder, Select } from "./common";
export type Update = (fn: (s: Session) => Session) => void;
let audioContext: AudioContext | undefined;
function unlockSound() {
  try {
    audioContext ??= new AudioContext();
    void audioContext.resume();
  } catch {
    /* The visual timer also signals the end. */
  }
}
function signal(sound: boolean) {
  navigator.vibrate?.([120, 80, 120]);
  if (!sound || !audioContext) return;
  try {
    const osc = audioContext.createOscillator(),
      gain = audioContext.createGain();
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 0.22);
  } catch {
    /* Audio is optional. */
  }
}
function useTime() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);
  return now;
}
function Rest({
  s,
  update,
  sound,
}: {
  s: Session;
  update: Update;
  sound: boolean;
}) {
  const now = useTime(),
    left =
      s.restEnd === null
        ? s.restLeft
        : Math.max(0, Math.ceil((s.restEnd - now) / 1000)),
    finished = left === 0;
  useEffect(() => {
    if (s.restEnd !== null && s.restEnd <= now) {
      signal(sound);
      update((a) =>
        a.restEnd === s.restEnd ? { ...a, restEnd: null, restLeft: 0 } : a,
      );
    }
  }, [s.restEnd, now, sound, update]);
  const run = (seconds: number) => {
    if (sound) unlockSound();
    update((a) => ({
      ...a,
      restEnd: Date.now() + 1000 * seconds,
      restLeft: null,
    }));
  };
  return (
    <div className="rest-strip">
      <Timer size={18} />
      <span>
        {finished ? "Rest complete" : "Rest timer"}{" "}
        <b aria-live={finished ? "polite" : "off"}>
          {clock(left ?? s.restBase)}
        </b>
      </span>
      <div className="inline-actions">
        <Button
          size="icon"
          variant="ghost"
          aria-label={s.restEnd ? "Pause rest" : "Start rest"}
          onClick={() =>
            s.restEnd
              ? update((a) => ({ ...a, restEnd: null, restLeft: left }))
              : run(left || s.restBase)
          }
        >
          {s.restEnd ? <Pause /> : <Play />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            s.restEnd
              ? run((left ?? 0) + 30)
              : update((a) => ({ ...a, restLeft: (left ?? s.restBase) + 30 }))
          }
        >
          +30s
        </Button>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Reset rest timer"
          onClick={() =>
            update((a) => ({ ...a, restEnd: null, restLeft: a.restBase }))
          }
        >
          <RotateCcw />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Skip rest"
          onClick={() =>
            update((a) => ({ ...a, restEnd: null, restLeft: null }))
          }
        >
          <SkipForward />
        </Button>
      </div>
    </div>
  );
}
export function SessionEditor({
  s,
  j,
  update,
  detail,
  historical = false,
}: {
  s: Session;
  j: Journal;
  update: Update;
  detail: (e: Exercise) => void;
  historical?: boolean;
}) {
  const [open, setOpen] = useState(
      s.items.find((i) => !i.skipped && i.sets.some((r) => !r.done))?.id ??
        s.items[0]?.id,
    ),
    [more, setMore] = useState(""),
    [options, setOptions] = useState(""),
    [pick, setPick] = useState(""),
    [error, setError] = useState("");
  const lib = catalog(j),
    unit = j.prefs.unit,
    prior = j.history.filter((v) => v.started < s.started);
  function item(id: string, fn: (v: Item) => Item) {
    update((a) => ({
      ...a,
      items: a.items.map((i) => (i.id === id ? fn(i) : i)),
    }));
  }
  function patch(i: string, id: string, delta: Partial<LogSet>) {
    item(i, (v) => ({
      ...v,
      sets: v.sets.map((r) => {
        if (r.id !== id) return r;
        const result = { ...r, ...delta };
        if (result.weight === null || result.reps === null) {
          result.done = false;
          result.at = null;
        }
        return result;
      }),
    }));
  }
  function toggle(i: Item, r: LogSet) {
    if (!r.done && (r.weight === null || r.reps === null)) {
      setError("Enter a weight and reps first. Use 0 for bodyweight.");
      return;
    }
    setError("");
    if (j.prefs.sound) unlockSound();
    update((a) => {
      const now = Date.now();
      return {
        ...a,
        ...(!historical && !r.done && j.prefs.autoRest && i.target.rest > 0
          ? {
              restEnd: now + i.target.rest * 1000,
              restLeft: null,
              restBase: i.target.rest,
            }
          : {}),
        items: a.items.map((v) =>
          v.id === i.id
            ? {
                ...v,
                sets: v.sets.map((x) =>
                  x.id === r.id
                    ? { ...x, done: !r.done, at: r.done ? null : now }
                    : x,
                ),
              }
            : v,
        ),
      };
    });
  }
  return (
    <div className="stack">
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
      {s.items.map((i, index) => {
        const expanded = open === i.id,
          prev = previous(prior, i.exercise.id),
          suggested = suggestion(i, { ...j, history: prior }),
          complete = i.sets.filter((r) => r.done).length;
        return (
          <section
            className={"panel log-card " + (i.skipped ? "skipped" : "")}
            key={i.id}
          >
            <button
              className="log-header"
              aria-expanded={expanded}
              onClick={() => setOpen(expanded ? "" : i.id)}
            >
              <span className="row-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="row-info">
                <strong>{i.exercise.name}</strong>
                <small>
                  {i.exercise.muscle} ·{" "}
                  {i.skipped
                    ? "Skipped"
                    : complete + "/" + i.sets.length + " sets"}
                </small>
              </span>
              <ChevronDown size={17} className={expanded ? "up" : ""} />
            </button>
            {expanded && (
              <div className="log-body">
                <div className="log-target">
                  <span>
                    {i.target.count} sets × {i.target.min}–{i.target.max} reps
                    {i.exercise.unilateral ? " per side" : ""}
                  </span>
                  <span>
                    <Timer size={14} /> {i.target.rest}s rest
                  </span>
                </div>
                <div className="inline-actions">
                  <button
                    className="text-btn"
                    onClick={() => detail(i.exercise)}
                  >
                    <BookOpen size={14} /> Technique
                  </button>
                  <button
                    className="text-btn"
                    onClick={() => setOptions(options === i.id ? "" : i.id)}
                  >
                    <MoreHorizontal size={16} /> Exercise options
                  </button>
                </div>
                {options === i.id && (
                  <div className="wrap-actions">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setPick(i.id)}
                    >
                      Replace
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={index === 0}
                      aria-label="Move exercise up"
                      onClick={() =>
                        update((a) => ({
                          ...a,
                          items: reorder(a.items, index, -1),
                        }))
                      }
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={index === s.items.length - 1}
                      aria-label="Move exercise down"
                      onClick={() =>
                        update((a) => ({
                          ...a,
                          items: reorder(a.items, index, 1),
                        }))
                      }
                    >
                      <ArrowDown />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        item(i.id, (v) => ({ ...v, skipped: !v.skipped }))
                      }
                    >
                      {i.skipped ? "Include exercise" : "Skip exercise"}
                    </Button>
                  </div>
                )}
                {i.skipped ? (
                  <p className="muted">Excluded from session totals.</p>
                ) : (
                  <>
                    <p className="prev-line">
                      {prev.length
                        ? "Last session · " +
                          prev
                            .map(
                              (r) => display(r.weight!, unit) + " × " + r.reps,
                            )
                            .join(", ") +
                          " " +
                          unit
                        : "First session · Enter your working weight"}
                    </p>
                    {suggested !== null && (
                      <p className="notice">
                        Rep target reached. Consider {suggested} {unit} next
                        time.
                      </p>
                    )}
                    <div className="set-grid grid-labels">
                      <span>Set</span>
                      <span>Last</span>
                      <span>{unit}</span>
                      <span>Reps</span>
                      <span>Done</span>
                    </div>
                    {i.sets.map((r, k) => (
                      <div key={r.id}>
                        <div
                          className={"set-grid " + (r.done ? "set-done" : "")}
                        >
                          <button
                            aria-label={"Set " + (k + 1) + " options"}
                            className="set-no"
                            onClick={() => setMore(more === r.id ? "" : r.id)}
                          >
                            {r.warm ? "W" : k + 1}
                            <ChevronDown size={10} />
                          </button>
                          <small>
                            {prev[k]
                              ? display(prev[k].weight!, unit) +
                                "×" +
                                prev[k].reps
                              : "—"}
                          </small>
                          <input
                            aria-label={"Weight for set " + (k + 1)}
                            type="number"
                            inputMode="decimal"
                            min="0"
                            step="any"
                            placeholder="—"
                            key={unit}
                            defaultValue={
                              r.weight === null ? "" : display(r.weight, unit)
                            }
                            onChange={(e) => {
                              const v = e.target.valueAsNumber;
                              patch(i.id, r.id, {
                                weight:
                                  Number.isFinite(v) &&
                                  v >= 0 &&
                                  asKg(v, unit) <= 5000
                                    ? asKg(v, unit)
                                    : null,
                              });
                            }}
                          />
                          <input
                            aria-label={"Reps for set " + (k + 1)}
                            type="number"
                            inputMode="numeric"
                            min="1"
                            max="999"
                            placeholder="—"
                            defaultValue={r.reps ?? ""}
                            onChange={(e) => {
                              const v = e.target.valueAsNumber;
                              patch(i.id, r.id, {
                                reps:
                                  Number.isInteger(v) && v > 0 && v <= 999
                                    ? v
                                    : null,
                              });
                            }}
                          />
                          <button
                            aria-label={
                              (r.done ? "Unmark" : "Complete") +
                              " set " +
                              (k + 1)
                            }
                            aria-pressed={r.done}
                            className="done-btn"
                            onClick={() => toggle(i, r)}
                          >
                            <Check size={18} />
                          </button>
                        </div>
                        {more === r.id && (
                          <div className="set-options">
                            <label>
                              <input
                                type="checkbox"
                                checked={r.warm}
                                onChange={(e) =>
                                  patch(i.id, r.id, { warm: e.target.checked })
                                }
                              />{" "}
                              Warm-up set
                            </label>
                            <div className="fields">
                              <Field label="RPE">
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step=".5"
                                  defaultValue={r.rpe ?? ""}
                                  onChange={(e) =>
                                    patch(i.id, r.id, {
                                      rpe:
                                        e.target.value &&
                                        e.target.validity.valid
                                          ? +e.target.value
                                          : null,
                                    })
                                  }
                                />
                              </Field>
                              <Field label="RIR">
                                <input
                                  type="number"
                                  min="0"
                                  max="20"
                                  defaultValue={r.rir ?? ""}
                                  onChange={(e) =>
                                    patch(i.id, r.id, {
                                      rir:
                                        e.target.value &&
                                        e.target.validity.valid
                                          ? +e.target.value
                                          : null,
                                    })
                                  }
                                />
                              </Field>
                            </div>
                            <Field label="Set notes">
                              <input
                                defaultValue={r.notes}
                                maxLength={4000}
                                onChange={(e) =>
                                  patch(i.id, r.id, { notes: e.target.value })
                                }
                              />
                            </Field>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                item(i.id, (v) => ({
                                  ...v,
                                  sets: v.sets.filter((x) => x.id !== r.id),
                                }))
                              }
                            >
                              <Trash2 /> Delete set
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={i.sets.length >= 100}
                      onClick={() =>
                        item(i.id, (v) => ({
                          ...v,
                          sets: [...v.sets, newSet(v.sets.at(-1))],
                        }))
                      }
                    >
                      <Plus /> Add set
                    </Button>
                  </>
                )}
              </div>
            )}
          </section>
        );
      })}
      <Button
        variant="secondary"
        disabled={s.items.length >= 100}
        onClick={() => setPick("add")}
      >
        <Plus /> Add exercise
      </Button>
      {pick && (
        <Picker
          library={lib}
          close={() => setPick("")}
          choose={(ex) => {
            const existing = s.items.find((i) => i.id === pick),
              target = existing?.target ?? {
                count: 3,
                min: 8,
                max: 12,
                weight: null,
                rest: j.prefs.rest,
              };
            const fresh = makeItem(
              ex,
              { ...target, exerciseId: ex.id, weight: null },
              prior,
            );
            update((a) => ({
              ...a,
              items: existing
                ? a.items.map((i) => (i.id === existing.id ? fresh : i))
                : [...a.items, fresh],
            }));
            setOpen(fresh.id);
          }}
        />
      )}
    </div>
  );
}
export function Summary({ s, j }: { s: Session; j: Journal }) {
  const prev = j.history.find(
      (x) => x.planId === s.planId && x.started < s.started,
    ),
    prs = records(s, j.history);
  const value = display(volume(s), j.prefs.unit),
    diff = value - (prev ? display(volume(prev), j.prefs.unit) : 0);
  return (
    <>
      <div className="metric-grid">
        <div>
          <small>Duration</small>
          <b>{clock(duration(s))}</b>
        </div>
        <div>
          <small>Exercises logged</small>
          <b>
            {
              s.items.filter((i) => !i.skipped && i.sets.some((x) => x.done))
                .length
            }
          </b>
        </div>
        <div>
          <small>Working sets</small>
          <b>{sets(s).length}</b>
        </div>
        <div>
          <small>Volume · {j.prefs.unit}</small>
          <b>{Math.round(value).toLocaleString()}</b>
        </div>
      </div>
      <p className="muted">
        {prev
          ? (diff >= 0 ? "+" : "") +
            Math.round(diff) +
            " " +
            j.prefs.unit +
            " volume vs. previous " +
            s.name
          : "First recorded " + s.name + " session."}
      </p>
      {prs.length > 0 && (
        <p className="notice">Personal records · {prs.join(", ")}</p>
      )}
    </>
  );
}
export default function Workout({
  j,
  detail,
  go,
}: {
  j: Journal;
  detail: (e: Exercise) => void;
  go: (v: string) => void;
}) {
  const [id, setId] = useState(j.prefs.next),
    [modal, setModal] = useState(""),
    now = useTime(),
    s = j.active;
  const update: Update = (fn) => {
    void edit((x) =>
      x.active && x.active.id === s?.id ? { ...x, active: fn(x.active) } : x,
    );
  };
  if (!s) {
    const p = j.plans.find((x) => x.id === id) ?? j.plans[0];
    return (
      <div className="panel form-panel">
        <Dumbbell className="accent" />
        <h2>Start a session</h2>
        <Select
          label="Workout template"
          value={p.id}
          options={j.plans.map((x) => [x.id, x.name])}
          onChange={setId}
        />
        <p className="muted">
          {p.focus} · {p.items.length} exercises
        </p>
        <Button
          disabled={!p.items.length}
          onClick={() => void edit((x) => start(x, p))}
        >
          <Play /> Start workout
        </Button>
      </div>
    );
  }
  return (
    <div className="session-page">
      <section className="panel session-title">
        <div>
          <div className="eyebrow accent">
            <span className="dot" />
            {s.paused ? "Timer paused" : "Active session"}
          </div>
          <h2>{s.name}</h2>
          <p>{s.focus}</p>
        </div>
        <div className="inline-actions">
          <span className="time">
            <Clock3 size={16} />
            {clock(duration(s, now))}
          </span>
          <Button
            size="icon"
            variant="secondary"
            aria-label={
              s.paused ? "Resume session timer" : "Pause session timer"
            }
            onClick={() =>
              update((a) =>
                a.paused
                  ? {
                      ...a,
                      pausedMs: a.pausedMs + Date.now() - a.paused,
                      paused: null,
                    }
                  : { ...a, paused: Date.now() },
              )
            }
          >
            {s.paused ? <Play /> : <Pause />}
          </Button>
        </div>
      </section>
      <Rest s={s} update={update} sound={j.prefs.sound} />
      <SessionEditor key={s.id} s={s} j={j} update={update} detail={detail} />
      <div className="session-footer">
        <Button variant="ghost" onClick={() => setModal("discard")}>
          Discard
        </Button>
        <Button onClick={() => setModal("finish")}>
          <Flag /> Finish workout
        </Button>
      </div>
      {modal === "discard" && (
        <Modal title="Discard this workout?" close={() => setModal("")}>
          <p>
            The active session and its sets will be removed. Your rotation stays
            on the current workout.
          </p>
          <div className="wrap-actions">
            <Button variant="secondary" onClick={() => setModal("")}>
              Keep training
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await edit((x) =>
                  x.active?.id === s.id ? { ...x, active: null } : x,
                );
                setModal("");
                go("Today");
              }}
            >
              Discard workout
            </Button>
          </div>
        </Modal>
      )}
      {modal === "finish" && (
        <Modal title={"Finish " + s.name} close={() => setModal("")}>
          <p className="muted">{s.date || localDay()}</p>
          <Summary s={s} j={j} />
          <Field label="Session notes">
            <textarea
              defaultValue={s.notes}
              maxLength={4000}
              onChange={(e) => {
                const notes = e.target.value;
                update((a) => ({ ...a, notes }));
              }}
            />
          </Field>
          {!s.items.some((i) => !i.skipped && i.sets.some((r) => r.done)) ? (
            <Empty title="No completed sets">
              Complete a set to save your workout.
            </Empty>
          ) : (
            <Button
              onClick={async () => {
                await edit((x) => finish(x, s.id));
                setModal("");
                go("History");
              }}
            >
              <Check /> Finish and save
            </Button>
          )}
        </Modal>
      )}
    </div>
  );
}
