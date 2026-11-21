"use client";
import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  GripVertical,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  asKg,
  catalog,
  defaultPlans,
  display,
  planSchema,
  uid,
  type Journal,
  type Plan,
  type Target,
} from "@/lib/model";
import { edit } from "@/lib/store";
import { Button } from "./ui/button";
import { Field, Modal, Picker, reorder, Select } from "./common";
function Editor({ p, j, close }: { p: Plan; j: Journal; close: () => void }) {
  const [draft, set] = useState<Plan>(() => structuredClone(p)),
    [pick, setPick] = useState<number | null>(null),
    [error, setError] = useState("");
  const lib = catalog(j);
  function patch(i: number, v: Partial<Target>) {
    set((d) => ({
      ...d,
      items: d.items.map((x, k) => (i === k ? { ...x, ...v } : x)),
    }));
  }
  return (
    <Modal title="Edit workout template" close={close}>
      <form
        className="stack"
        onSubmit={async (e) => {
          e.preventDefault();
          const check = planSchema.safeParse(draft);
          if (!check.success || !draft.items.length) {
            setError("Add an exercise and check the rep ranges.");
            return;
          }
          await edit((x) => ({
            ...x,
            plans: x.plans.some((t) => t.id === p.id)
              ? x.plans.map((t) => (t.id === p.id ? draft : t))
              : [...x.plans, draft],
          }));
          close();
        }}
      >
        <Field label="Workout name">
          <input
            required
            maxLength={160}
            value={draft.name}
            onChange={(e) => set({ ...draft, name: e.target.value })}
          />
        </Field>
        <Field label="Training focus">
          <input
            required
            maxLength={160}
            value={draft.focus}
            onChange={(e) => set({ ...draft, focus: e.target.value })}
          />
        </Field>
        {draft.items.map((t, i) => (
          <div className="plan-item" key={i}>
            <div className="split">
              <button
                type="button"
                className="text-btn"
                onClick={() => setPick(i)}
              >
                {lib.find((e) => e.id === t.exerciseId)?.name}
                <Pencil size={13} />
              </button>
              <div className="inline-actions">
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={!i}
                  aria-label="Move up"
                  onClick={() =>
                    set({ ...draft, items: reorder(draft.items, i, -1) })
                  }
                >
                  <ArrowUp />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={i === draft.items.length - 1}
                  aria-label="Move down"
                  onClick={() =>
                    set({ ...draft, items: reorder(draft.items, i, 1) })
                  }
                >
                  <ArrowDown />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Remove exercise"
                  onClick={() =>
                    set({
                      ...draft,
                      items: draft.items.filter((_, k) => k !== i),
                    })
                  }
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
            <div className="target-fields">
              {(["count", "min", "max", "rest", "weight"] as const).map(
                (key, k) => (
                  <Field
                    key={key}
                    label={
                      [
                        "Sets",
                        "Min reps",
                        "Max reps",
                        "Rest (s)",
                        j.prefs.unit,
                      ][k]
                    }
                  >
                    <input
                      required={key !== "weight"}
                      type="number"
                      min={k >= 3 ? 0 : 1}
                      max={[50, 200, 200, 1800, 10000][k]}
                      step={key === "weight" ? "any" : "1"}
                      value={
                        key === "weight" && t.weight !== null
                          ? display(t.weight, j.prefs.unit)
                          : (t[key] ?? "")
                      }
                      onChange={(e) =>
                        patch(i, {
                          [key]:
                            key === "weight"
                              ? e.target.value
                                ? asKg(+e.target.value, j.prefs.unit)
                                : null
                              : +e.target.value,
                        })
                      }
                    />
                  </Field>
                ),
              )}
            </div>
          </div>
        ))}
        <Button variant="secondary" onClick={() => setPick(-1)}>
          <Plus /> Add exercise
        </Button>
        <Field label="Workout notes">
          <textarea
            maxLength={4000}
            value={draft.notes}
            onChange={(e) => set({ ...draft, notes: e.target.value })}
          />
        </Field>
        {error && <p className="notice">{error}</p>}
        <Button type="submit">Save template</Button>
      </form>
      {pick !== null && (
        <Picker
          library={lib}
          close={() => setPick(null)}
          choose={(e) => {
            if (pick === -1)
              set({
                ...draft,
                items: [
                  ...draft.items,
                  {
                    exerciseId: e.id,
                    count: 3,
                    min: 8,
                    max: 12,
                    rest: j.prefs.rest,
                    weight: null,
                  },
                ],
              });
            else patch(pick, { exerciseId: e.id });
          }}
        />
      )}
    </Modal>
  );
}
export default function PlanEditor({ j }: { j: Journal }) {
  const [editPlan, setEdit] = useState<Plan | null>(null),
    [reset, setReset] = useState(false);
  return (
    <div className="stack">
      <div className="panel form-panel">
        <h2>Rotation order</h2>
        <p className="muted">
          Each saved session moves the rotation to the following workout.
        </p>
        <Select
          label="Next workout"
          value={j.prefs.next}
          options={j.plans.map((p) => [p.id, p.name])}
          onChange={(next) =>
            void edit((x) => ({ ...x, prefs: { ...x.prefs, next } }))
          }
        />
        <a className="text-btn" href="#Settings">
          Edit training weekdays
        </a>
      </div>
      <div className="panel">
        <div className="panel-title">
          <h2>Workout templates</h2>
          <Button
            size="sm"
            onClick={() =>
              setEdit({
                id: uid(),
                name: "",
                focus: "Custom focus",
                notes: "",
                items: [],
              })
            }
          >
            <Plus /> New template
          </Button>
        </div>
        {j.plans.map((p, i) => (
          <div className="plan-row" key={p.id}>
            <GripVertical className="muted" size={16} />
            <div className="row-info">
              <b>{p.name}</b>
              <small>
                {p.focus} · {p.items.length} exercises
              </small>
            </div>
            <div className="inline-actions">
              <Button
                variant="ghost"
                size="icon"
                disabled={!i}
                aria-label={"Move " + p.name + " up"}
                onClick={() =>
                  void edit((x) => ({ ...x, plans: reorder(x.plans, i, -1) }))
                }
              >
                <ArrowUp />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={i === j.plans.length - 1}
                aria-label={"Move " + p.name + " down"}
                onClick={() =>
                  void edit((x) => ({ ...x, plans: reorder(x.plans, i, 1) }))
                }
              >
                <ArrowDown />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={"Duplicate " + p.name}
                onClick={() =>
                  setEdit({
                    ...structuredClone(p),
                    id: uid(),
                    name: p.name + " copy",
                  })
                }
              >
                <Copy />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                aria-label={"Edit " + p.name}
                onClick={() => setEdit(p)}
              >
                <Pencil />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button variant="ghost" onClick={() => setReset(true)}>
        <RotateCcw />
        Restore default templates
      </Button>
      {editPlan && (
        <Editor p={editPlan} j={j} close={() => setEdit(null)} />
      )}{" "}
      {reset && (
        <Modal title="Restore the six templates?" close={() => setReset(false)}>
          <p>
            This replaces your rotation and sets Push A as the next workout.
            Saved sessions keep their original exercises.
          </p>
          <Button
            onClick={() => {
              void edit((x) => ({
                ...x,
                plans: defaultPlans(),
                prefs: { ...x.prefs, next: "push-a" },
              }));
              setReset(false);
            }}
          >
            Restore defaults
          </Button>
        </Modal>
      )}
    </div>
  );
}
