"use client";
import { useState } from "react";
import { CalendarRange, Download, RefreshCw } from "lucide-react";
import { localDay, type Journal, type Prefs } from "@/lib/model";
import {
  download,
  edit,
  logout,
  resolveConflict,
  sign,
  sync,
  useJournal,
} from "@/lib/store";
import { Field, Modal, Select } from "./common";
import { Button } from "./ui/button";
export default function Settings({ j }: { j: Journal }) {
  const { account, status, conflict, error, configured } = useJournal();
  const [mode, setMode] = useState("login"),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [confirm, setConfirm] = useState(false);
  function pref(v: Partial<Prefs>) {
    void edit((x) => ({ ...x, prefs: { ...x.prefs, ...v } }));
  }
  async function action(fn: () => Promise<void>) {
    setMessage("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="settings-grid">
      <section className="panel form-panel">
        <h2>Training preferences</h2>
        <div className="fields">
          <Select
            label="Weight unit"
            value={j.prefs.unit}
            options={["kg", "lb"]}
            onChange={(v) => pref({ unit: v as Prefs["unit"] })}
          />
          <Select
            label="Theme"
            value={j.prefs.theme}
            options={["dark", "light", "system"]}
            onChange={(v) => pref({ theme: v as Prefs["theme"] })}
          />
        </div>
        <Field label={"Weight increment (" + j.prefs.unit + ")"}>
          <input
            type="number"
            min=".1"
            max="50"
            step=".1"
            defaultValue={j.prefs.increment}
            onBlur={(e) => {
              if (e.target.validity.valid && +e.target.value > 0)
                pref({ increment: +e.target.value });
              else e.target.value = String(j.prefs.increment);
            }}
          />
        </Field>
        <Field label="Default rest for added exercises (seconds)">
          <input
            type="number"
            min="0"
            max="1800"
            defaultValue={j.prefs.rest}
            onBlur={(e) => {
              if (e.target.value && e.target.validity.valid)
                pref({ rest: +e.target.value });
              else e.target.value = String(j.prefs.rest);
            }}
          />
        </Field>
        {(["autoRest", "sound", "suggest"] as const).map((k, i) => (
          <label key={k} className="switch-row">
            <span>
              {
                [
                  "Start rest after each set",
                  "Timer sound",
                  "Progression suggestions",
                ][i]
              }
            </span>
            <input
              type="checkbox"
              checked={j.prefs[k]}
              onChange={(e) => pref({ [k]: e.target.checked })}
            />
          </label>
        ))}
        <h3>Training weekdays</h3>
        <div className="day-buttons">
          {[1, 2, 3, 4, 5, 6, 0].map((d, i) => (
            <button
              key={d}
              aria-pressed={j.prefs.days.includes(d)}
              onClick={() => {
                void edit((x) => {
                  const days = x.prefs.days.includes(d)
                    ? x.prefs.days.filter((v) => v !== d)
                    : [...x.prefs.days, d];
                  if (!days.length) return x;
                  const from = localDay();
                  return {
                    ...x,
                    prefs: {
                      ...x.prefs,
                      days,
                      calendar: [
                        ...x.prefs.calendar.filter((v) => v.from < from),
                        { from, days },
                      ],
                    },
                  };
                });
              }}
            >
              {["M", "T", "W", "T", "F", "S", "S"][i]}
            </button>
          ))}
        </div>
        <a className="text-btn" href="#Plan">
          <CalendarRange size={16} /> Manage workout rotation
        </a>
      </section>
      <div className="stack">
        <section className="panel form-panel">
          <h2>Account &amp; sync</h2>
          <p className="muted">
            {account
              ? account.email
              : "Your journal is stored in this browser. Sign in to sync across devices."}
          </p>
          <div className="sync-label">{status}</div>
          {configured === false && (
            <p className="notice">
              Device-only mode. Add the Neon DATABASE_URL to enable accounts and
              backup.
            </p>
          )}
          {error && (
            <p role="alert" className="notice">
              {error}
            </p>
          )}
          {account && (
            <div className="wrap-actions">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void sync(true)}
              >
                <RefreshCw />
                Retry sync
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => void action(logout)}
              >
                Sign out
              </Button>
            </div>
          )}
          {(!account || error.includes("Sign in")) && configured !== false && (
            <form
              className="stack"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void action(() =>
                  sign(mode, String(f.get("email")), String(f.get("password"))),
                );
              }}
            >
              <Field label="Email">
                <input
                  name="email"
                  autoComplete="email"
                  type="email"
                  required
                />
              </Field>
              <Field label="Password">
                <input
                  name="password"
                  type="password"
                  minLength={10}
                  maxLength={128}
                  autoComplete={
                    mode === "register" ? "new-password" : "current-password"
                  }
                  required
                />
              </Field>
              <Button disabled={busy} type="submit">
                {mode === "login" ? "Sign in" : "Create account"}
              </Button>
              <button
                type="button"
                className="text-btn"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login"
                  ? "Create a new account"
                  : "Use existing account"}
              </button>
            </form>
          )}
          {conflict && (
            <Button variant="secondary" onClick={() => setConfirm(true)}>
              Resolve sync conflict
            </Button>
          )}
          {message && (
            <p role="alert" className="notice">
              {message}
            </p>
          )}
        </section>
        <section className="panel form-panel">
          <h2>Data export</h2>
          <p className="muted">
            Download your journal with workout history, set records, and
            templates.
          </p>
          <Button variant="secondary" onClick={() => download(j)}>
            <Download /> Export journal
          </Button>
        </section>
      </div>
      {confirm && (
        <Modal title="Use the server journal?" close={() => setConfirm(false)}>
          <p>
            A different device saved changes first. Download this device’s
            journal before replacing it with the server version.
          </p>
          <Button
            onClick={() =>
              void action(async () => {
                download(j, "ppl-conflicting-device-copy");
                await resolveConflict();
                setConfirm(false);
              })
            }
          >
            Export device copy and use server
          </Button>
        </Modal>
      )}
    </div>
  );
}
