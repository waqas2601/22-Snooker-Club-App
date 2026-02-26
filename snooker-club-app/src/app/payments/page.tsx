"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  FiHome,
  FiUsers,
  FiDollarSign,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiSquare,
  FiClock,
  FiCalendar,
  FiFilter,
  FiTrendingUp,
  FiActivity,
  FiAlertTriangle,
  FiMapPin
} from "react-icons/fi";
import { GiPoolTriangle } from "react-icons/gi";

// ─── Types ────────────────────────────────────────────────
interface ClubUser {
  club_name: string;
  owner_name: string;
  email: string;
  location: string;
  tables: number;
}

interface SessionPlayer {
  name: string;
  isRegistered: boolean;
}

interface PaymentSplit {
  playerName: string;
  amount: number;
}

interface CompletedSession {
  id: string;
  tableNo: number;
  players: SessionPlayer[];
  gameType: string;
  duration: string;
  totalAmount: number;
  splits: PaymentSplit[];
  endTime: number;
  paymentMethod?: "Cash" | "EasyPaisa" | "JazzCash" | "OnCredit";
}

type DateFilter = "today" | "yesterday" | "week" | "all";
type MethodFilter = "All" | "Cash" | "EasyPaisa" | "JazzCash";

const navLinks = [
  { label: "Dashboard", icon: FiHome, href: "/dashboard", active: false },
  { label: "Tables", icon: FiSquare, href: "/tables", active: false },
  { label: "Players", icon: FiUsers, href: "/members", active: false },
  { label: "Payments", icon: FiDollarSign, href: "/payments", active: true },
  { label: "Games", icon: FiSquare, href: "/games", active: false },
  { label: "Profile", icon: FiSettings, href: "/profile", active: false },
];

const methodColors: Record<string, string> = {
  Cash: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  EasyPaisa: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  JazzCash: "bg-red-500/10 text-red-400 border-red-500/20",
  OnCredit: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

// ─── Helpers ──────────────────────────────────────────────
function isToday(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function isYesterday(ts: number) {
  const d = new Date(ts);
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  return (
    d.getDate() === yest.getDate() &&
    d.getMonth() === yest.getMonth() &&
    d.getFullYear() === yest.getFullYear()
  );
}

function isThisWeek(ts: number) {
  return Date.now() - ts < 7 * 24 * 60 * 60 * 1000;
}

function getDateLabel(ts: number) {
  if (isToday(ts)) return "Today";
  if (isYesterday(ts)) return "Yesterday";
  return new Date(ts).toLocaleDateString("en-PK", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function groupByDate(sessions: CompletedSession[]) {
  const groups: Record<string, CompletedSession[]> = {};
  sessions.forEach((s) => {
    const label = getDateLabel(s.endTime);
    if (!groups[label]) groups[label] = [];
    groups[label].push(s);
  });
  return groups;
}

// ─── Sidebar ───────────────────────────────────────────────
function Sidebar({
  user,
  open,
  onClose,
  onLogout,
}: {
  user: ClubUser;
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`
        fixed top-0 left-0 h-screen w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50
        z-30 flex flex-col transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto
      `}
      >
        {/* Brand */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <GiPoolTriangle className="text-white text-base" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">
                Snooker Manager
              </p>
              <p className="text-blue-400/70 text-[10px] font-medium tracking-wide uppercase">
                Pro Edition
              </p>
            </div>
          </div>
        </div>

        {/* Club Info */}
        <div className="px-4 py-3 border-b border-slate-700/50">
          <div className="relative bg-gradient-to-br from-blue-600/15 to-blue-500/5 border border-blue-500/20 rounded-xl p-3 overflow-hidden">
            {/* Decorative dot */}
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <p className="text-white text-sm font-bold truncate pr-4">
              {user.club_name}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                <FiMapPin className="text-[9px]" /> {user.location}
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                <FiSquare className="text-[9px]" /> {user.tables} Tables
              </span>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider px-3 mb-3">
            Navigation
          </p>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${
                  link.active
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
            >
              <link.icon className="text-lg shrink-0" />
              {link.label}
              {link.active && (
                <div className="ml-auto w-1.5 h-1.5 bg-blue-400 rounded-full" />
              )}
            </a>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/40 rounded-xl px-3 py-2.5 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow shadow-blue-500/30">
              {user.owner_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {user.owner_name}
              </p>
              <p className="text-slate-500 text-[10px] truncate">
                {user.email}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
              title="Logout"
            >
              <FiLogOut className="text-sm" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400/70 text-[10px] font-medium">
              System Online
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Payment Row ───────────────────────────────────────────
function PaymentRow({ session }: { session: CompletedSession }) {
  const [expanded, setExpanded] = useState(false);
  const method = session.paymentMethod || "Cash";
  const paidSplits = session.splits?.filter((s) => s.amount > 0) || [];

  return (
    <div className="border-b border-slate-700/30 last:border-0">
      {/* Main Row */}
      <div
        className="px-5 py-4 flex items-center gap-4 hover:bg-slate-800/30 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Table Badge */}
        <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
          <span className="text-blue-400 text-xs font-bold">
            T{session.tableNo}
          </span>
        </div>

        {/* Players & Game */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">
            {session.players.map((p) => p.name).join(" vs ")}
          </p>
          <p className="text-slate-500 text-xs mt-0.5">
            {session.gameType} • {session.duration}
          </p>
        </div>

        {/* Method */}
        <span
          className={`hidden sm:inline-flex text-xs px-2.5 py-1 rounded-lg border font-medium shrink-0 ${methodColors[method]}`}
        >
          {method}
        </span>

        {/* Time */}
        <span className="hidden lg:block text-slate-500 text-xs shrink-0">
          {new Date(session.endTime).toLocaleTimeString("en-PK", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>

        {/* Amount */}
        <span className="text-emerald-400 font-bold text-sm shrink-0">
          Rs. {session.totalAmount.toLocaleString()}
        </span>

        {/* Expand Arrow */}
        <span
          className={`text-slate-500 text-xs transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </div>

      {/* Expanded Split Details */}
      {expanded && (
        <div className="px-5 pb-4">
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Payment Breakdown
            </p>
            <div className="space-y-2">
              {session.players.map((player, i) => {
                const split = session.splits?.find(
                  (s) => s.playerName === player.name,
                );
                const amount = split?.amount || 0;
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-600/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 text-[10px] font-bold">
                          {player.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-slate-300 text-sm">
                        {player.name}
                      </span>
                      {player.isRegistered && (
                        <span className="text-blue-400 text-[10px]">★</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {amount === 0 ? (
                        <span className="text-slate-500 text-xs bg-slate-700/40 px-2 py-0.5 rounded-lg">
                          Won
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold text-sm">
                          Rs. {amount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-slate-700/40 mt-3 pt-3 flex items-center justify-between">
              <span className="text-slate-400 text-xs">Paid via {method}</span>
              <span className="text-white font-bold text-sm">
                Total: Rs. {session.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────
export default function PaymentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<ClubUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<CompletedSession[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("All");

  useEffect(() => {
    const stored = localStorage.getItem("club_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const u: ClubUser = JSON.parse(stored);
    setUser(u);

    const recent = localStorage.getItem(`club_recent_${u.email}`);
    if (recent) setSessions(JSON.parse(recent));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("club_user");
    router.push("/login");
  };

  // ── Filter Logic ──────────────────────────────────────
  const filtered = sessions.filter((s) => {
    const matchDate =
      dateFilter === "today"
        ? isToday(s.endTime)
        : dateFilter === "yesterday"
          ? isYesterday(s.endTime)
          : dateFilter === "week"
            ? isThisWeek(s.endTime)
            : true;
    const method = s.paymentMethod || "Cash";
    const matchMethod = methodFilter === "All" || method === methodFilter;
    return matchDate && matchMethod;
  });

  // ── Always today stats for summary cards ─────────────
  const todaySessions = sessions.filter((s) => isToday(s.endTime));
  const todayRevenue = todaySessions.reduce((a, s) => a + s.totalAmount, 0);
  const todayCash = todaySessions
    .filter((s) => (s.paymentMethod || "Cash") === "Cash")
    .reduce((a, s) => a + s.totalAmount, 0);
  const todayDigital = todaySessions
    .filter((s) => ["EasyPaisa", "JazzCash"].includes(s.paymentMethod || ""))
    .reduce((a, s) => a + s.totalAmount, 0);

  // ── Filtered totals for the pill ─────────────────────
  const filteredTotal = filtered.reduce((a, s) => a + s.totalAmount, 0);

  // ── Graphs use filtered data so they respect filters ──
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("en-PK", { weekday: "short" });
    const dayTotal = filtered
      .filter((s) => {
        const sd = new Date(s.endTime);
        return (
          sd.getDate() === d.getDate() &&
          sd.getMonth() === d.getMonth() &&
          sd.getFullYear() === d.getFullYear()
        );
      })
      .reduce((a, s) => a + s.totalAmount, 0);
    return { day: label, revenue: dayTotal };
  });

  // ── Payment method mix uses filtered data ─────────────
  const methodMix = ["Cash", "EasyPaisa", "JazzCash", "OnCredit"]
    .map((m) => ({
      name: m === "OnCredit" ? "On Credit" : m,
      value: filtered.filter((s) => (s.paymentMethod || "Cash") === m).length,
    }))
    .filter((m) => m.value > 0);

  const PIE_COLORS: Record<string, string> = {
    Cash: "#10b981",
    EasyPaisa: "#a855f7",
    JazzCash: "#ef4444",
    "On Credit": "#f97316",
  };

  // ── Game popularity uses filtered data ────────────────
  const gamePopularity = Object.entries(
    filtered.reduce(
      (acc, s) => {
        acc[s.gameType] = (acc[s.gameType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const grouped = groupByDate(filtered);
  const sortedGroups = Object.entries(grouped).sort((a, b) => {
    const aTime = Math.max(...a[1].map((s) => s.endTime));
    const bTime = Math.max(...b[1].map((s) => s.endTime));
    return bTime - aTime;
  });

  if (!user)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-xl border-b border-slate-700/40 px-4 lg:px-6">
          <div className="flex items-center justify-between h-18">

            {/* Left */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <FiMenu className="text-lg" />
              </button>
              <div className="hidden lg:block w-px h-5 bg-slate-700/60" />
              <div>
                <h1 className="text-white font-bold text-base leading-tight">Payments</h1>
                <p className="text-slate-500 text-[11px] leading-tight">
                  {todaySessions.length} sessions today • Rs. {todayRevenue.toLocaleString()} collected
                </p>
              </div>
            </div>

            {/* Right — revenue pill */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                <span className="text-emerald-400 text-xs font-bold">
                  Rs. {todayRevenue.toLocaleString()}
                </span>
                <span className="text-slate-500 text-[10px]">today</span>
              </div>
            </div>

          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 space-y-6">
          {/* Today Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                label: "Today's Revenue",
                value: `Rs. ${todayRevenue.toLocaleString()}`,
                icon: FiTrendingUp,
                color: "emerald",
                sub: `${todaySessions.length} sessions`,
              },
              {
                label: "Sessions Today",
                value: todaySessions.length,
                icon: FiActivity,
                color: "blue",
                sub: "Completed",
              },
              {
                label: "Cash Today",
                value: `Rs. ${todayCash.toLocaleString()}`,
                icon: FiDollarSign,
                color: "yellow",
                sub: "Physical payments",
              },
              {
                label: "Digital Today",
                value: `Rs. ${todayDigital.toLocaleString()}`,
                icon: FiDollarSign,
                color: "purple",
                sub: "EasyPaisa & JazzCash",
              },
              {
                label: "On Credit",
                value: `Rs. ${todaySessions
                  .filter((s) => s.paymentMethod === "OnCredit")
                  .reduce((a, s) => a + s.totalAmount, 0)
                  .toLocaleString()}`,
                icon: FiAlertTriangle,
                color: "orange",
                sub: "Unpaid sessions",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5 hover:border-slate-600/60 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-400 text-xs">{s.label}</p>
                  <s.icon
                    className={`text-sm ${
                      s.color === "emerald"
                        ? "text-emerald-400"
                        : s.color === "blue"
                          ? "text-blue-400"
                          : s.color === "yellow"
                            ? "text-yellow-400"
                            : s.color === "orange"
                              ? "text-orange-400"
                              : "text-purple-400"
                    }`}
                  />
                </div>
                <p
                  className={`text-xl font-bold ${
                    s.color === "emerald"
                      ? "text-emerald-400"
                      : s.color === "blue"
                        ? "text-blue-400"
                        : s.color === "yellow"
                          ? "text-yellow-400"
                          : s.color === "orange"
                            ? "text-orange-400"
                            : "text-purple-400"
                  }`}
                >
                  {s.value}
                </p>
                <p className="text-slate-500 text-xs mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Date Filter */}
            <div className="flex items-center bg-slate-900/60 border border-slate-700/40 rounded-xl p-1 gap-1">
              <FiCalendar className="text-slate-500 text-sm ml-2" />
              {(
                [
                  { key: "today", label: "Today" },
                  { key: "yesterday", label: "Yesterday" },
                  { key: "week", label: "This Week" },
                  { key: "all", label: "All Time" },
                ] as { key: DateFilter; label: string }[]
              ).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setDateFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    dateFilter === f.key
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Method Filter */}
            <div className="flex items-center bg-slate-900/60 border border-slate-700/40 rounded-xl p-1 gap-1">
              <FiFilter className="text-slate-500 text-sm ml-2" />
              {(["All", "Cash", "EasyPaisa", "JazzCash"] as MethodFilter[]).map(
                (m) => (
                  <button
                    key={m}
                    onClick={() => setMethodFilter(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      methodFilter === m
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {m}
                  </button>
                ),
              )}
            </div>

            {/* Filtered Total */}
            <div className="sm:ml-auto flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2">
              <div className="text-center">
                <p className="text-slate-400 text-xs">Showing</p>
                <p className="text-emerald-400 font-bold text-sm">
                  Rs. {filteredTotal.toLocaleString()}
                </p>
              </div>
              <div className="w-px h-8 bg-slate-700/50" />
              <div className="text-center">
                <p className="text-slate-400 text-xs">Sessions</p>
                <p className="text-white font-bold text-sm">
                  {filtered.length}
                </p>
              </div>
              <div className="w-px h-8 bg-slate-700/50" />
              <div className="text-center">
                <p className="text-slate-400 text-xs">Filter</p>
                <p className="text-blue-400 font-bold text-sm capitalize">
                  {dateFilter === "all"
                    ? "All Time"
                    : dateFilter === "week"
                      ? "This Week"
                      : dateFilter.charAt(0).toUpperCase() +
                        dateFilter.slice(1)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Graphs Section ── */}
          {sessions.length > 0 && (
            <div className="space-y-4">
              {/* Revenue + Method Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* 7 Day Revenue Bar Chart */}
                <div className="lg:col-span-2 bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5">
                  <div className="mb-4">
                    <h3 className="text-white font-semibold text-sm">
                      Revenue — Last 7 Days
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Daily earnings this week
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={last7Days} barSize={28}>
                      <XAxis
                        dataKey="day"
                        tick={{ fill: "#64748b", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#64748b", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v > 0 ? `Rs.${v}` : "0"}`}
                        width={50}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.04)" }}
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid rgba(100,116,139,0.3)",
                          borderRadius: "12px",
                          fontSize: "12px",
                          color: "#fff",
                        }}
                        formatter={(value) => [
                          `Rs. ${value?.toLocaleString()}`,
                          "Revenue",
                        ]}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="#2563eb"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Payment Method Donut */}
                <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5">
                  <div className="mb-4">
                    <h3 className="text-white font-semibold text-sm">
                      Payment Methods
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5">
                      How customers pay
                    </p>
                  </div>
                  {methodMix.length === 0 ? (
                    <div className="flex items-center justify-center h-40">
                      <p className="text-slate-600 text-xs">No data yet</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={methodMix}
                          cx="50%"
                          cy="45%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {methodMix.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={PIE_COLORS[entry.name] || "#64748b"}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            border: "1px solid rgba(100,116,139,0.3)",
                            borderRadius: "12px",
                            fontSize: "12px",
                            color: "#fff",
                          }}
                          formatter={(value) => [value, "Sessions"]}
                        />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          formatter={(value) => (
                            <span
                              style={{ color: "#94a3b8", fontSize: "11px" }}
                            >
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Game Popularity */}
              {gamePopularity.length > 0 && (
                <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5">
                  <div className="mb-4">
                    <h3 className="text-white font-semibold text-sm">
                      Game Popularity
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Most played game types
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart
                      data={gamePopularity}
                      layout="vertical"
                      barSize={20}
                      margin={{ left: 10, right: 20 }}
                    >
                      <XAxis
                        type="number"
                        tick={{ fill: "#64748b", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={80}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.04)" }}
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid rgba(100,116,139,0.3)",
                          borderRadius: "12px",
                          fontSize: "12px",
                          color: "#fff",
                        }}
                        formatter={(value) => [value, "Sessions"]}
                      />
                      <Bar
                        dataKey="count"
                        fill="#10b981"
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Payment Records */}
          {filtered.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-16 text-center">
              <div className="w-14 h-14 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiClock className="text-slate-600 text-2xl" />
              </div>
              <p className="text-white font-semibold mb-1">No Payments Found</p>
              <p className="text-slate-500 text-sm">
                {dateFilter === "today"
                  ? "No sessions completed today yet. Start a session on the Tables page."
                  : "No payments found for this filter."}
              </p>
              {dateFilter === "today" && (
                <a
                  href="/tables"
                  className="inline-flex items-center gap-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  Go to Tables →
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {sortedGroups.map(([dateLabel, daySessions]) => {
                const dayTotal = daySessions.reduce(
                  (a, s) => a + s.totalAmount,
                  0,
                );
                const dayCash = daySessions
                  .filter((s) => (s.paymentMethod || "Cash") === "Cash")
                  .reduce((a, s) => a + s.totalAmount, 0);
                const dayDigital = dayTotal - dayCash;

                return (
                  <div key={dateLabel}>
                    {/* Date Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-slate-500 text-sm" />
                        <span className="text-slate-300 text-sm font-semibold">
                          {dateLabel}
                        </span>
                        <span className="text-slate-600 text-xs">
                          {daySessions.length} session
                          {daySessions.length > 1 ? "s" : ""}
                        </span>
                      </div>
                      <span className="text-emerald-400 font-bold text-sm">
                        Rs. {dayTotal.toLocaleString()}
                      </span>
                    </div>

                    {/* Sessions List */}
                    <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden mb-3">
                      {daySessions.map((session) => (
                        <PaymentRow key={session.id} session={session} />
                      ))}
                    </div>

                    {/* Day Summary Footer */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          label: "Total",
                          value: `Rs. ${dayTotal.toLocaleString()}`,
                          color: "emerald",
                        },
                        {
                          label: "Cash",
                          value: `Rs. ${dayCash.toLocaleString()}`,
                          color: "yellow",
                        },
                        {
                          label: "Digital",
                          value: `Rs. ${dayDigital.toLocaleString()}`,
                          color: "purple",
                        },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-3 text-center"
                        >
                          <p className="text-slate-500 text-xs mb-1">
                            {s.label}
                          </p>
                          <p
                            className={`font-bold text-sm ${
                              s.color === "emerald"
                                ? "text-emerald-400"
                                : s.color === "yellow"
                                  ? "text-yellow-400"
                                  : "text-purple-400"
                            }`}
                          >
                            {s.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
