"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiHome,
  FiUsers,
  FiDollarSign,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiSquare,
  FiClock,
  FiBell,
  FiTrendingUp,
  FiActivity,
  FiAward,
  FiAlertTriangle,
  FiMapPin,
  FiTarget,
  FiCheckCircle,
} from "react-icons/fi";
import { GiPoolTriangle } from "react-icons/gi";

// ─── SVG Snooker Table ─────────────────────────────────────
function SnookerTableSVG({
  occupied,
  tableNumber,
  tableName,
  pulse,
}: {
  occupied: boolean;
  tableNumber: number;
  tableName?: string;
  pulse: boolean;
}) {
  const feltColor = occupied ? "#7f1d1d" : "#14532d";
  const feltLight = occupied ? "#991b1b" : "#166534";
  const borderColor = occupied ? "#450a0a" : "#052e16";
  const pocketColor = "#0a0a0a";
  const cushionColor = occupied ? "#b91c1c" : "#15803d";

  return (
    <svg
      viewBox="0 0 200 130"
      className="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="2" width="196" height="126" rx="10" fill={borderColor} />
      <rect x="10" y="10" width="180" height="110" rx="7" fill={cushionColor} />
      <rect x="20" y="18" width="160" height="94" rx="3" fill={feltColor} />
      <line
        x1="20"
        y1="65"
        x2="180"
        y2="65"
        stroke={feltLight}
        strokeWidth="0.5"
        opacity="0.3"
      />
      <line
        x1="100"
        y1="18"
        x2="100"
        y2="112"
        stroke={feltLight}
        strokeWidth="0.5"
        opacity="0.3"
      />
      <line
        x1="60"
        y1="18"
        x2="60"
        y2="112"
        stroke={feltLight}
        strokeWidth="0.8"
        opacity="0.4"
      />
      <path
        d="M 60 55 A 15 15 0 0 1 60 75"
        fill="none"
        stroke={feltLight}
        strokeWidth="0.8"
        opacity="0.4"
      />
      <circle cx="20" cy="18" r="7" fill={pocketColor} />
      <circle cx="180" cy="18" r="7" fill={pocketColor} />
      <circle cx="20" cy="112" r="7" fill={pocketColor} />
      <circle cx="180" cy="112" r="7" fill={pocketColor} />
      <circle cx="100" cy="12" r="6" fill={pocketColor} />
      <circle cx="100" cy="118" r="6" fill={pocketColor} />
      <circle cx="20" cy="18" r="4" fill="#1a1a1a" />
      <circle cx="180" cy="18" r="4" fill="#1a1a1a" />
      <circle cx="20" cy="112" r="4" fill="#1a1a1a" />
      <circle cx="180" cy="112" r="4" fill="#1a1a1a" />
      <circle cx="100" cy="12" r="3.5" fill="#1a1a1a" />
      <circle cx="100" cy="118" r="3.5" fill="#1a1a1a" />
      <circle cx="150" cy="65" r="2" fill={feltLight} opacity="0.6" />
      <circle cx="100" cy="65" r="1.5" fill={feltLight} opacity="0.5" />
      <circle cx="60" cy="65" r="1.5" fill={feltLight} opacity="0.5" />
      <circle cx="40" cy="65" r="1.5" fill={feltLight} opacity="0.5" />
      {occupied && pulse && (
        <circle
          cx="100"
          cy="65"
          r="25"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1.5"
          opacity="0.4"
        >
          <animate
            attributeName="r"
            values="20;35;20"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.5;0;0.5"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      <rect
        x="82"
        y="54"
        width="36"
        height="22"
        rx="4"
        fill="rgba(0,0,0,0.5)"
      />
      <text
        x="100"
        y="66"
        textAnchor="middle"
        fill="white"
        fontSize="9"
        fontWeight="bold"
        fontFamily="monospace"
      >
        {(tableName || `Table ${tableNumber}`).length > 10
          ? (tableName || `Table ${tableNumber}`).slice(0, 10) + "…"
          : tableName || `Table ${tableNumber}`}
      </text>
    </svg>
  );
}

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
interface Session {
  players: SessionPlayer[];
  gameType: string;
  gameUnit: string;
  gameRate: number;
  startTime: number;
}
interface Table {
  id: number;
  name: string;
  status: "available" | "occupied";
  session: Session | null;
}
interface CompletedSession {
  id: string;
  tableNo: number;
  players: SessionPlayer[];
  gameType: string;
  duration: string;
  totalAmount: number;
  endTime: number;
  paymentMethod?:
    | "Cash"
    | "EasyPaisa"
    | "JazzCash"
    | "OnCredit"
    | "DebtPayment";
  settledMethod?: "Cash" | "EasyPaisa" | "JazzCash";
  creditPlayerName?: string;
}

// ─── Helpers ───────────────────────────────────────────────
function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
function getElapsed(session: Session) {
  return Math.floor((Date.now() - session.startTime) / 1000);
}
function calcBill(session: Session, elapsed: number) {
  if (session.gameUnit === "per hour")
    return Math.ceil((elapsed / 3600) * session.gameRate);
  return session.gameRate;
}
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}
function isToday(ts: number) {
  const d = new Date(ts),
    n = new Date();
  return (
    d.getDate() === n.getDate() &&
    d.getMonth() === n.getMonth() &&
    d.getFullYear() === n.getFullYear()
  );
}

const navLinks = [
  { label: "Dashboard", icon: FiHome, href: "/dashboard", active: true },
  { label: "Tables", icon: FiSquare, href: "/tables", active: false },
  { label: "Players", icon: FiUsers, href: "/members", active: false },
  { label: "Payments", icon: FiDollarSign, href: "/payments", active: false },
  { label: "Games", icon: FiTarget, href: "/games", active: false },
  { label: "Profile", icon: FiSettings, href: "/profile", active: false },
];

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

// ─── Main Page ─────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<ClubUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tables, setTables] = useState<Table[]>([]);
  const [allSessions, setAllSessions] = useState<CompletedSession[]>([]);
  const [debts, setDebts] = useState<Record<string, number>>({});
  const [tick, setTick] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const stored = localStorage.getItem("club_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const u: ClubUser = JSON.parse(stored);
    setUser(u);

    const savedTables = localStorage.getItem(`club_tables_${u.email}`);
    setTables(
      savedTables
        ? JSON.parse(savedTables)
        : Array.from({ length: u.tables }, (_, i) => ({
            id: i + 1,
            name: `Table ${i + 1}`,
            status: "available",
            session: null,
          })),
    );

    const recent = localStorage.getItem(`club_recent_${u.email}`);
    if (recent) setAllSessions(JSON.parse(recent));

    const savedDebts = localStorage.getItem(`club_debts_${u.email}`);
    if (savedDebts) setDebts(JSON.parse(savedDebts));
    else setDebts({});
  }, [router]);

  useEffect(() => {
    const onFocus = () => {
      if (!user) return;
      const recent = localStorage.getItem(`club_recent_${user.email}`);
      if (recent) setAllSessions(JSON.parse(recent));
      const savedDebts = localStorage.getItem(`club_debts_${user.email}`);
      setDebts(savedDebts ? JSON.parse(savedDebts) : {});
      const savedTables = localStorage.getItem(`club_tables_${user.email}`);
      if (savedTables) setTables(JSON.parse(savedTables));
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("club_user");
    router.push("/login");
  };

  if (!user)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );

  // ── Today's sessions from club_recent ─────────────────
  const todaySessions = allSessions.filter((s) => isToday(s.endTime));

  // ✅ FIX 1: REVENUE = Everything EXCEPT OnCredit
  const todayRevenue = todaySessions
    .filter((s) => s.paymentMethod !== "OnCredit")
    .reduce((a, s) => a + s.totalAmount, 0);

  // ✅ FIX 2: ACTIVE CREDIT = OnCredit sessions where player STILL owes money
  const todayCreditSessions = todaySessions.filter((s) => {
    if (s.paymentMethod !== "OnCredit") return false;
    if (!s.creditPlayerName) return false;
    const currentDebt = debts[s.creditPlayerName] || 0;
    return currentDebt > 0; // Only count if debt still exists
  });

  const todayCreditTotal = todayCreditSessions.reduce(
    (a, s) => a + s.totalAmount,
    0,
  );

  // ✅ FIX 3: SETTLED CREDIT = OnCredit sessions that have been fully paid
  const todayCreditSettled = todaySessions
    .filter((s) => s.paymentMethod === "OnCredit")
    .filter((s) => {
      if (!s.creditPlayerName) return false;
      const currentDebt = debts[s.creditPlayerName] || 0;
      return currentDebt === 0; // Debt was cleared
    })
    .reduce((a, s) => a + s.totalAmount, 0);

  // ✅ FIX 4: SESSION COUNT = Real game sessions only (not debt payment records)
  const todayGameSessions = todaySessions.filter(
    (s) => s.gameType !== "Debt Payment",
  );
  const todaySessionCount = todayGameSessions.length;

  const todayPaidCount = todayGameSessions.filter(
    (s) => s.paymentMethod !== "OnCredit",
  ).length;
  const todayCreditCount = todayGameSessions.filter(
    (s) => s.paymentMethod === "OnCredit",
  ).length;

  // ── Debt payments settled today ───────────────────────
  const todayDebtPaid = todaySessions
    .filter((s) => s.paymentMethod === "DebtPayment")
    .reduce((a, s) => a + s.totalAmount, 0);

  // ── Live table stats ──────────────────────────────────
  const occupiedTables = tables.filter((t) => t.status === "occupied");
  const availableTables = tables.filter((t) => t.status === "available");
  const activePlayers = occupiedTables.reduce(
    (acc, t) => acc + (t.session?.players.length || 0),
    0,
  );

  // ── Outstanding debts ─────────────────────────────────
  const totalDebt = Object.values(debts).reduce((a, b) => a + b, 0);
  const debtorCount = Object.values(debts).filter((v) => v > 0).length;
  const debtors = Object.entries(debts).filter(([, v]) => v > 0);

  // ── Insights ──────────────────────────────────────────
  const gameSessions = allSessions.filter((s) => s.gameType !== "Debt Payment");
  const gameCounts = gameSessions.reduce(
    (acc, s) => {
      acc[s.gameType] = (acc[s.gameType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const popularGame =
    Object.entries(gameCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
  const tableCounts = gameSessions.reduce(
    (acc, s) => {
      acc[s.tableNo] = (acc[s.tableNo] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>,
  );
  const busiestTable =
    Object.entries(tableCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
  const avgPerSession =
    todaySessionCount > 0 ? Math.round(todayRevenue / todaySessionCount) : 0;

  // ── Today's session list ──────────────────────────────
  const todayVisible = todaySessions
    .slice()
    .sort((a, b) => b.endTime - a.endTime)
    .slice(0, 15);

  void tick;

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
                  Dashboard
                </h1>
                <p className="text-slate-500 text-[11px] leading-tight">
                  {currentTime.toLocaleDateString("en-PK", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 border border-slate-700/50 rounded-xl px-3 py-1.5">
                <FiClock className="text-slate-500 text-xs" />
                <span className="text-slate-300 text-xs font-mono tracking-wide">
                  {currentTime.toLocaleTimeString("en-PK", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>

              <div
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium ${
                  occupiedTables.length > 0
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${occupiedTables.length > 0 ? "bg-red-400 animate-pulse" : "bg-emerald-400"}`}
                />
                {occupiedTables.length > 0
                  ? `${occupiedTables.length} Active`
                  : "All Free"}
              </div>

              <button className="relative p-2 bg-slate-900/80 border border-slate-700/50 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition-all">
                <FiBell className="text-base" />
                {(occupiedTables.length > 0 || totalDebt > 0) && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-orange-500 rounded-full" />
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 space-y-6" suppressHydrationWarning>
          <div className="relative bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl p-5 overflow-hidden">
            <p className="text-blue-400 text-sm font-medium">
              {getGreeting()}, {user.owner_name.split(" ")[0]}
            </p>
            <h2 className="text-white text-xl font-bold mt-0.5">
              {user.club_name}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {occupiedTables.length > 0
                ? `${occupiedTables.length} table${occupiedTables.length > 1 ? "s" : ""} active right now with ${activePlayers} player${activePlayers !== 1 ? "s" : ""}`
                : "All tables are free — ready for players!"}
            </p>
          </div>

          {/* ✅ FIXED: Revenue card shows only collected money, credit info in subtitle */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Today's Revenue",
                value: `Rs. ${todayRevenue.toLocaleString()}`,
                icon: FiDollarSign,
                color: "emerald",
                sub:
                  todayCreditTotal > 0
                    ? `Rs. ${todayCreditTotal.toLocaleString()} unpaid (${todayCreditSessions.length} session${todayCreditSessions.length !== 1 ? "s" : ""})`
                    : todayCreditSettled > 0
                      ? `All credit settled (Rs. ${todayCreditSettled.toLocaleString()})`
                      : `${todayPaidCount} paid session${todayPaidCount !== 1 ? "s" : ""}`,
              },
              {
                label: "Sessions Today",
                value: todaySessionCount,
                icon: FiActivity,
                color: "blue",
                sub:
                  todayCreditCount > 0
                    ? `${todayPaidCount} paid • ${todayCreditCount} on credit`
                    : `${todaySessionCount} completed`,
              },
              {
                label: "Tables Occupied",
                value: `${occupiedTables.length} / ${tables.length}`,
                icon: FiSquare,
                color: occupiedTables.length > 0 ? "red" : "slate",
                sub: `${availableTables.length} available`,
              },
              {
                label: "Active Players",
                value: activePlayers,
                icon: FiUsers,
                color: "purple",
                sub: "Right now",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5 hover:border-slate-600/60 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-400 text-xs font-medium">
                    {s.label}
                  </p>
                  <div
                    className={`p-2 rounded-lg ${
                      s.color === "emerald"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : s.color === "blue"
                          ? "bg-blue-500/10   text-blue-400"
                          : s.color === "red"
                            ? "bg-red-500/10    text-red-400"
                            : s.color === "purple"
                              ? "bg-purple-500/10 text-purple-400"
                              : "bg-slate-800      text-slate-400"
                    }`}
                  >
                    <s.icon className="text-sm" />
                  </div>
                </div>
                <p
                  className={`text-2xl font-bold ${
                    s.color === "emerald"
                      ? "text-emerald-400"
                      : s.color === "blue"
                        ? "text-blue-400"
                        : s.color === "red"
                          ? "text-red-400"
                          : s.color === "purple"
                            ? "text-purple-400"
                            : "text-white"
                  }`}
                >
                  {s.value}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    todayCreditTotal > 0 && s.label === "Today's Revenue"
                      ? "text-orange-400/70"
                      : "text-slate-500"
                  }`}
                >
                  {s.sub}
                </p>
              </div>
            ))}
          </div>

          {/* ✅ FIXED: Warning only shows remaining unpaid credit */}
          {todayCreditTotal > 0 && (
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl px-5 py-4 flex items-start gap-3">
              <FiAlertTriangle className="text-orange-400 text-base shrink-0 mt-0.5" />
              <div>
                <p className="text-orange-400 font-semibold text-sm">
                  Rs. {todayCreditTotal.toLocaleString()} Outstanding — Not in
                  Revenue Yet
                </p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {todayCreditSessions.length} session
                  {todayCreditSessions.length !== 1 ? "s" : ""} unpaid.
                  {todayCreditSettled > 0 && (
                    <span className="text-emerald-400 font-medium">
                      {" "}
                      Rs. {todayCreditSettled.toLocaleString()} was settled
                      today.
                    </span>
                  )}{" "}
                  Go to{" "}
                  <a
                    href="/members"
                    className="text-blue-400 underline font-medium"
                  >
                    Players
                  </a>{" "}
                  to collect — settlements are added to revenue automatically.
                </p>
              </div>
            </div>
          )}

          {todayCreditTotal === 0 && todayCreditSettled > 0 && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl px-5 py-4 flex items-start gap-3">
              <FiCheckCircle className="text-emerald-400 text-base shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-400 font-semibold text-sm">
                  All Credit Settled
                </p>
                <p className="text-slate-400 text-xs mt-0.5">
                  Rs. {todayCreditSettled.toLocaleString()} in credit was
                  collected today and added to revenue.
                </p>
              </div>
            </div>
          )}

          {todayDebtPaid > 0 && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl px-5 py-3 flex items-center gap-3">
              <FiCheckCircle className="text-blue-400 text-base shrink-0" />
              <p className="text-slate-400 text-xs">
                <span className="text-blue-400 font-semibold">
                  Rs. {todayDebtPaid.toLocaleString()}
                </span>{" "}
                in old debt collected today — included in today's revenue.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700/40 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">Live Tables</h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Real-time status
                  </p>
                </div>
                <a
                  href="/tables"
                  className="text-blue-400 text-xs hover:underline"
                >
                  Manage →
                </a>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {tables.map((table) => {
                    const elapsed = table.session
                      ? getElapsed(table.session)
                      : 0;
                    const bill = table.session
                      ? calcBill(table.session, elapsed)
                      : 0;
                    const isOccupied = table.status === "occupied";
                    return (
                      <a
                        href="/tables"
                        key={table.id}
                        className={`rounded-xl border overflow-hidden transition-all hover:scale-105 cursor-pointer ${
                          isOccupied
                            ? "border-red-500/30 bg-red-500/5"
                            : "border-slate-700/40 bg-slate-900/60 hover:border-slate-600/60"
                        }`}
                      >
                        <div
                          className={`h-0.5 w-full ${isOccupied ? "bg-red-500" : "bg-emerald-500"}`}
                        />
                        <div className="p-2">
                          <SnookerTableSVG
                            occupied={isOccupied}
                            tableNumber={table.id}
                            tableName={table.name || `Table ${table.id}`}
                            pulse={isOccupied}
                          />
                          <div className="flex items-center justify-between mt-1.5 mb-1">
                            <div className="flex items-center gap-1">
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${isOccupied ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`}
                              />
                              <span
                                className={`text-[10px] font-semibold ${isOccupied ? "text-red-400" : "text-emerald-400"}`}
                              >
                                {isOccupied ? "In Use" : "Free"}
                              </span>
                            </div>
                            {isOccupied && (
                              <span className="text-white font-mono text-[10px] font-bold">
                                {formatTime(elapsed)}
                              </span>
                            )}
                          </div>
                          {isOccupied && table.session && (
                            <div>
                              <div className="space-y-0.5 mb-1">
                                {table.session.players
                                  .slice(0, 2)
                                  .map((p, i) => (
                                    <p
                                      key={i}
                                      className="text-slate-300 text-[10px] truncate"
                                    >
                                      {p.name}
                                    </p>
                                  ))}
                                {table.session.players.length > 2 && (
                                  <p className="text-slate-500 text-[9px]">
                                    +{table.session.players.length - 2} more
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500 text-[9px]">
                                  {table.session.gameType}
                                </span>
                                <span className="text-emerald-400 text-[10px] font-bold">
                                  Rs.{bill}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-4 px-1">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />{" "}
                    Available
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />{" "}
                    Occupied
                  </span>
                </div>
              </div>
            </div>

            {/* ✅ FIXED: Credit badge only shows on unpaid sessions */}
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700/40 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">Today's Activity</h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {todaySessionCount} game session
                    {todaySessionCount !== 1 ? "s" : ""}
                    {todayDebtPaid > 0
                      ? ` • ${todaySessions.filter((s) => s.paymentMethod === "DebtPayment").length} debt settled`
                      : ""}
                  </p>
                </div>
                <a
                  href="/payments"
                  className="text-blue-400 text-xs hover:underline"
                >
                  View all →
                </a>
              </div>

              {todaySessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-12 h-12 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-3">
                    <FiClock className="text-slate-600 text-xl" />
                  </div>
                  <p className="text-slate-500 text-sm">
                    No activity yet today
                  </p>
                  <p className="text-slate-600 text-xs mt-1">
                    Completed sessions will appear here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700/30 max-h-80 overflow-y-auto">
                  {todayVisible.map((s) => {
                    const isCredit = s.paymentMethod === "OnCredit";
                    const isDebt = s.paymentMethod === "DebtPayment";
                    const wasSettled =
                      isCredit &&
                      s.creditPlayerName &&
                      (debts[s.creditPlayerName] || 0) === 0;

                    return (
                      <div
                        key={s.id}
                        className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-800/30 transition-colors"
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            isDebt
                              ? "bg-blue-600/15 border-blue-500/20"
                              : wasSettled
                                ? "bg-emerald-500/15 border-emerald-500/20"
                                : isCredit
                                  ? "bg-orange-500/10 border-orange-500/20"
                                  : "bg-blue-600/20 border-blue-500/20"
                          }`}
                        >
                          {isDebt || wasSettled ? (
                            <FiCheckCircle
                              className={`text-sm ${isDebt ? "text-blue-400" : "text-emerald-400"}`}
                            />
                          ) : (
                            <span
                              className={`text-xs font-bold ${isCredit ? "text-orange-400" : "text-blue-400"}`}
                            >
                              T{s.tableNo || "—"}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {isDebt
                              ? `${s.players[0]?.name} — Debt Settled`
                              : s.players.map((p) => p.name).join(" vs ")}
                          </p>
                          <p className="text-slate-500 text-xs mt-0.5">
                            {isDebt
                              ? `Via ${s.settledMethod ?? "Cash"}`
                              : `${s.gameType} • ${s.duration}`}
                          </p>
                        </div>

                        {isCredit && !wasSettled && (
                          <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-lg shrink-0">
                            Unpaid
                          </span>
                        )}
                        {wasSettled && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-lg shrink-0">
                            Settled
                          </span>
                        )}

                        <div className="text-right shrink-0">
                          <p
                            className={`font-bold text-sm ${
                              isCredit && !wasSettled
                                ? "text-orange-400"
                                : isDebt || wasSettled
                                  ? "text-blue-400"
                                  : "text-emerald-400"
                            }`}
                          >
                            Rs. {s.totalAmount.toLocaleString()}
                          </p>
                          <p className="text-slate-600 text-xs">
                            {new Date(s.endTime).toLocaleTimeString("en-PK", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {totalDebt > 0 && (
            <div className="bg-slate-900/60 border border-orange-500/20 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-xl">
                    <FiAlertTriangle className="text-orange-400 text-lg" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      Outstanding Debts
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {debtorCount} player{debtorCount > 1 ? "s" : ""} owe money
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-orange-400 font-bold text-lg">
                    Rs. {totalDebt.toLocaleString()}
                  </p>
                  <p className="text-slate-500 text-xs">Total outstanding</p>
                </div>
              </div>
              <div className="divide-y divide-slate-700/30">
                {debtors.map(([playerName, amount]) => (
                  <div
                    key={playerName}
                    className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-orange-400 text-xs font-bold">
                          {playerName.charAt(0)}
                        </span>
                      </div>
                      <span className="text-white text-sm font-medium">
                        {playerName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-orange-400 font-bold text-sm">
                        Rs. {amount.toLocaleString()}
                      </span>
                      <a
                        href="/members"
                        className="text-xs text-blue-400 hover:underline"
                      >
                        Settle →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Most Popular Game",
                value: popularGame,
                icon: FiSquare,
                color: "blue",
                sub:
                  popularGame !== "—"
                    ? `${gameCounts[popularGame]} sessions`
                    : "No data yet",
              },
              {
                label: "Busiest Table",
                value: busiestTable !== "—" ? `Table ${busiestTable}` : "—",
                icon: FiAward,
                color: "yellow",
                sub:
                  busiestTable !== "—"
                    ? `${tableCounts[Number(busiestTable)]} sessions`
                    : "No data yet",
              },
              {
                label: "Avg. per Session",
                value:
                  avgPerSession > 0
                    ? `Rs. ${avgPerSession.toLocaleString()}`
                    : "—",
                icon: FiTrendingUp,
                color: "purple",
                sub:
                  todaySessionCount > 0 ? "Today's average" : "No sessions yet",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`p-2 rounded-xl ${
                      s.color === "blue"
                        ? "bg-blue-500/10   text-blue-400"
                        : s.color === "yellow"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-purple-500/10 text-purple-400"
                    }`}
                  >
                    <s.icon className="text-lg" />
                  </div>
                  <p className="text-slate-400 text-xs font-medium">
                    {s.label}
                  </p>
                </div>
                <p className="text-white text-xl font-bold">{s.value}</p>
                <p className="text-slate-500 text-xs mt-1">{s.sub}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
