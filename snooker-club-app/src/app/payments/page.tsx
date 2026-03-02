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
  FiCalendar,
  FiFilter,
  FiTrendingUp,
  FiActivity,
  FiAlertTriangle,
  FiMapPin,
  FiTarget,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import { GiPoolTriangle } from "react-icons/gi";

// ─── Types ─────────────────────────────────────────────────
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
  paymentMethod?:
    | "Cash"
    | "EasyPaisa"
    | "JazzCash"
    | "OnCredit"
    | "DebtPayment";
  creditPlayerName?: string;
  settledMethod?: "Cash" | "EasyPaisa" | "JazzCash";
}

type DateFilter = "today" | "yesterday" | "week" | "month" | "all";
type MethodFilter = "All" | "Cash" | "EasyPaisa" | "JazzCash" | "OnCredit";

// ─── Constants ──────────────────────────────────────────────
const navLinks = [
  { label: "Dashboard", icon: FiHome, href: "/dashboard", active: false },
  { label: "Tables", icon: FiSquare, href: "/tables", active: false },
  { label: "Players", icon: FiUsers, href: "/members", active: false },
  { label: "Payments", icon: FiDollarSign, href: "/payments", active: true },
  { label: "Games", icon: FiTarget, href: "/games", active: false },
  { label: "Profile", icon: FiSettings, href: "/profile", active: false },
];

const METHOD_COLORS: Record<string, string> = {
  Cash: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  EasyPaisa: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  JazzCash: "bg-red-500/10 text-red-400 border-red-500/20",
  OnCredit: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  DebtPayment: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const METHOD_LABELS: Record<string, string> = {
  Cash: "Cash",
  EasyPaisa: "EasyPaisa",
  JazzCash: "JazzCash",
  OnCredit: "On Credit",
  DebtPayment: "Debt Collected",
};

// ─── Helper Functions ───────────────────────────────────────
function isToday(ts: number): boolean {
  const d = new Date(ts);
  const n = new Date();
  return (
    d.getDate() === n.getDate() &&
    d.getMonth() === n.getMonth() &&
    d.getFullYear() === n.getFullYear()
  );
}

function isYesterday(ts: number): boolean {
  const d = new Date(ts);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return (
    d.getDate() === y.getDate() &&
    d.getMonth() === y.getMonth() &&
    d.getFullYear() === y.getFullYear()
  );
}

function isThisWeek(ts: number): boolean {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return ts >= weekAgo.getTime();
}

function isThisMonth(ts: number): boolean {
  const d = new Date(ts);
  const n = new Date();
  return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
}

function getDateLabel(ts: number): string {
  if (isToday(ts)) return "Today";
  if (isYesterday(ts)) return "Yesterday";
  return new Date(ts).toLocaleDateString("en-PK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function groupByDate(
  sessions: CompletedSession[],
): Record<string, CompletedSession[]> {
  const groups: Record<string, CompletedSession[]> = {};
  sessions.forEach((s) => {
    const label = getDateLabel(s.endTime);
    if (!groups[label]) groups[label] = [];
    groups[label].push(s);
  });
  return groups;
}

// ✅ FIXED: Revenue Calculation
function getRevenue(sessions: CompletedSession[]): number {
  return sessions
    .filter((s) => s.paymentMethod !== "OnCredit")
    .reduce((a, s) => a + s.totalAmount, 0);
}

function getCash(sessions: CompletedSession[]): number {
  return sessions
    .filter(
      (s) =>
        s.paymentMethod === "Cash" ||
        (s.paymentMethod === "DebtPayment" &&
          (!s.settledMethod || s.settledMethod === "Cash")),
    )
    .reduce((a, s) => a + s.totalAmount, 0);
}

function getOnline(sessions: CompletedSession[]): number {
  return sessions
    .filter(
      (s) =>
        ["EasyPaisa", "JazzCash"].includes(s.paymentMethod ?? "") ||
        (s.paymentMethod === "DebtPayment" &&
          ["EasyPaisa", "JazzCash"].includes(s.settledMethod ?? "")),
    )
    .reduce((a, s) => a + s.totalAmount, 0);
}

// ✅ FIXED: Get ACTUAL unpaid credit (current debt from localStorage)
function getUnpaidCredit(
  sessions: CompletedSession[],
  debts: Record<string, number>,
): number {
  // Sum up current debts from localStorage (source of truth)
  return Object.values(debts).reduce((sum, debt) => sum + debt, 0);
}

function getDebtCollected(sessions: CompletedSession[]): number {
  return sessions
    .filter((s) => s.paymentMethod === "DebtPayment")
    .reduce((a, s) => a + s.totalAmount, 0);
}

// ─── Custom Chart Tooltips ─────────────────────────────────
function BarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; fill: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 shadow-2xl pointer-events-none">
      {label && <p className="text-slate-400 text-[11px] mb-1">{label}</p>}
      <p className="text-white font-bold text-sm">
        Rs. {Number(payload[0].value).toLocaleString()}
      </p>
    </div>
  );
}

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 shadow-2xl pointer-events-none">
      <p className="text-white font-semibold text-sm">{payload[0].name}</p>
      <p className="text-emerald-400 text-xs font-bold">
        {payload[0].value} records
      </p>
    </div>
  );
}

// ─── Sidebar ��──────────────────────────────────────────────
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
        className={`fixed top-0 left-0 h-screen w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-30 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto`}
      >
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

        <div className="px-4 py-3 border-b border-slate-700/50">
          <div className="relative bg-gradient-to-br from-blue-600/15 to-blue-500/5 border border-blue-500/20 rounded-xl p-3 overflow-hidden">
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <p className="text-white text-sm font-bold truncate pr-4">
              {user.club_name}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                <FiMapPin className="text-[9px]" />
                {user.location}
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                <FiSquare className="text-[9px]" />
                {user.tables} Tables
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${link.active ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "text-slate-400 hover:text-white hover:bg-slate-800/60"}`}
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
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
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

// ─── Payment Row Component ─────────────────────────────────
function PaymentRow({ session }: { session: CompletedSession }) {
  const [expanded, setExpanded] = useState(false);
  const method = session.paymentMethod ?? "Cash";
  const isCredit = method === "OnCredit";
  const isDebt = method === "DebtPayment";

  return (
    <div className="border-b border-slate-700/30 last:border-0">
      <div
        className="px-5 py-4 flex items-center gap-4 hover:bg-slate-800/20 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
            isDebt
              ? "bg-blue-500/10 border-blue-500/20"
              : isCredit
                ? "bg-orange-500/10 border-orange-500/20"
                : "bg-slate-800/60 border-slate-700/40"
          }`}
        >
          {isDebt ? (
            <FiCheckCircle className="text-blue-400 text-base" />
          ) : (
            <span
              className={`text-xs font-bold ${isCredit ? "text-orange-400" : "text-slate-300"}`}
            >
              T{session.tableNo || "—"}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">
            {isDebt
              ? `${session.players[0]?.name} — Debt Collected`
              : session.players.map((p) => p.name).join(" vs ")}
          </p>
          <p className="text-slate-500 text-xs mt-0.5">
            {isDebt
              ? `Via ${session.settledMethod ?? "Cash"}`
              : `${session.gameType} • ${session.duration}`}
          </p>
        </div>

        <span
          className={`hidden sm:inline-flex text-xs px-2.5 py-1 rounded-lg border font-medium shrink-0 ${METHOD_COLORS[method]}`}
        >
          {METHOD_LABELS[method]}
        </span>

        {isCredit && session.creditPlayerName && (
          <span className="hidden lg:block text-orange-400/60 text-xs shrink-0">
            {session.creditPlayerName}
          </span>
        )}

        <span className="hidden lg:block text-slate-500 text-xs shrink-0">
          {new Date(session.endTime).toLocaleTimeString("en-PK", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>

        <span
          className={`font-bold text-sm shrink-0 ${
            isCredit
              ? "text-orange-400"
              : isDebt
                ? "text-blue-400"
                : "text-emerald-400"
          }`}
        >
          Rs. {session.totalAmount.toLocaleString()}
        </span>

        <span
          className={`text-slate-500 text-xs transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </div>

      {expanded && (
        <div className="px-5 pb-5">
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 space-y-3">
            <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest">
              {isDebt
                ? "Debt Collection Details"
                : isCredit
                  ? "Unpaid Session"
                  : "Payment Breakdown"}
            </p>

            {isDebt ? (
              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Player</span>
                  <span className="text-white text-sm font-medium">
                    {session.players[0]?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">
                    Amount Collected
                  </span>
                  <span className="text-emerald-400 font-bold text-sm">
                    Rs. {session.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Payment Method</span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${METHOD_COLORS[session.settledMethod ?? "Cash"]}`}
                  >
                    {session.settledMethod ?? "Cash"}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-700/40 flex items-center gap-2">
                  <FiCheckCircle className="text-blue-400 text-xs" />
                  <span className="text-blue-400 text-xs">
                    Added to today's revenue
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {session.players.map((player, i) => {
                  const split = session.splits?.find(
                    (s) => s.playerName === player.name,
                  );
                  const amt = split?.amount ?? 0;
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
                      {amt === 0 ? (
                        <span className="text-slate-500 text-xs bg-slate-700/40 px-2 py-0.5 rounded-lg">
                          Won
                        </span>
                      ) : (
                        <span
                          className={`font-semibold text-sm ${isCredit ? "text-orange-400" : "text-emerald-400"}`}
                        >
                          Rs. {amt.toLocaleString()}
                          {isCredit && " (credit)"}
                        </span>
                      )}
                    </div>
                  );
                })}
                <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between">
                  {isCredit ? (
                    <div className="flex items-center gap-1.5">
                      <FiAlertTriangle className="text-orange-400 text-xs" />
                      <span className="text-orange-400 text-xs">
                        Not collected yet — settle from Players page
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs">
                      Paid via {METHOD_LABELS[method]}
                    </span>
                  )}
                  <span className="text-white font-bold text-sm">
                    Rs. {session.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
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
  const [debts, setDebts] = useState<Record<string, number>>({});
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
    if (recent) {
      setSessions(JSON.parse(recent));
    }

    // ✅ Load debts (source of truth for unpaid credit)
    const savedDebts = localStorage.getItem(`club_debts_${u.email}`);
    setDebts(savedDebts ? JSON.parse(savedDebts) : {});
  }, [router]);

  useEffect(() => {
    const onFocus = () => {
      if (!user) return;
      const recent = localStorage.getItem(`club_recent_${user.email}`);
      if (recent) {
        setSessions(JSON.parse(recent));
      }
      const savedDebts = localStorage.getItem(`club_debts_${user.email}`);
      setDebts(savedDebts ? JSON.parse(savedDebts) : {});
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("club_user");
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    const matchDate =
      dateFilter === "today"
        ? isToday(s.endTime)
        : dateFilter === "yesterday"
          ? isYesterday(s.endTime)
          : dateFilter === "week"
            ? isThisWeek(s.endTime)
            : dateFilter === "month"
              ? isThisMonth(s.endTime)
              : true;

    if (!matchDate) return false;
    if (methodFilter === "All") return true;
    return s.paymentMethod === methodFilter;
  });

  // Today stats
  const todaySessions = sessions.filter((s) => isToday(s.endTime));
  const todayRevenue = getRevenue(todaySessions);
  const todayCash = getCash(todaySessions);
  const todayOnline = getOnline(todaySessions);
  const todayCredit = getUnpaidCredit(todaySessions, debts); // ✅ FIXED: Use actual unpaid debt
  const todayDebtCollected = getDebtCollected(todaySessions);

  // Count players with debt
  const todayCreditCount = Object.values(debts).filter((d) => d > 0).length;

  // Filtered stats
  const filteredRevenue = getRevenue(filteredSessions);
  const filteredCash = getCash(filteredSessions);
  const filteredOnline = getOnline(filteredSessions);
  const filteredCredit = getUnpaidCredit(filteredSessions, debts); // ✅ FIXED

  // Chart data
  const chartDays = dateFilter === "month" ? 30 : 7;
  const chartData = Array.from({ length: chartDays }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (chartDays - 1 - i));
    d.setHours(0, 0, 0, 0);

    const dayStart = d.getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    const daySessions = sessions.filter(
      (s) => s.endTime >= dayStart && s.endTime < dayEnd,
    );

    return {
      day: d.toLocaleDateString("en-PK", {
        weekday: chartDays > 7 ? undefined : "short",
        day: "numeric",
        month: chartDays > 7 ? "short" : undefined,
      }),
      revenue: getRevenue(daySessions),
    };
  });

  const PIE_COLORS: Record<string, string> = {
    Cash: "#10b981",
    EasyPaisa: "#a855f7",
    JazzCash: "#ef4444",
    "On Credit": "#f97316",
    "Debt Collected": "#3b82f6",
  };

  const methodMix = [
    { key: "Cash", label: "Cash" },
    { key: "EasyPaisa", label: "EasyPaisa" },
    { key: "JazzCash", label: "JazzCash" },
    { key: "OnCredit", label: "On Credit" },
    { key: "DebtPayment", label: "Debt Collected" },
  ]
    .map((m) => ({
      name: m.label,
      value: todaySessions.filter((s) => (s.paymentMethod ?? "Cash") === m.key)
        .length,
    }))
    .filter((m) => m.value > 0);

  const gameStats = filteredSessions
    .filter((s) => s.gameType !== "Debt Payment")
    .reduce(
      (acc, s) => {
        acc[s.gameType] = (acc[s.gameType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

  const gamePopularity = Object.entries(gameStats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const grouped = groupByDate(filteredSessions);
  const sortedGroups = Object.entries(grouped).sort(
    (a, b) =>
      Math.max(...b[1].map((s) => s.endTime)) -
      Math.max(...a[1].map((s) => s.endTime)),
  );

  const periodLabel =
    dateFilter === "all"
      ? "All Time"
      : dateFilter === "month"
        ? "This Month"
        : dateFilter === "week"
          ? "This Week"
          : dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-xl border-b border-slate-700/40 px-4 lg:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <FiMenu className="text-lg" />
              </button>
              <div className="hidden lg:block w-px h-5 bg-slate-700/60" />
              <div>
                <h1 className="text-white font-bold text-base leading-tight">
                  Payments
                </h1>
                <p className="text-slate-500 text-[11px] leading-tight">
                  {filteredSessions.length} records • {periodLabel}
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5">
              <FiTrendingUp className="text-emerald-400 text-xs" />
              <span className="text-emerald-400 text-xs font-bold">
                Rs. {todayRevenue.toLocaleString()}
              </span>
              <span className="text-slate-500 text-[10px]">today</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                label: "Total Revenue",
                value: `Rs. ${filteredRevenue.toLocaleString()}`,
                icon: FiTrendingUp,
                color: "emerald",
                sub: `Cash + Online + Debt`,
              },
              {
                label: "Total Records",
                value: filteredSessions.length,
                icon: FiActivity,
                color: "blue",
                sub: periodLabel,
              },
              {
                label: "Cash",
                value: `Rs. ${filteredCash.toLocaleString()}`,
                icon: FiDollarSign,
                color: "yellow",
                sub: "Cash payments",
              },
              {
                label: "Online",
                value: `Rs. ${filteredOnline.toLocaleString()}`,
                icon: FiDollarSign,
                color: "purple",
                sub: "EasyPaisa / JazzCash",
              },
              {
                label: "Unpaid Credit",
                value: `Rs. ${filteredCredit.toLocaleString()}`,
                icon: FiAlertTriangle,
                color: "orange",
                sub: "Current debt",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`bg-slate-900/60 border rounded-2xl p-4 transition-all ${
                  s.color === "orange" && filteredCredit > 0
                    ? "border-orange-500/30 bg-orange-500/5"
                    : "border-slate-700/40 hover:border-slate-600/60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-xs font-medium">
                    {s.label}
                  </p>
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

          {todayCredit > 0 && (
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4 flex items-start gap-3">
              <FiAlertTriangle className="text-orange-400 text-base shrink-0 mt-0.5" />
              <div>
                <p className="text-orange-400 font-semibold text-sm">
                  Rs. {todayCredit.toLocaleString()} Unpaid Credit
                </p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {todayCreditCount} player{todayCreditCount !== 1 ? "s" : ""}{" "}
                  currently owe money. Go to{" "}
                  <a
                    href="/members"
                    className="text-blue-400 underline font-medium"
                  >
                    Players page
                  </a>{" "}
                  to collect — it will automatically update revenue here.
                </p>
              </div>
            </div>
          )}

          {todayDebtCollected > 0 && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
              <FiCheckCircle className="text-blue-400 text-base shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-400 font-semibold text-sm">
                  Rs. {todayDebtCollected.toLocaleString()} Debt Collected Today
                </p>
                <p className="text-slate-400 text-xs mt-0.5">
                  Old credit payments collected and added to today's revenue.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
            <div className="flex items-center bg-slate-900/60 border border-slate-700/40 rounded-xl p-1 gap-1">
              <FiCalendar className="text-slate-500 text-sm ml-2 shrink-0" />
              {(
                [
                  { key: "today", label: "Today" },
                  { key: "yesterday", label: "Yesterday" },
                  { key: "week", label: "Week" },
                  { key: "month", label: "Month" },
                  { key: "all", label: "All" },
                ] as { key: DateFilter; label: string }[]
              ).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setDateFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dateFilter === f.key ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-slate-900/60 border border-slate-700/40 rounded-xl p-1 gap-1 flex-wrap">
              <FiFilter className="text-slate-500 text-sm ml-2 shrink-0" />
              {(
                [
                  { key: "All", label: "All" },
                  { key: "Cash", label: "Cash" },
                  { key: "EasyPaisa", label: "EasyPaisa" },
                  { key: "JazzCash", label: "JazzCash" },
                  { key: "OnCredit", label: "On Credit" },
                ] as { key: MethodFilter; label: string }[]
              ).map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMethodFilter(m.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    methodFilter === m.key
                      ? m.key === "OnCredit"
                        ? "bg-orange-500 text-white"
                        : "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="sm:ml-auto flex items-center gap-3 bg-slate-800/50 border border-slate-700/40 rounded-xl px-4 py-2">
              <div className="text-center">
                <p className="text-slate-400 text-xs">Revenue</p>
                <p className="text-emerald-400 font-bold text-sm">
                  Rs. {filteredRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-px h-8 bg-slate-700/50" />
              <div className="text-center">
                <p className="text-slate-400 text-xs">Records</p>
                <p className="text-white font-bold text-sm">
                  {filteredSessions.length}
                </p>
              </div>
            </div>
          </div>

          {sessions.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5">
                <div className="mb-4">
                  <h3 className="text-white font-semibold text-sm">
                    Revenue Trend — {periodLabel}
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Daily revenue including debt collections
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={chartData}
                    barSize={chartDays > 7 ? 12 : 28}
                    style={{ outline: "none", userSelect: "none" }}
                  >
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#64748b", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#64748b", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) =>
                        v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                      }
                      width={40}
                    />
                    <Tooltip
                      content={<BarTooltip />}
                      cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#2563eb"
                      radius={[6, 6, 0, 0]}
                      style={{ outline: "none" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5">
                <div className="mb-4">
                  <h3 className="text-white font-semibold text-sm">
                    Payment Types
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Today's breakdown
                  </p>
                </div>
                {methodMix.length === 0 ? (
                  <div className="flex items-center justify-center h-40">
                    <p className="text-slate-600 text-xs">No data yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart style={{ outline: "none", userSelect: "none" }}>
                      <Pie
                        data={methodMix}
                        cx="50%"
                        cy="42%"
                        innerRadius={42}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                        style={{ outline: "none" }}
                      >
                        {methodMix.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[entry.name] ?? "#64748b"}
                            stroke="none"
                            style={{ outline: "none" }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                      <Legend
                        iconType="circle"
                        iconSize={7}
                        formatter={(v) => (
                          <span style={{ color: "#fff", fontSize: "11px" }}>
                            {v}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}

          {gamePopularity.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5">
              <div className="mb-4">
                <h3 className="text-white font-semibold text-sm">
                  Most Played Games
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Top game types — {periodLabel}
                </p>
              </div>
              <ResponsiveContainer
                width="100%"
                height={Math.max(100, gamePopularity.length * 40)}
              >
                <BarChart
                  data={gamePopularity}
                  layout="vertical"
                  barSize={18}
                  margin={{ left: 10, right: 30 }}
                  style={{ outline: "none", userSelect: "none" }}
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
                    content={<BarTooltip />}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#10b981"
                    radius={[0, 6, 6, 0]}
                    style={{ outline: "none" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {filteredSessions.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-16 text-center">
              <div className="w-14 h-14 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiClock className="text-slate-600 text-2xl" />
              </div>
              <p className="text-white font-semibold mb-1">No Records Found</p>
              <p className="text-slate-500 text-sm mb-6">
                No payment records match the selected filters.
              </p>
              <button
                onClick={() => {
                  setDateFilter("today");
                  setMethodFilter("All");
                }}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedGroups.map(([dateLabel, daySessions]) => {
                const dayRevenue = getRevenue(daySessions);
                const dayCash = getCash(daySessions);
                const dayOnline = getOnline(daySessions);
                const dayCredit = getUnpaidCredit(daySessions, debts); // ✅ FIXED

                return (
                  <div key={dateLabel}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-slate-500 text-sm" />
                        <span className="text-slate-200 text-sm font-bold">
                          {dateLabel}
                        </span>
                        <span className="text-slate-600 text-xs">
                          {daySessions.length} record
                          {daySessions.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <span className="text-emerald-400 font-bold text-sm">
                        Rs. {dayRevenue.toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden mb-3">
                      {daySessions.map((session) => (
                        <PaymentRow key={session.id} session={session} />
                      ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        {
                          label: "Revenue",
                          value: dayRevenue,
                          color: "emerald",
                        },
                        { label: "Cash", value: dayCash, color: "yellow" },
                        { label: "Online", value: dayOnline, color: "purple" },
                        { label: "Unpaid", value: dayCredit, color: "orange" },
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
                                  : s.color === "orange"
                                    ? "text-orange-400"
                                    : "text-purple-400"
                            }`}
                          >
                            Rs. {s.value.toLocaleString()}
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
