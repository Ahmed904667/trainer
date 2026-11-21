"use client";
import { useState } from "react";
import {
  BookOpen,
  ChevronRight,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { catalog, exerciseSchema, uid, type Journal } from "@/lib/model";
import { edit } from "@/lib/store";
import type { Exercise } from "@/lib/library";
import { Button } from "./ui/button";
import { Empty, Field, Modal, Select } from "./common";
function Create({ close }: { close: () => void }) {
  const [error, setError] = useState(""),
    [image, setImage] = useState<string>(),
    [loading, setLoading] = useState(false);
  return (
    <Modal title="Custom exercise" close={close}>
      <form
        className="stack"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget),
            read = (k: string) => String(form.get(k) ?? "").trim();
          const ex = exerciseSchema.safeParse({
            id: uid(),
            name: read("name"),
            muscle: read("muscle"),
            secondary: read("secondary")
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean),
            equipment: read("equipment"),
            category: read("category"),
            kind: read("kind"),
            difficulty: "Custom",
            reps: "8–12",
            instructions: read("instructions").split("\n").filter(Boolean),
            posture: "",
            range: "",
            breathing: "",
            mistakes: "",
            safety: "",
            alternatives: [],
            unilateral: form.has("unilateral"),
            notes: read("notes"),
            image,
          });
          if (!ex.success) {
            setError("Review the exercise fields and image size.");
            return;
          }
          await edit((j) => ({ ...j, custom: [...j.custom, ex.data] }));
          close();
        }}
      >
        {["Name", "Muscle", "Secondary muscles", "Equipment"].map((x, i) => (
          <Field key={x} label={x + (i === 2 ? " (comma separated)" : "")}>
            <input
              required={i !== 2}
              maxLength={150}
              name={["name", "muscle", "secondary", "equipment"][i]}
            />
          </Field>
        ))}
        <div className="fields">
          <Field label="Workout category">
            <select name="category">
              {["Push", "Pull", "Legs", "Core"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Movement">
            <select name="kind">
              <option>Compound</option>
              <option>Isolation</option>
            </select>
          </Field>
        </div>
        <Field label="Instructions (one step per line)">
          <textarea name="instructions" required maxLength={4000} />
        </Field>
        <label>
          <input name="unilateral" type="checkbox" /> Reps are per side
        </label>
        <Field label="Notes">
          <input name="notes" maxLength={4000} />
        </Field>
        <Field label="Optional image">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) {
                setImage(undefined);
                return;
              }
              setLoading(true);
              try {
                const bit = await createImageBitmap(f);
                const scale = Math.min(
                  1,
                  320 / Math.max(bit.width, bit.height),
                );
                const c = document.createElement("canvas");
                c.width = Math.max(1, Math.round(bit.width * scale));
                c.height = Math.max(1, Math.round(bit.height * scale));
                c.getContext("2d")!.drawImage(bit, 0, 0, c.width, c.height);
                bit.close();
                setImage(c.toDataURL("image/jpeg", 0.75));
                setError("");
              } catch {
                setError("Choose a readable image file.");
              } finally {
                setLoading(false);
              }
            }}
          />
        </Field>
        {error && <p role="alert">{error}</p>}
        <Button disabled={loading} type="submit">
          Save exercise
        </Button>
      </form>
    </Modal>
  );
}
export default function Library({
  j,
  detail,
}: {
  j: Journal;
  detail: (e: Exercise) => void;
}) {
  const lib = catalog(j);
  const [q, setQ] = useState(""),
    [filters, setFilters] = useState(false),
    [create, setCreate] = useState(false),
    [values, setValues] = useState<Record<string, string>>({});
  const keys = ["muscle", "equipment", "kind", "category"] as const;
  const results = lib.filter(
    (e) =>
      e.name.toLowerCase().includes(q.toLowerCase()) &&
      keys.every((k) => !values[k] || e[k] === values[k]),
  );
  return (
    <div className="stack">
      <div className="toolbar">
        <div className="search">
          <Search size={17} />
          <input
            aria-label="Search exercises"
            value={q}
            placeholder="Search exercises"
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Button variant="secondary" onClick={() => setFilters(!filters)}>
          <SlidersHorizontal />
          Filters
        </Button>
        <Button onClick={() => setCreate(true)}>
          <Plus />
          Custom
        </Button>
      </div>
      {filters && (
        <div className="panel filter-grid">
          {keys.map((k, i) => (
            <Select
              key={k}
              label={
                ["Target muscle", "Equipment", "Movement", "Workout category"][
                  i
                ]
              }
              value={values[k] ?? ""}
              options={[
                ["", "All"],
                ...Array.from(new Set(lib.map((e) => e[k]))).sort(),
              ]}
              onChange={(v) => setValues((a) => ({ ...a, [k]: v }))}
            />
          ))}
        </div>
      )}
      <div className="panel">
        <div className="panel-title">
          <h2>Movements</h2>
          <span className="count">{results.length}</span>
        </div>
        {results.map((ex) => (
          <button
            className="exercise-row"
            key={ex.id}
            onClick={() => detail(ex)}
          >
            <span className="row-number">
              <BookOpen size={17} />
            </span>
            <span className="row-info">
              <strong>{ex.name}</strong>
              <small>
                {ex.muscle} · {ex.equipment}
              </small>
            </span>
            <ChevronRight size={16} />
          </button>
        ))}
        {!results.length && (
          <Empty title="No matching exercises">
            Try a different search or filter.
          </Empty>
        )}
      </div>
      {create && <Create close={() => setCreate(false)} />}
    </div>
  );
}
