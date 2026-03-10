"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FiDollarSign,
  FiActivity,
  FiClock,
  FiPieChart,
  FiBarChart2,
  FiHash,
  FiSearch,
  FiAlertCircle,
} from "react-icons/fi";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { useMenuToggle } from "@/components/layout/AppShell";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import { getStoredUser } from "@/lib/storage/auth.storage";
import { getSessions, getTodayStats } from "@/lib/storage/payments.storage";
import type { ClubUser, CompletedSession } from "@/types";
// Recharts imports
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ── Payment methods ─────────────────────────────────────────────
const PAYMENT_METHODS = [
  { label: "All", value: "" },
  { label: "Cash", value: "Cash" },
  { label: "EasyPaisa", value: "EasyPaisa" },
  { label: "JazzCash", value: "JazzCash" },
  { label: "OnCredit", value: "OnCredit" },
];

const DATE_FILTERS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Week", value: "week" },
  { label: "All Time", value: "all" },
];

// ── Chart colors map ─────────────────────────────────────────────
export const PIE_COLORS: Record<string, string> = {
  Cash: "#10b981",
  EasyPaisa: "#8b5cf6",
  JazzCash: "#f59e42",
  OnCredit: "#f97316",
  // fallback keys supported
};

export const GAME_COLORS: Record<string, string> = {
  "Per Hour": "#3b82f6",
  "Full Frame": "#10b981",
  "6 Balls": "#8b5cf6",
  "3 Balls": "#f59e42",
  "1 Ball": "#ef4444",
  // fallback keys supported
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function weekAgoDate() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
}

function dayAgoDate(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function yesterdayStr() {
  return dayAgoDate(1).toISOString().split("T")[0];
}

// ── Group sessions by date ──────────────────────────────────────
function groupByDate(sessions: CompletedSession[]) {
  const groups: Record<string, CompletedSession[]> = {};
  sessions.forEach((s) => {
    const date = formatDate(s.endTime);
    if (!groups[date]) groups[date] = [];
    groups[date].push(s);
  });
  return groups;
}

// ── Summaries ───────────────────────────���───────────────────────
function paymentSummary(sessions: CompletedSession[]) {
  return {
    total: sessions.reduce((s, sess) => s + sess.totalAmount, 0),
    cash: sessions
      .filter((s) => s.paymentMethod === "Cash")
      .reduce((s, sess) => s + sess.totalAmount, 0),
    digital: sessions
      .filter(
        (s) =>
          s.paymentMethod === "EasyPaisa" || s.paymentMethod === "JazzCash",
      )
      .reduce((s, sess) => s + sess.totalAmount, 0),
    credit: sessions
      .filter((s) => s.paymentMethod === "OnCredit")
      .reduce((s, sess) => s + sess.totalAmount, 0),
    count: sessions.length,
  };
}

// ── Chart data builders ─────────────────────────────────────────
function buildRevenueBar(sessions: CompletedSession[], days = 7) {
  // Get last N dates
  const today = new Date();
  const dates = Array.from({ length: days }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - i - 1));
    return d.toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
    });
  });
  // Summarize revenue by date
  const byDate: Record<string, number> = {};
  sessions.forEach((s) => {
    const date = new Date(s.endTime).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
    });
    byDate[date] = (byDate[date] ?? 0) + s.totalAmount;
  });
  return dates.map((date) => ({
    date,
    revenue: byDate[date] ?? 0,
  }));
}

function buildPieData(sessions: CompletedSession[]) {
  const methods: Record<string, number> = {};
  sessions.forEach((s) => {
    methods[s.paymentMethod] = (methods[s.paymentMethod] ?? 0) + s.totalAmount;
  });
  return Object.entries(methods).map(([method, value]) => ({
    method,
    value,
  }));
}

function buildGamePopularity(sessions: CompletedSession[]) {
  const games: Record<string, number> = {};
  sessions.forEach((s) => {
    games[s.gameType] = (games[s.gameType] ?? 0) + 1;
  });
  return Object.entries(games)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));
}

// ================================================================
// INNER PAGE
// ================================================================
function PaymentsPageInner({ user }: { user: ClubUser }) {
  const toggleMenu = useMenuToggle();

  const [sessions, setSessions] = useState<CompletedSession[]>([]);
  const [dateFilter, setDateFilter] = useState("today");
  const [methodFilter, setMethodFilter] = useState("");
  const [search, setSearch] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setSessions(getSessions(user.email));
  }, [user.email]);

  // Live tick for updating
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Filter sessions ───────────────────────────────────────────
  const filtered = sessions.filter((s) => {
    // Date filter
    if (dateFilter === "today") {
      if (todayStr() !== new Date(s.endTime).toISOString().split("T")[0])
        return false;
    } else if (dateFilter === "yesterday") {
      if (yesterdayStr() !== new Date(s.endTime).toISOString().split("T")[0])
        return false;
    } else if (dateFilter === "week") {
      const weekAgo = weekAgoDate().getTime();
      if (s.endTime < weekAgo) return false;
    }
    // Payment method filter
    if (methodFilter && s.paymentMethod !== methodFilter) return false;
    // Search by player or table
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        s.players.some((p) => p.name.toLowerCase().includes(q)) ||
        s.tableName.toLowerCase().includes(q) ||
        s.gameType.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // ── Group rows by date ─────────────────────────────────────────
  const byDate = groupByDate(filtered);

  // ── Summary stats ─────────────────────────────────────────────
  const summary = paymentSummary(filtered);

  const revenueBar = buildRevenueBar(filtered, 7);
  const pieData = buildPieData(filtered);
  const gamePopData = buildGamePopularity(filtered);

  return (
    <>
      {/* ── Header ──────────────────────────────────────── */}
      <PageHeader
        title="Payments"
        subtitle="View payment records and stats"
        onMenuClick={toggleMenu}
      />

      {/* ── Page body ───────────────────────────────────── */}
      <div className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
          <StatCard
            label="Revenue"
            value={summary.total}
            prefix="Rs."
            icon={FiDollarSign}
            iconColor="text-emerald-500"
            iconBg="bg-emerald-500/10"
            trend={`Sessions: ${summary.count}`}
          />
          <StatCard
            label="Sessions"
            value={summary.count}
            icon={FiActivity}
            iconColor="text-blue-500"
            iconBg="bg-blue-500/10"
            trend={`Today: ${filtered.length}`}
          />
          <StatCard
            label="Cash Today"
            value={summary.cash}
            prefix="Rs."
            icon={FiDollarSign}
            iconColor="text-green-500"
            iconBg="bg-green-500/10"
          />
          <StatCard
            label="Digital Today"
            value={summary.digital}
            prefix="Rs."
            icon={FiPieChart}
            iconColor="text-purple-500"
            iconBg="bg-purple-500/10"
          />
          <StatCard
            label="On Credit"
            value={summary.credit}
            prefix="Rs."
            icon={FiAlertCircle}
            iconColor="text-orange-500"
            iconBg="bg-orange-500/10"
            trend={summary.credit > 0 ? "Credit sessions" : undefined}
          />
        </div>

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Date filter */}
          <div className="flex gap-1.5 p-1 rounded-xl bg-theme-secondary border border-theme">
            {DATE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setDateFilter(f.value)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-semibold
                  transition-all duration-200
                  ${
                    dateFilter === f.value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-theme-secondary hover:text-theme-primary"
                  }
                `}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Method filter */}
          <div className="flex gap-1.5 p-1 rounded-xl bg-theme-secondary border border-theme">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMethodFilter(m.value)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-semibold
                  transition-all duration-200
                  ${
                    methodFilter === m.value
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-theme-secondary hover:text-theme-primary"
                  }
                `}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <FiSearch
              className="
              absolute left-3.5 top-1/2 -translate-y-1/2
              text-theme-muted text-sm
            "
            />
            <input
              className="input-theme pl-10"
              placeholder="Search by player, table, game..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 7 Day Revenue Bar Chart */}
          <div className="card-theme p-5">
            <div className="flex items-center gap-2 mb-2">
              <FiBarChart2 className="text-blue-500" />
              <span className="text-theme-primary text-xs font-bold">
                7 Day Revenue
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueBar}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <CartesianGrid vertical={false} strokeDasharray="4 3" />
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods Pie Chart */}
          <div className="card-theme p-5">
            <div className="flex items-center gap-2 mb-2">
              <FiPieChart className="text-purple-500" />
              <span className="text-theme-primary text-xs font-bold">
                Payment Breakdown
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  innerRadius={32}
                  fill="#8884d8"
                  label={({ method }) => method}
                  paddingAngle={3}
                >
                  {pieData.map((entry, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={PIE_COLORS[entry.method] ?? "#64748b"}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Game Popularity Horizontal Bar Chart */}
          <div className="card-theme p-5">
            <div className="flex items-center gap-2 mb-2">
              <FiHash className="text-orange-500" />
              <span className="text-theme-primary text-xs font-bold">
                Game Popularity
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={gamePopData} layout="vertical">
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={12}
                  width={90}
                />
                <Bar dataKey="value" fill="#f97316" radius={[0, 0, 4, 4]}>
                  {gamePopData.map((entry, i) => (
                    <Cell
                      key={`cell-bar-${i}`}
                      fill={GAME_COLORS[entry.name] ?? "#64748b"}
                    />
                  ))}
                </Bar>
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grouped payment records by date with subtotals */}
        {Object.keys(byDate).length === 0 ? (
          <div className="card-theme p-8 text-center">
            <p className="text-theme-muted text-sm">
              No payment records for selected filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-5">
            {Object.entries(byDate).map(([date, rows]) => (
              <div key={date} className="card-theme">
                {/* Date header */}
                <div className="flex items-center gap-2 px-5 py-3 border-b border-theme bg-theme-secondary">
                  <FiClock className="text-blue-500" />
                  <span className="text-theme-primary text-xs font-bold">
                    {date}
                  </span>
                  <span className="text-theme-muted text-xs">
                    ({rows.length} session{rows.length > 1 ? "s" : ""})
                  </span>
                </div>

                {/* Rows */}
                <div className="divide-y divide-theme">
                  {rows.map((s, i) => (
                    <div
                      key={s.id}
                      className={`
                        px-5 py-3 flex items-center gap-3
                        hover:bg-theme-secondary transition-colors duration-150
                        animate-fade-in stagger-${Math.min(i + 1, 4)}
                      `}
                    >
                      {/* Player side */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-blue-500 font-bold text-xs">
                            T{s.tableNo}
                          </span>
                          <span className="text-theme-primary text-xs font-semibold truncate">
                            {s.tableName}
                          </span>
                          <span className="text-theme-muted text-[10px]">
                            {s.gameType}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Badge
                            label={s.paymentMethod}
                            variant={
                              ["Cash", "DebtPayment"].includes(s.paymentMethod)
                                ? "emerald"
                                : s.paymentMethod === "EasyPaisa"
                                  ? "purple"
                                  : s.paymentMethod === "JazzCash"
                                    ? "orange"
                                    : s.paymentMethod === "OnCredit"
                                      ? "orange"
                                      : "slate"
                            }
                            small
                          />
                          <span className="text-theme-muted text-[10px] truncate">
                            {s.players.map((p) => p.name).join(", ")}
                          </span>
                          {s.creditPlayerName && (
                            <Badge label="On Credit" variant="orange" small />
                          )}
                        </div>
                      </div>
                      {/* Amount */}
                      <span className="text-theme-primary text-sm font-bold shrink-0">
                        Rs. {s.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Day summary footer */}
                <div className="px-5 py-3 border-t border-theme bg-theme-secondary flex items-center gap-6">
                  <div className="flex items-center gap-2 text-xs text-theme-muted">
                    <span>Total</span>
                    <span className="text-theme-primary font-bold">
                      Rs. {rows.reduce((s, s2) => s + s2.totalAmount, 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-500">
                    <span>Cash</span>
                    <span className="font-bold">
                      Rs.{" "}
                      {rows
                        .filter((r) => r.paymentMethod === "Cash")
                        .reduce((s, r) => s + r.totalAmount, 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-purple-500">
                    <span>Digital</span>
                    <span className="font-bold">
                      Rs.{" "}
                      {rows
                        .filter(
                          (r) =>
                            r.paymentMethod === "EasyPaisa" ||
                            r.paymentMethod === "JazzCash",
                        )
                        .reduce((s, r) => s + r.totalAmount, 0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ================================================================
// MAIN EXPORT
// ================================================================
export default function PaymentsPage() {
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
      <PaymentsPageInner user={user} />
    </AppShell>
  );
}
