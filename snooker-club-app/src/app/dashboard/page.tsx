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
} from "react-icons/fi";
import { GiPoolTriangle, GiSoccerBall } from "react-icons/gi";

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
      {/* Outer wooden frame */}
      <rect x="2" y="2" width="196" height="126" rx="10" fill={borderColor} />

      {/* Cushion border */}
      <rect x="10" y="10" width="180" height="110" rx="7" fill={cushionColor} />

      {/* Felt surface */}
      <rect x="20" y="18" width="160" height="94" rx="3" fill={feltColor} />

      {/* Felt texture lines */}
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

      {/* Baulk line */}
      <line
        x1="60"
        y1="18"
        x2="60"
        y2="112"
        stroke={feltLight}
        strokeWidth="0.8"
        opacity="0.4"
      />

      {/* D semicircle */}
      <path
        d={`M 60 55 A 15 15 0 0 1 60 75`}
        fill="none"
        stroke={feltLight}
        strokeWidth="0.8"
        opacity="0.4"
      />

      {/* Corner Pockets */}
      <circle cx="20" cy="18" r="7" fill={pocketColor} />
      <circle cx="180" cy="18" r="7" fill={pocketColor} />
      <circle cx="20" cy="112" r="7" fill={pocketColor} />
      <circle cx="180" cy="112" r="7" fill={pocketColor} />

      {/* Middle Pockets */}
      <circle cx="100" cy="12" r="6" fill={pocketColor} />
      <circle cx="100" cy="118" r="6" fill={pocketColor} />

      {/* Pocket highlights */}
      <circle cx="20" cy="18" r="4" fill="#1a1a1a" />
      <circle cx="180" cy="18" r="4" fill="#1a1a1a" />
      <circle cx="20" cy="112" r="4" fill="#1a1a1a" />
      <circle cx="180" cy="112" r="4" fill="#1a1a1a" />
      <circle cx="100" cy="12" r="3.5" fill="#1a1a1a" />
      <circle cx="100" cy="118" r="3.5" fill="#1a1a1a" />

      {/* Spot dots on felt */}
      <circle cx="150" cy="65" r="2" fill={feltLight} opacity="0.6" />
      <circle cx="100" cy="65" r="1.5" fill={feltLight} opacity="0.5" />
      <circle cx="60" cy="65" r="1.5" fill={feltLight} opacity="0.5" />
      <circle cx="40" cy="65" r="1.5" fill={feltLight} opacity="0.5" />

      {/* Pulse animation ring when occupied */}
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

      {/* Table number badge */}
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
}

// ─── Helpers ──────────────────────────────────────────────
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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function calcBill(session: Session, elapsed: number) {
  if (session.gameUnit === "per hour") {
    return Math.ceil((elapsed / 3600) * session.gameRate);
  }
  return session.gameRate;
}

const navLinks = [
  { label: "Dashboard", icon: FiHome, href: "/dashboard", active: true },
  { label: "Tables", icon: FiSquare, href: "/tables", active: false },
  { label: "Players", icon: FiUsers, href: "/members", active: false },
  { label: "Payments", icon: FiDollarSign, href: "/payments", active: false },
  { label: "Games", icon: FiSquare, href: "/games", active: false },
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

// ─── Main ──────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<ClubUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tables, setTables] = useState<Table[]>([]);
  const [recentSessions, setRecentSessions] = useState<CompletedSession[]>([]);
  const [debts, setDebts] = useState<Record<string, number>>({});
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todaySessions, setTodaySessions] = useState(0);
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

    // Load tables
    const savedTables = localStorage.getItem(`club_tables_${u.email}`);
    setTables(
      savedTables
        ? JSON.parse(savedTables)
        : Array.from({ length: u.tables }, (_, i) => ({
            id: i + 1,
            status: "available",
            session: null,
          })),
    );

    // Load today stats
    const stats = localStorage.getItem(`club_today_${u.email}`);
    if (stats) {
      const s = JSON.parse(stats);
      setTodayRevenue(s.revenue || 0);
      setTodaySessions(s.sessions || 0);
    }

    // Load recent sessions
    const recent = localStorage.getItem(`club_recent_${u.email}`);
    if (recent) setRecentSessions(JSON.parse(recent));
    const savedDebts = localStorage.getItem(`club_debts_${u.email}`);
    if (savedDebts) setDebts(JSON.parse(savedDebts));
  }, [router]);

  // Live tick every second
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

  const totalDebt = Object.values(debts).reduce((a, b) => a + b, 0);
  const debtorCount = Object.keys(debts).length;
  const debtors = Object.entries(debts).filter(([, amount]) => amount > 0);
  const occupiedTables = tables.filter((t) => t.status === "occupied");
  const availableTables = tables.filter((t) => t.status === "available");
  const activePlayers = occupiedTables.reduce(
    (acc, t) => acc + (t.session?.players.length || 0),
    0,
  );

  // Most popular game from recent sessions
  const gameCounts = recentSessions.reduce(
    (acc, s) => {
      acc[s.gameType] = (acc[s.gameType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const popularGame =
    Object.entries(gameCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  // Busiest table
  const tableCounts = recentSessions.reduce(
    (acc, s) => {
      acc[s.tableNo] = (acc[s.tableNo] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>,
  );
  const busiestTable =
    Object.entries(tableCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

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
            {/* Left — menu + page title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <FiMenu className="text-lg" />
              </button>

              {/* Divider — desktop only */}
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

            {/* Right — clock + status + bell */}
            <div className="flex items-center gap-2">
              {/* Live clock */}
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

              {/* Tables status pill */}
              <div
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium ${
                  occupiedTables.length > 0
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    occupiedTables.length > 0
                      ? "bg-red-400 animate-pulse"
                      : "bg-emerald-400"
                  }`}
                />
                {occupiedTables.length > 0
                  ? `${occupiedTables.length} Active`
                  : "All Free"}
              </div>

              {/* Bell */}
              <button className="relative p-2 bg-slate-900/80 border border-slate-700/50 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition-all">
                <FiBell className="text-base" />
                {occupiedTables.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 space-y-6" suppressHydrationWarning>
          {/* Welcome */}
          <div className="relative bg-linear-to-r from-blue-600/20 via-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl p-5 overflow-hidden">
            <div className="relative">
              <p className="text-blue-400 text-sm font-medium">
                {getGreeting()}, {user.owner_name.split(" ")[0]}
              </p>
              <h2 className="text-white text-xl font-bold mt-0.5">
                {user.club_name}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {occupiedTables.length > 0
                  ? `${occupiedTables.length} table${occupiedTables.length > 1 ? "s" : ""} active right now with ${activePlayers} players`
                  : "All tables are free. Ready for players!"}
              </p>
            </div>
          </div>

          {/* Today's Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Today's Revenue",
                value: `Rs. ${todayRevenue.toLocaleString()}`,
                icon: FiDollarSign,
                color: "emerald",
                sub: `${todaySessions} sessions`,
              },
              {
                label: "Sessions Today",
                value: todaySessions,
                icon: FiActivity,
                color: "blue",
                sub: "Completed",
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
                          ? "bg-blue-500/10 text-blue-400"
                          : s.color === "red"
                            ? "bg-red-500/10 text-red-400"
                            : s.color === "purple"
                              ? "bg-purple-500/10 text-purple-400"
                              : "bg-slate-800 text-slate-400"
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
                <p className="text-slate-500 text-xs mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Live Tables + Today History */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Live Table Grid */}
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700/40 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">Live Tables</h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Real time status
                  </p>
                </div>
                <a
                  href="/tables"
                  className="text-blue-400 text-xs hover:underline flex items-center gap-1"
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
                        {/* Status Bar */}
                        <div
                          className={`h-0.5 w-full ${isOccupied ? "bg-red-500" : "bg-emerald-500"}`}
                        />

                        <div className="p-2">
                          {/* SVG Table */}
                          <SnookerTableSVG
                            occupied={isOccupied}
                            tableNumber={table.id}
                            tableName={table.name || `Table ${table.id}`}
                            pulse={isOccupied}
                          />

                          {/* Status & Timer */}
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

                          {/* Players & Bill */}
                          {isOccupied && table.session ? (
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
                          ) : null}
                        </div>
                      </a>
                    );
                  })}
                </div>

                {/* Legend */}
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

            {/* Today's Session History */}
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700/40 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">Today's Sessions</h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {recentSessions.length} completed
                  </p>
                </div>
                <a
                  href="/payments"
                  className="text-blue-400 text-xs hover:underline"
                >
                  View all →
                </a>
              </div>

              {recentSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-12 h-12 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-3">
                    <FiClock className="text-slate-600 text-xl" />
                  </div>
                  <p className="text-slate-500 text-sm">
                    No sessions yet today
                  </p>
                  <p className="text-slate-600 text-xs mt-1">
                    Completed sessions will appear here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700/30 max-h-72 overflow-y-auto">
                  {recentSessions.slice(0, 10).map((s) => (
                    <div
                      key={s.id}
                      className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Table Badge */}
                      <div className="w-9 h-9 bg-blue-600/20 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-blue-400 text-xs font-bold">
                          T{s.tableNo}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {s.players.map((p) => p.name).join(" vs ")}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {s.gameType} • {s.duration}
                        </p>
                      </div>

                      {/* Amount + Time */}
                      <div className="text-right shrink-0">
                        <p className="text-emerald-400 font-bold text-sm">
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
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Outstanding Debts */}
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

          {/* Quick Insights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Most Popular Game",
                value: popularGame,
                icon: FiSquare,
                sub:
                  popularGame !== "—"
                    ? `${gameCounts[popularGame]} sessions`
                    : "No data yet",
                color: "blue",
              },
              {
                label: "Busiest Table",
                value: busiestTable !== "—" ? `Table ${busiestTable}` : "—",
                icon: FiAward,
                sub:
                  busiestTable !== "—"
                    ? `${tableCounts[Number(busiestTable)]} sessions`
                    : "No data yet",
                color: "yellow",
              },
              {
                label: "Avg. per Session",
                value:
                  todaySessions > 0
                    ? `Rs. ${Math.round(todayRevenue / todaySessions).toLocaleString()}`
                    : "—",
                icon: FiTrendingUp,
                sub: todaySessions > 0 ? "Today average" : "No sessions yet",
                color: "purple",
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
                        ? "bg-blue-500/10 text-blue-400"
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
