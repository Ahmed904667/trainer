"use client";
import { useState } from "react";
import {
  ChevronRight,
  Clock3,
  Dumbbell,
  Pencil,
  SlidersHorizontal,
} from "lucide-react";
import {
  catalog,
  clock,
  display,
  duration,
  sets,
  type Journal,
  type Session,
} from "@/lib/model";
import type { Exercise } from "@/lib/library";
import { edit } from "@/lib/store";
import { Button } from "./ui/button";
import { Empty, ExerciseDetail, Field, Modal, Select } from "./common";
import { SessionEditor, Summary } from "./workout";
export default function HistoryScreen({ j }: { j: Journal }) {
  const [id, setId] = useState(""),
    [editing, setEditing] = useState(false),
    [filters, setFilters] = useState(false),
    [kind, setKind] = useState(""),
    [ex, setEx] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [detail, setDetail] = useState<Exercise | null>(null);
  const rows = j.history.filter(
      (s) =>
        (!kind || s.planId === kind) &&
        (!ex || s.items.some((i) => i.exercise.id === ex)) &&
        (!from || s.date >= from) &&
        (!to || s.date <= to),
    ),
    s = j.history.find((x) => x.id === id);
  const update = (fn: (s: Session) => Session) => {
    void edit((x) => ({
      ...x,
      history: x.history.map((h) => (h.id === id ? fn(h) : h)),
    }));
  };
  return (
    <div className="stack">
      <div className="toolbar">
        <span className="muted">{rows.length} completed sessions</span>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setFilters(!filters)}
        >
          <SlidersHorizontal />
          Filters
        </Button>
      </div>
      {filters && (
        <div className="panel filter-grid">
          <Select
            label="Workout"
            value={kind}
            onChange={setKind}
            options={[
              ["", "All workouts"],
              ...new Map(j.history.map((s) => [s.planId, s.name])).entries(),
            ]}
          />
          <Select
            label="Exercise"
            value={ex}
            onChange={setEx}
            options={[
              ["", "All exercises"],
              ...new Map(
                j.history.flatMap((s) =>
                  s.items.map((i) => [i.exercise.id, i.exercise.name] as const),
                ),
              ).entries(),
            ]}
          />
          <Field label="From">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </Field>
          <Field label="Through">
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </Field>
        </div>
      )}
      <div className="panel">
        {rows.length ? (
          rows.map((s) => (
            <button
              className="exercise-row"
              key={s.id}
              onClick={() => {
                setId(s.id);
                setEditing(false);
              }}
            >
              <span className="row-number">
                <Dumbbell size={17} />
              </span>
              <span className="row-info">
                <strong>{s.name}</strong>
                <small>
                  {s.date} ·{" "}
                  {
                    s.items.filter(
                      (i) => !i.skipped && i.sets.some((r) => r.done),
                    ).length
                  }{" "}
                  exercises · {sets(s).length} working sets
                </small>
              </span>
              <span className="time">
                <Clock3 size={14} />
                {clock(duration(s))}
              </span>
              <ChevronRight size={15} />
            </button>
          ))
        ) : (
          <Empty
            title={
              j.history.length
                ? "No matching workouts"
                : "Your training history starts here"
            }
          >
            {j.history.length
              ? "Adjust your filters to see more sessions."
              : "Finish and save a workout to see its sets, duration, and volume here."}
          </Empty>
        )}
      </div>
      {s && (
        <Modal title={s.name} close={() => setId("")}>
          <p className="muted">
            {s.date} ·{" "}
            {new Date(s.started).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: s.zone,
            })}{" "}
            · {s.zone}
          </p>
          <Summary s={s} j={j} />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setEditing(!editing)}
          >
            <Pencil />
            {editing ? "Done editing" : "Edit session"}
          </Button>
          {editing ? (
            <>
              <Field label="Session notes">
                <textarea
                  defaultValue={s.notes}
                  maxLength={4000}
                  onChange={(e) => {
                    const notes = e.target.value;
                    update((v) => ({ ...v, notes }));
                  }}
                />
              </Field>
              <SessionEditor
                historical
                s={s}
                j={j}
                update={update}
                detail={setDetail}
              />
            </>
          ) : (
            <>
              {s.notes && <p>{s.notes}</p>}
              {s.items.map((i) => (
                <div className="detail" key={i.id}>
                  <h4>{i.exercise.name}</h4>
                  <small className="muted">
                    Target {i.target.count} × {i.target.min}–{i.target.max}
                    {i.exercise.unilateral ? " per side" : ""}
                  </small>
                  <p>
                    {i.skipped
                      ? "Skipped"
                      : i.sets
                          .filter((r) => r.done)
                          .map(
                            (r) =>
                              display(r.weight!, j.prefs.unit) +
                              " " +
                              j.prefs.unit +
                              " × " +
                              r.reps +
                              (r.warm ? " (warm-up)" : "") +
                              (r.rpe !== null ? " · RPE " + r.rpe : "") +
                              (r.rir !== null ? " · RIR " + r.rir : "") +
                              (r.notes ? " · " + r.notes : ""),
                          )
                          .join(" / ") || "No completed sets"}
                  </p>
                </div>
              ))}
            </>
          )}
          {detail && (
            <ExerciseDetail
              ex={detail}
              library={catalog(j)}
              close={() => setDetail(null)}
            />
          )}
        </Modal>
      )}
    </div>
  );
}
