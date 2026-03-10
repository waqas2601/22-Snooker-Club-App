"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FiDollarSign,
  FiActivity,
  FiSquare,
  FiUsers,
  FiTrendingUp,
  FiClock,
  FiBarChart2,
} from "react-icons/fi";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { useMenuToggle } from "@/components/layout/AppShell";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import LiveTablesGrid from "@/components/dashboard/LiveTablesGrid";
import TodayActivity from "@/components/dashboard/TodayActivity";
import OutstandingDebts from "@/components/dashboard/OutstandingDebts";
import { getStoredUser } from "@/lib/storage/auth.storage";
import { getTables } from "@/lib/storage/tables.storage";
import { getSessions, getTodayStats } from "@/lib/storage/payments.storage";
import { getDebts } from "@/lib/storage/debts.storage";
import { getPlayers } from "@/lib/storage/players.storage";
import type {
  ClubUser,
  Table,
  CompletedSession,
  TodayStats,
  DebtsRecord,
} from "@/types";

// ── Greeting based on time ───────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  if (h < 21) return "Good Evening";
  return "Good Night";
}

// ── Format live clock ────────────────────────────────────────────
function formatClock(d: Date): string {
  return d.toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

// ── Quick insights ───────────────────────────────────────────────
function getInsights(sessions: CompletedSession[], tables: Table[]) {
  const todaySessions = sessions.filter(
    (s) => new Date(s.endTime).toISOString().split("T")[0] === todayStr(),
  );

  // Most popular game
  const gameCounts: Record<string, number> = {};
  todaySessions.forEach((s) => {
    gameCounts[s.gameType] = (gameCounts[s.gameType] ?? 0) + 1;
  });
  const popularGame = Object.entries(gameCounts).sort((a, b) => b[1] - a[1])[0];

  // Avg per session
  const avg =
    todaySessions.length > 0
      ? Math.round(
          todaySessions.reduce((s, sess) => s + sess.totalAmount, 0) /
            todaySessions.length,
        )
      : 0;

  // Busiest table
  const tableCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    tableCounts[s.tableName] = (tableCounts[s.tableName] ?? 0) + 1;
  });
  const busiestTable = Object.entries(tableCounts).sort(
    (a, b) => b[1] - a[1],
  )[0];

  return { popularGame, avg, busiestTable };
}

// ================================================================
// INNER PAGE
// ================================================================
function DashboardInner({ user }: { user: ClubUser }) {
  const toggleMenu = useMenuToggle();

  const [tables, setTables] = useState<Table[]>([]);
  const [sessions, setSessions] = useState<CompletedSession[]>([]);
  const [todayStats, setTodayStats] = useState<TodayStats>({
    revenue: 0,
    sessions: 0,
    date: "",
  });
  const [debts, setDebts] = useState<DebtsRecord>({});
  const [tick, setTick] = useState(0);
  const [clock, setClock] = useState("");
  const [activePlayers, setActivePlayers] = useState(0);

  // ── Load data ────────────────────────────────────────────────
  const loadData = useCallback(() => {
    const allTables = getTables(user.email, user);
    const allSess = getSessions(user.email);
    const today = getTodayStats(user.email);
    const allDebts = getDebts(user.email);
    const allPlayers = getPlayers(user.email);

    // Reset today stats if date changed
    const isToday = today.date === todayStr();
    const stats = isToday
      ? today
      : { revenue: 0, sessions: 0, date: todayStr() };

    setTables(allTables);
    setSessions(allSess);
    setTodayStats(stats);
    setDebts(allDebts);

    // Active players = unique registered players in active sessions
    const names = new Set<string>();
    allTables
      .filter((t) => t.status === "occupied")
      .forEach((t) =>
        t.session?.players
          .filter((p) => p.isRegistered)
          .forEach((p) => names.add(p.name)),
      );
    setActivePlayers(names.size);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── 1-second tick ────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setClock(formatClock(new Date()));
      // Reload tables every tick for live data
      setTables(getTables(user.email, user));
    }, 1000);
    setClock(formatClock(new Date()));
    return () => clearInterval(id);
  }, [user]);

  // Today's sessions (completed today)
  const todaySessions = sessions.filter(
    (s) => new Date(s.endTime).toISOString().split("T")[0] === todayStr(),
  );

  const occupied = tables.filter((t) => t.status === "occupied").length;
  const insights = getInsights(sessions, tables);
  const debtTotal = Object.values(debts).reduce((s, a) => s + a, 0);

  return (
    <>
      {/* ── Header ──────────────────────────────────────── */}
      <PageHeader
        title="Dashboard"
        subtitle={`${getGreeting()}, ${user.owner_name.split(" ")[0]}`}
        onMenuClick={toggleMenu}
        statusPill={<Badge label={clock} variant="blue" small />}
      />

      {/* ── Page body ───────────────────────────────────── */}
      <div className="flex-1 p-4 lg:p-6 space-y-6">
        {/* ── Welcome banner ──────────────────────────── */}
        <div
          className="
          relative overflow-hidden rounded-2xl p-5
          bg-gradient-to-br from-blue-600 to-blue-800
          shadow-xl shadow-blue-500/20
        "
        >
          {/* Background decoration */}
          <div
            className="absolute top-0 right-0 w-40 h-40
            bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"
          />
          <div
            className="absolute bottom-0 left-20 w-24 h-24
            bg-white/5 rounded-full translate-y-1/2"
          />

          <div className="relative">
            <p className="text-blue-200 text-xs font-medium uppercase tracking-widest mb-1">
              {getGreeting()}
            </p>
            <h2 className="text-white text-xl font-bold">{user.club_name}</h2>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-blue-200 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {user.location}
              </span>
              <span className="flex items-center gap-1.5 text-blue-200 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                {tables.length} Tables
              </span>
              {occupied > 0 && (
                <span className="flex items-center gap-1.5 text-blue-200 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  {occupied} Active Now
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Stat cards ──────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard
            label="Today's Revenue"
            value={todayStats.revenue}
            prefix="Rs."
            icon={FiDollarSign}
            iconColor="text-emerald-500"
            iconBg="bg-emerald-500/10"
            trend="Cash collected today"
          />
          <StatCard
            label="Sessions Today"
            value={todayStats.sessions}
            icon={FiActivity}
            iconColor="text-blue-500"
            iconBg="bg-blue-500/10"
            trend={`${occupied} active now`}
          />
          <StatCard
            label="Tables Occupied"
            value={occupied}
            suffix={`/ ${tables.length}`}
            icon={FiSquare}
            iconColor="text-red-500"
            iconBg="bg-red-500/10"
            trend={occupied > 0 ? "Tables in use" : "All tables free"}
          />
          <StatCard
            label="Active Players"
            value={activePlayers}
            icon={FiUsers}
            iconColor="text-purple-500"
            iconBg="bg-purple-500/10"
            trend="Registered players playing"
          />
        </div>

        {/* ── Live tables ─────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-theme-primary font-bold text-sm flex items-center gap-2">
              <FiSquare className="text-blue-500" />
              Live Tables
            </h2>
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <LiveTablesGrid tables={tables} tick={tick} />
        </div>

        {/* ── Quick insights ───────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              icon: FiTrendingUp,
              color: "text-blue-500",
              bg: "bg-blue-500/10",
              label: "Most Popular Game",
              value: insights.popularGame
                ? `${insights.popularGame[0]} (${insights.popularGame[1]}x)`
                : "No data yet",
            },
            {
              icon: FiBarChart2,
              color: "text-purple-500",
              bg: "bg-purple-500/10",
              label: "Avg per Session",
              value: insights.avg > 0 ? `Rs. ${insights.avg}` : "No data yet",
            },
            {
              icon: FiClock,
              color: "text-orange-500",
              bg: "bg-orange-500/10",
              label: "Busiest Table",
              value: insights.busiestTable
                ? `${insights.busiestTable[0]} (${insights.busiestTable[1]} sessions)`
                : "No data yet",
            },
          ].map((insight) => (
            <div
              key={insight.label}
              className="card-theme p-4 flex items-center gap-3"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center
                justify-center shrink-0 ${insight.bg}`}
              >
                <insight.icon className={`text-lg ${insight.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-theme-muted text-[10px] uppercase tracking-wider">
                  {insight.label}
                </p>
                <p className="text-theme-primary text-sm font-bold mt-0.5 truncate">
                  {insight.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Outstanding debts ───────────────────────── */}
        {debtTotal > 0 && <OutstandingDebts debts={debts} />}

        {/* ── Today's activity ────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-theme-primary font-bold text-sm flex items-center gap-2">
              <FiActivity className="text-blue-500" />
              Today's Sessions
              {todaySessions.length > 0 && (
                <Badge
                  label={String(todaySessions.length)}
                  variant="blue"
                  small
                />
              )}
            </h2>
          </div>
          <TodayActivity sessions={todaySessions} />
        </div>
      </div>
    </>
  );
}

// ================================================================
// MAIN EXPORT
// ================================================================
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<ClubUser | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      router.push("/login");
      return;
    }
    setUser(stored);
  }, [router]);

  if (!user) return null;

  return (
    <AppShell user={user}>
      <DashboardInner user={user} />
    </AppShell>
  );
}
