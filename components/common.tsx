"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { X, ChevronDown, Plus, Search } from "lucide-react";
import { Button } from "./ui/button";
import type { Exercise } from "@/lib/library";
export function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    el?.showModal();
    return () => el?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={close}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
    >
      <div className="modal">
        <header>
          <h2>{title}</h2>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Close dialog"
            onClick={close}
          >
            <X size={19} />
          </Button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: (string | [string, string])[];
}) {
  return (
    <Field label={label}>
      <span className="select">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => {
            const [v, n] = Array.isArray(o) ? o : [o, o];
            return (
              <option key={v} value={v}>
                {n}
              </option>
            );
          })}
        </select>
        <ChevronDown size={14} />
      </span>
    </Field>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function Picker({
  library,
  choose,
  close,
}: {
  library: Exercise[];
  choose: (e: Exercise) => void;
  close: () => void;
}) {
  const [q, setQ] = useState("");
  return (
    <Modal title="Choose an exercise" close={close}>
      <div className="search">
        <Search size={17} />
        <input
          aria-label="Search exercises"
          placeholder="Search exercises"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="pick-list">
        {library
          .filter((e) => e.name.toLowerCase().includes(q.toLowerCase()))
          .map((e) => (
            <button
              key={e.id}
              onClick={() => {
                choose(e);
                close();
              }}
            >
              <span>
                {e.name}
                <small>
                  {e.muscle} · {e.equipment}
                </small>
              </span>
              <Plus size={16} />
            </button>
          ))}
      </div>
    </Modal>
  );
}
export function reorder<T>(items: T[], index: number, offset: number) {
  const target = index + offset;
  if (target < 0 || target >= items.length) return items;
  const copy = [...items];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}
export function ExerciseDetail({
  ex,
  library,
  close,
}: {
  ex: Exercise;
  library: Exercise[];
  close: () => void;
}) {
  const [id, setId] = useState(ex.id);
  const e = id === ex.id ? ex : (library.find((x) => x.id === id) ?? ex);
  return (
    <Modal title={e.name} close={close}>
      <div className="tags">
        <span>{e.muscle}</span>
        <span>{e.equipment}</span>
        <span>{e.kind}</span>
      </div>
      {e.image && (
        <Image
          unoptimized
          width={320}
          height={240}
          className="exercise-photo"
          src={e.image}
          alt={e.name}
        />
      )}
      <p className="muted">
        {[
          e.difficulty,
          e.reps + " reps",
          e.secondary.length ? "Also works " + e.secondary.join(", ") : "",
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <h3>How to perform</h3>
      <ol className="steps">
        {e.instructions.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
      {[
        ["Posture", e.posture],
        ["Range of motion", e.range],
        ["Breathing", e.breathing],
        ["Common mistakes", e.mistakes],
        ["Safety", e.safety],
        ["Notes", e.notes],
      ]
        .filter(([, v]) => v)
        .map(([k, v]) => (
          <section className="detail" key={k}>
            <h4>{k}</h4>
            <p>{v}</p>
          </section>
        ))}
      {e.alternatives.length > 0 && (
        <>
          <h3>Alternatives</h3>
          <div className="tags">
            {e.alternatives.map((a) => (
              <button key={a} onClick={() => setId(a)}>
                {library.find((x) => x.id === a)?.name}
              </button>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}
