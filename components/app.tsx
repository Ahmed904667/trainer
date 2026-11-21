"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Activity,
  BookOpen,
  CalendarDays,
  CalendarRange,
  ChartNoAxesCombined,
  ChevronRight,
  CloudCheck,
  Dumbbell,
  HardDrive,
  History,
  LayoutDashboard,
  Settings2,
  UserRound,
} from "lucide-react";
import { initialize, useJournal } from "@/lib/store";
import type { Exercise } from "@/lib/library";
import { catalog } from "@/lib/model";
import { Dashboard } from "./dashboard";
import { ExerciseDetail } from "./common";
const Workout = dynamic(() => import("./workout"));
const Library = dynamic(() => import("./library"));
const PlanEditor = dynamic(() => import("./plans"));
const Progress = dynamic(() => import("./progress"));
const HistoryScreen = dynamic(() => import("./history"));
const Settings = dynamic(() => import("./settings"));
const main = [
  { name: "Today", icon: LayoutDashboard },
  { name: "Workout", icon: Dumbbell },
  { name: "Exercises", icon: BookOpen },
  { name: "Progress", icon: ChartNoAxesCombined },
  { name: "History", icon: History },
];
const more = [
  { name: "Plan", icon: CalendarRange },
  { name: "Settings", icon: Settings2 },
];
const labels: Record<string, string> = {
  Today: "Today",
  Workout: "Workout",
  Exercises: "Exercise library",
  Progress: "Progress",
  History: "Workout history",
  Plan: "Training plan",
  Settings: "Settings",
};
const subtitles: Record<string, string> = {
  Today: "Your training dashboard",
  Workout: "Session tracking",
  Exercises: "Movement reference",
  Progress: "Training analytics",
  History: "Completed sessions",
  Plan: "Program management",
  Settings: "Training preferences",
};
function route() {
  const page = decodeURIComponent(location.hash.slice(1));
  return Object.hasOwn(labels, page) ? page : "Today";
}
export default function App() {
  const { journal: j, status, account, error } = useJournal();
  const [page, setPage] = useState("Today"),
    [detail, setDetail] = useState<Exercise | null>(null);
  useEffect(() => {
    void initialize();
    const change = () => {
      setPage(route());
      setDetail(null);
      window.scrollTo(0, 0);
    };
    change();
    window.addEventListener("hashchange", change);
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator)
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = j?.prefs.theme ?? "dark";
  }, [j?.prefs.theme]);
  const go = (name: string) => {
    location.hash = name;
  };
  const nav = (v: (typeof main)[number]) => (
    <a
      key={v.name}
      href={"#" + v.name}
      className={page === v.name ? "selected" : ""}
      aria-current={page === v.name ? "page" : undefined}
    >
      <v.icon size={19} />
      <span>{v.name === "Plan" ? "Training plan" : v.name}</span>
      {v.name === "Workout" && j?.active && <i className="dot" />}
    </a>
  );
  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="#Today">
          <span className="mark">
            <i />
            <i />
            <i />
          </span>
          <span>
            PPL<span className="brand-light"> LOG</span>
          </span>
        </a>
        <div className="side-group">
          <div className="nav-label">Workspace</div>
          <nav>{main.map(nav)}</nav>
        </div>
        <div className="side-group">
          <div className="nav-label">Manage</div>
          <nav>{more.map(nav)}</nav>
        </div>
        <a href="#Settings" className="side-account">
          <span className="avatar">
            <UserRound size={18} />
          </span>
          <span>
            <b>Personal workspace</b>
            <small>{account ? account.email : "Device profile"}</small>
          </span>
        </a>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="crumb">
            <Activity size={16} />
            <span>Workspace</span>
            <ChevronRight size={12} />
            <b>{labels[page]}</b>
          </div>
          <a href="#Today" className="mobile-brand">
            <span className="mark">
              <i />
              <i />
              <i />
            </span>
            PPL LOG
          </a>
          <div className="top-actions">
            <a
              href="#Settings"
              className="sync"
              aria-label={"Sync status: " + status}
            >
              {status === "Synced" ? (
                <CloudCheck size={14} />
              ) : (
                <HardDrive size={14} />
              )}{" "}
              {status}
            </a>
            <a className="mobile-gear" href="#Settings" aria-label="Settings">
              <Settings2 size={18} />
            </a>
          </div>
        </header>
        <main>
          <div className="page-head">
            <div>
              <div className="eyebrow page-context">
                <span />
                {subtitles[page]}
              </div>
              <h1>{labels[page]}</h1>
            </div>
            {j && (
              <div className="date-pill">
                <CalendarDays size={16} />
                {new Date().toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            )}
          </div>
          {!j ? (
            <div className="panel empty" role="status">
              {error || "Opening your journal…"}
            </div>
          ) : (
            <>
              {error && page !== "Settings" && (
                <a className="notice" href="#Settings">
                  {error} · Open settings
                </a>
              )}
              {page === "Today" ? (
                <Dashboard j={j} go={go} detail={setDetail} />
              ) : page === "Workout" ? (
                <Workout j={j} detail={setDetail} go={go} />
              ) : page === "Exercises" ? (
                <Library j={j} detail={setDetail} />
              ) : page === "Progress" ? (
                <Progress j={j} />
              ) : page === "Plan" ? (
                <PlanEditor j={j} />
              ) : page === "History" ? (
                <HistoryScreen j={j} />
              ) : (
                <Settings j={j} />
              )}
            </>
          )}
        </main>
      </div>
      <nav className="bottom-nav">{main.map(nav)}</nav>
      {detail && j && (
        <ExerciseDetail
          ex={detail}
          library={catalog(j)}
          close={() => setDetail(null)}
        />
      )}
    </div>
  );
}
