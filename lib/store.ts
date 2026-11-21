"use client";
import { useSyncExternalStore } from "react";
import { initial, type Journal, type Session, uid } from "./model";
import type { Change } from "./wire";
type Account = { id: string; email: string };
type Copy = {
  journal: Journal;
  revision: number;
  dirty: string[];
  outbox: Change | null;
};
type State = {
  journal: Journal | null;
  account: Account | null;
  status: string;
  conflict: boolean;
  error: string;
  configured: boolean | null;
};
const boot: State = {
  journal: null,
  account: null,
  status: "Opening journal",
  conflict: false,
  error: "",
  configured: null,
};
let state = boot,
  database: Promise<IDBDatabase>,
  channel: BroadcastChannel | undefined,
  timer: ReturnType<typeof setTimeout>,
  syncing = false;
const listeners = new Set<() => void>();
const listen = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
function show(delta: Partial<State>) {
  state = { ...state, ...delta };
  listeners.forEach((fn) => fn());
}
export const useJournal = () =>
  useSyncExternalStore(
    listen,
    () => state,
    () => boot,
  );
const key = () => state.account?.id ?? "device";
const localStatus = () =>
  navigator.onLine ? "Saved on device" : "Offline · saved locally";
function connection() {
  return (database ??= new Promise((resolve, reject) => {
    const req = indexedDB.open("ppl-training-journal", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("copies");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
}
const fresh = (): Copy => ({
  journal: initial(),
  revision: 0,
  dirty: [],
  outbox: null,
});
async function transaction(owner: string, fn?: (copy: Copy) => Copy) {
  const db = await connection();
  return new Promise<Copy>((resolve, reject) => {
    const tx = db.transaction("copies", fn ? "readwrite" : "readonly");
    const store = tx.objectStore("copies");
    const req = store.get(owner);
    let result: Copy;
    req.onsuccess = () => {
      try {
        result = req.result ?? fresh();
        if (fn) {
          result = fn(result);
          store.put(result, owner);
        }
      } catch (e) {
        tx.abort();
        reject(e);
      }
    };
    tx.oncomplete = () => resolve(result);
    tx.onabort = tx.onerror = () =>
      reject(tx.error ?? new Error("Device storage failed"));
  });
}
const all = (j: Journal) => [...(j.active ? [j.active] : []), ...j.history];
const changed = (a: Journal, b: Journal) => {
  const old = new Map(all(a).map((s) => [s.id, s]));
  const ids: string[] = [];
  for (const s of all(b)) {
    if (old.get(s.id) !== s) ids.push(s.id);
    old.delete(s.id);
  }
  return [
    ...(a.prefs !== b.prefs || a.custom !== b.custom || a.plans !== b.plans
      ? ["config"]
      : []),
    ...ids,
    ...old.keys(),
  ];
};
function schedule() {
  clearTimeout(timer);
  timer = setTimeout(() => void sync(), 850);
}
function announce() {
  channel?.postMessage("refresh");
}
export async function edit(fn: (j: Journal) => Journal) {
  const owner = key();
  try {
    const result = await transaction(owner, (c) => {
      const j = fn(c.journal);
      return {
        ...c,
        journal: j,
        dirty: [...new Set([...c.dirty, ...changed(c.journal, j)])],
      };
    });
    if (key() === owner) {
      show({ journal: result.journal, status: localStatus() });
      announce();
      schedule();
    }
  } catch {
    show({
      error: "Device storage failed. Keep this tab open and export a backup.",
      status: "Save failed",
    });
  }
}
function payload(c: Copy): Change {
  const { prefs, plans, custom } = c.journal;
  const map = new Map(all(c.journal).map((s) => [s.id, s]));
  const ids = c.dirty.filter((id) => id !== "config");
  return {
    id: uid(),
    revision: c.revision,
    ...(c.dirty.includes("config") ? { config: { prefs, plans, custom } } : {}),
    sessions: ids.map((id) => map.get(id)).filter((s): s is Session => !!s),
    removed: ids.filter((id) => !map.has(id)),
  };
}
async function json(url: string, body?: unknown, owner?: string) {
  const resp = await fetch(url, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(owner ? { "X-Journal-Owner": owner } : {}),
    },
    ...(body ? { method: "POST", body: JSON.stringify(body) } : {}),
  });
  const data = await resp.json();
  if (!resp.ok)
    throw Object.assign(new Error(data.error || "Request failed"), {
      status: resp.status,
    });
  return data;
}
type Remote = { revision: number; journal: Journal | null };
export async function sync(refresh = false) {
  if (!state.account || syncing || state.conflict || !navigator.onLine) return;
  const owner = key();
  syncing = true;
  try {
    const c = await transaction(owner, (c) =>
      !c.outbox && c.dirty.length ? { ...c, outbox: payload(c), dirty: [] } : c,
    );
    if (c.outbox) {
      show({ status: "Syncing" });
      const r = await json("/api/sync", c.outbox, owner);
      const latest = await transaction(owner, (d) =>
        d.outbox?.id === c.outbox?.id
          ? { ...d, revision: r.revision, outbox: null }
          : d,
      );
      if (key() === owner) {
        show({
          status: latest.dirty.length ? localStatus() : "Synced",
          error: "",
        });
        announce();
        if (latest.dirty.length) schedule();
      }
    } else if (refresh) {
      const remote: Remote = await json("/api/sync", undefined, owner);
      if (key() !== owner) return;
      const merged = await transaction(owner, (d) =>
        !d.outbox &&
        !d.dirty.length &&
        remote.revision > d.revision &&
        remote.journal
          ? { ...d, journal: remote.journal, revision: remote.revision }
          : d,
      );
      show({
        journal: merged.journal,
        status: merged.dirty.length ? localStatus() : "Synced",
      });
      if (merged.dirty.length) schedule();
    }
  } catch (e) {
    if (key() !== owner) return;
    const err = e as Error & { status: number };
    show({
      status:
        err.status === 409
          ? "Sync conflict"
          : navigator.onLine
            ? "Sync needs attention"
            : localStatus(),
      conflict: err.status === 409,
      error: err.message,
    });
  } finally {
    syncing = false;
  }
}
export async function resolveConflict() {
  const owner = key();
  const r: Remote = await json("/api/sync", undefined, owner);
  if (!r.journal || key() !== owner) return;
  const j = r.journal;
  await transaction(owner, () => ({
    journal: j,
    revision: r.revision,
    dirty: [],
    outbox: null,
  }));
  show({ journal: j, status: "Synced", conflict: false, error: "" });
  announce();
}
export function download(value: unknown, name = "ppl-journal") {
  const a = document.createElement("a");
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  a.href = url;
  a.download = name + ".json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function select(account: Account) {
  const remote: Remote = await json("/api/sync", undefined, account.id);
  const guest = await transaction("device");
  const c = await transaction(account.id, (d) => {
    if (d.dirty.length || d.outbox) return d;
    if (remote.journal)
      return {
        journal: remote.journal,
        revision: remote.revision,
        dirty: [],
        outbox: null,
      };
    return {
      journal: guest.journal,
      revision: 0,
      dirty: ["config", ...all(guest.journal).map((s) => s.id)],
      outbox: null,
    };
  });
  localStorage.setItem("ppl-account", JSON.stringify(account));
  show({
    account,
    journal: c.journal,
    conflict: false,
    error: "",
    status: localStatus(),
  });
  if (!remote.journal) await transaction("device", fresh);
  announce();
  schedule();
}
export async function sign(action: string, email: string, password: string) {
  const { account } = await json("/api/auth", { action, email, password });
  await select(account);
}
export async function logout() {
  const c = await transaction(key());
  if (c.dirty.length || c.outbox)
    throw new Error("Sync your changes before signing out.");
  await json("/api/auth", { action: "logout" });
  await transaction(key(), fresh);
  localStorage.removeItem("ppl-account");
  const guest = await transaction("device");
  show({
    account: null,
    journal: guest.journal,
    status: localStatus(),
    error: "",
    conflict: false,
  });
  announce();
}
async function reload() {
  try {
    const raw = localStorage.getItem("ppl-account");
    const account = raw ? JSON.parse(raw) : null;
    const c = await transaction(account?.id ?? "device");
    show({
      journal: c.journal,
      account,
      status:
        account && !c.dirty.length && !c.outbox && navigator.onLine
          ? "Synced"
          : localStatus(),
    });
  } catch {
    show({
      error: "The journal could not open device storage.",
      status: "Storage unavailable",
    });
  }
}
let initialized = false;
export async function initialize() {
  if (initialized) return;
  initialized = true;
  await reload();
  if (typeof BroadcastChannel !== "undefined") {
    channel = new BroadcastChannel("ppl-updates");
    channel.onmessage = () => void reload();
  }
  window.addEventListener("online", () => {
    show({ status: localStatus() });
    void sync(true);
  });
  window.addEventListener("offline", () => show({ status: localStatus() }));
  window.addEventListener("focus", () => void sync(true));
  window.addEventListener("storage", () => void reload());
  try {
    const r = await json("/api/auth");
    show({ configured: r.configured });
    if (r.account && r.account.id !== state.account?.id)
      await select(r.account);
    else if (state.account) await sync(true);
  } catch {
    /* Device journal remains available offline. */
  }
}
