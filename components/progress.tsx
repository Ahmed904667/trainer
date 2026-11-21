"use client";
import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  catalog,
  display,
  localDay,
  records,
  scheduled,
  sets,
  shifted,
  streaks,
  volume,
  weekStart,
  working,
  type Journal,
} from "@/lib/model";
import { Empty, Select } from "./common";
export default function Progress({ j }: { j: Journal }) {
  const [range, setRange] = useState("30"),
    [metric, setMetric] = useState("Top weight"),
    [group, setGroup] = useState("Week");
  const lib = catalog(j),
    [id, setId] = useState(j.history[0]?.items[0]?.exercise.id ?? lib[0].id);
  const unit = j.prefs.unit,
    now = new Date(),
    first =
      range === "all"
        ? (j.history.at(-1)?.date ?? localDay())
        : localDay(shifted(now, 1 - Number(range)));
  const rows = j.history.filter((s) => s.date >= first).reverse(),
    streak = streaks(j);
  const named = lib.find((e) => e.id === id),
    e1rm = named?.kind === "Compound" && id !== "assisted-pull-up";
  const points = rows.flatMap((s) => {
    const r = s.items
      .filter((i) => i.exercise.id === id)
      .flatMap(working)
      .filter(
        (r) =>
          metric !== "Estimated 1RM" ||
          !e1rm ||
          (r.reps! <= 10 && r.weight! > 0),
      );
    return r.length
      ? [
          {
            date: s.date.slice(5),
            value: display(
              Math.max(
                ...r.map(
                  (x) =>
                    x.weight! *
                    (metric === "Estimated 1RM" && e1rm ? 1 + x.reps! / 30 : 1),
                ),
              ),
              unit,
            ),
          },
        ]
      : [];
  });
  const groups: Record<string, number> = {},
    muscles: Record<string, number> = {};
  const weightReps = new Map<number, number>();
  let max = 0,
    estimate = 0,
    volumeEx = 0,
    count = 0;
  for (const s of rows) {
    const groupKey =
      group === "Week"
        ? localDay(weekStart(new Date(s.date + "T12:00:00")))
        : s.date.slice(0, 7);
    groups[groupKey] = (groups[groupKey] ?? 0) + display(volume(s), unit);
    for (const i of s.items) {
      const logged = working(i);
      muscles[i.exercise.muscle] =
        (muscles[i.exercise.muscle] ?? 0) + logged.length;
      if (i.exercise.id !== id) continue;
      for (const r of logged) {
        const w = display(r.weight!, unit);
        max = Math.max(max, w);
        if (r.reps! <= 10)
          estimate = Math.max(estimate, w * (1 + r.reps! / 30));
        weightReps.set(w, Math.max(weightReps.get(w) ?? 0, r.reps!));
        volumeEx += w * r.reps!;
        count++;
      }
    }
  }
  const [weight, setWeight] = useState("");
  const bestWeight =
    weightReps.has(Number(weight)) && weight !== "" ? Number(weight) : max;
  let opportunities = 0,
    attended = 0;
  const dates = new Set(rows.map((s) => s.date));
  for (
    let d = new Date(first + "T12:00:00");
    localDay(d) <= localDay(now);
    d = shifted(d, 1)
  ) {
    if (scheduled(d, j.prefs)) {
      opportunities++;
      if (dates.has(localDay(d))) attended++;
    }
  }
  const chart = (data: { date: string; value: number }[], line: boolean) => {
    const axes = (
      <>
        <CartesianGrid
          stroke="var(--border)"
          strokeDasharray="3 5"
          vertical={false}
        />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted)" }} />
        <YAxis width={48} tick={{ fontSize: 11, fill: "var(--muted)" }} />
        <Tooltip
          contentStyle={{
            background: "var(--panel)",
            borderColor: "var(--border)",
          }}
        />
      </>
    );
    return data.length ? (
      <div className="chart">
        <ResponsiveContainer width="100%" height="100%">
          {line ? (
            <LineChart data={data}>
              {axes}
              <Line
                dataKey="value"
                name={unit}
                stroke="var(--lime)"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
              {axes}
              <Bar
                dataKey="value"
                name={unit}
                fill="var(--lime)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    ) : (
      <Empty title="No recorded sets yet">
        Log a working set in this period to chart your performance.
      </Empty>
    );
  };
  const prs = rows.flatMap((s) => records(s, j.history));
  return (
    <div className="stack">
      <div className="range-tabs">
        {[
          ["7", "7 days"],
          ["30", "30 days"],
          ["90", "90 days"],
          ["365", "1 year"],
          ["all", "All time"],
        ].map(([v, l]) => (
          <button
            key={v}
            aria-pressed={range === v}
            onClick={() => setRange(v)}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="metric-grid panel">
        {[
          ["Workouts", rows.length],
          ["Working sets", rows.reduce((v, s) => v + sets(s).length, 0)],
          [
            "Volume · " + unit,
            Math.round(
              rows.reduce((v, s) => v + display(volume(s), unit), 0),
            ).toLocaleString(),
          ],
          ["Personal records", prs.length],
        ].map(([k, v]) => (
          <div key={k}>
            <small>{k}</small>
            <b>{v}</b>
          </div>
        ))}
      </div>
      <section className="panel form-panel">
        <h2>Strength progression</h2>
        <div className="fields">
          <Select
            label="Exercise"
            value={id}
            options={lib.map((e) => [e.id, e.name])}
            onChange={setId}
          />
          <Select
            label="Metric"
            value={e1rm ? metric : "Top weight"}
            options={e1rm ? ["Top weight", "Estimated 1RM"] : ["Top weight"]}
            onChange={setMetric}
          />
        </div>
        {chart(points, true)}
        <div className="summary-line">
          Top load{" "}
          <b>
            {max} {unit}
          </b>{" "}
          · {count} working sets · {Math.round(volumeEx)} {unit} volume
          {e1rm &&
            estimate > 0 &&
            " · Best estimated 1RM " + Math.round(estimate) + " " + unit}
        </div>
        {weightReps.size > 0 && (
          <>
            <Select
              label={"Recorded load (" + unit + ")"}
              value={String(bestWeight)}
              options={[...weightReps.keys()].sort((a, b) => a - b).map(String)}
              onChange={setWeight}
            />
            <p>Best at this load · {weightReps.get(bestWeight)} reps</p>
          </>
        )}
      </section>
      <div className="settings-grid">
        <section className="panel form-panel">
          <h2>Training volume</h2>
          <Select
            label="Group by"
            value={group}
            options={["Week", "Month"]}
            onChange={setGroup}
          />
          {chart(
            Object.entries(groups).map(([date, v]) => ({
              date,
              value: Math.round(v),
            })),
            false,
          )}
        </section>
        <section className="panel form-panel">
          <h2>Consistency</h2>
          <p>
            <b>
              {attended} / {opportunities}
            </b>{" "}
            scheduled days trained
          </p>
          <div className="track">
            <i
              style={{
                width:
                  (opportunities ? (100 * attended) / opportunities : 0) + "%",
              }}
            />
          </div>
          {[
            [
              "This week",
              j.history.filter((s) => s.date >= localDay(weekStart())).length,
            ],
            [
              "This month",
              j.history.filter((s) => s.date.startsWith(localDay().slice(0, 7)))
                .length,
            ],
            ["Current streak", streak.current + " days"],
            ["Longest streak", streak.longest + " days"],
            ["Lifetime workouts", j.history.length],
          ].map(([k, v]) => (
            <div key={k} className="week-metrics">
              <span>{k}</span>
              <b>{v}</b>
            </div>
          ))}
        </section>
      </div>
      <section className="panel form-panel">
        <h2>Working sets by primary muscle</h2>
        {Object.entries(muscles).filter(([, n]) => n > 0).length ? (
          Object.entries(muscles)
            .filter(([, n]) => n > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([k, n]) => (
              <div key={k}>
                <div className="split">
                  <span>{k}</span>
                  <b>{n}</b>
                </div>
                <div className="track">
                  <i
                    style={{
                      width:
                        (100 * n) / Math.max(...Object.values(muscles)) + "%",
                    }}
                  />
                </div>
              </div>
            ))
        ) : (
          <p className="muted">Completed working sets appear here.</p>
        )}
      </section>
    </div>
  );
}
