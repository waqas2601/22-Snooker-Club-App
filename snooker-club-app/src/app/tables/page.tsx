"use client";

import { useState, useEffect, useCallback } from "react";
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
  FiX,
  FiPlus,
  FiSearch,
  FiCheck,
  FiUser,
  FiMinus,
  FiAlertTriangle,
  FiMapPin,
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

interface Player {
  id: string;
  name: string;
  phone: string;
}

interface SessionPlayer {
  name: string;
  isRegistered: boolean;
  playerId?: string;
}

interface PaymentSplit {
  playerName: string;
  amount: number;
}

interface Session {
  players: SessionPlayer[];
  gameType: string;
  gameUnit: string;
  gameRate: number;
  startTime: number;
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
  creditPlayerName?: string;
}

interface Table {
  id: number;
  name: string;
  status: "available" | "occupied";
  session: Session | null;
}

interface GameType {
  id: string;
  name: string;
  rate: number;
  unit: string;
  enabled: boolean;
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

function calcBill(session: Session, elapsed: number) {
  if (session.gameUnit === "per hour") {
    return Math.ceil((elapsed / 3600) * session.gameRate);
  }
  return session.gameRate;
}

const navLinks = [
  { label: "Dashboard", icon: FiHome, href: "/dashboard", active: false },
  { label: "Tables", icon: FiSquare, href: "/tables", active: true },
  { label: "Players", icon: FiUsers, href: "/members", active: false },
  { label: "Payments", icon: FiDollarSign, href: "/payments", active: false },
  { label: "Games", icon: FiSquare, href: "/games", active: false },
  { label: "Profile", icon: FiSettings, href: "/profile", active: false },
];

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

// ─── Player Search Input ───────────────────────────────────
function PlayerSearchInput({
  index,
  value,
  onChange,
  onRemove,
  savedPlayers,
  canRemove,
}: {
  index: number;
  value: string;
  onChange: (v: string) => void;
  onRemove: () => void;
  savedPlayers: Player[];
  canRemove: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const suggestions = savedPlayers.filter(
    (p) =>
      p.name.toLowerCase().includes(value.toLowerCase()) && value.length > 0,
  );

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="shrink-0 w-6 h-6 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center">
          <span className="text-blue-400 text-xs font-bold">{index + 1}</span>
        </div>
        <div className="relative flex-1">
          <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder={`Player ${index + 1} name...`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            className="w-full bg-slate-800/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
          {focused && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700/50 rounded-xl overflow-hidden z-10 shadow-xl">
              {suggestions.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onMouseDown={() => onChange(p.name)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-700/50 transition-colors text-left"
                >
                  <div className="w-7 h-7 bg-blue-600/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-blue-400 text-xs font-bold">
                      {p.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{p.name}</p>
                    {p.phone && (
                      <p className="text-slate-500 text-xs">{p.phone}</p>
                    )}
                  </div>
                  <FiSearch className="ml-auto text-slate-500 text-xs" />
                </button>
              ))}
              <div className="px-3 py-2 border-t border-slate-700/40">
                <p className="text-slate-600 text-xs">
                  Or continue typing for walk-in player
                </p>
              </div>
            </div>
          )}
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <FiX className="text-sm" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Start Session Modal ───────────────────────────────────
function StartSessionModal({
  table,
  savedPlayers,
  gameTypes,
  onClose,
  onStart,
}: {
  table: Table;
  savedPlayers: Player[];
  gameTypes: GameType[];
  onClose: () => void;
  onStart: (
    tableId: number,
    players: SessionPlayer[],
    gameType: string,
    gameUnit: string,
    gameRate: number,
  ) => void;
}) {
  const [playerNames, setPlayerNames] = useState(["", ""]);
  const [selectedGame, setSelectedGame] = useState<GameType | null>(
    gameTypes.find((g) => g.enabled) || null,
  );
  const activeGames = gameTypes.filter((g) => g.enabled);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame) return;
    const filled = playerNames.filter((n) => n.trim());
    if (filled.length < 1) return;
    const players: SessionPlayer[] = filled.map((name) => {
      const saved = savedPlayers.find(
        (p) => p.name.toLowerCase() === name.toLowerCase(),
      );
      return {
        name: saved ? saved.name : name.trim(),
        isRegistered: !!saved,
        playerId: saved?.id,
      };
    });
    onStart(
      table.id,
      players,
      selectedGame.name,
      selectedGame.unit,
      selectedGame.rate,
    );
    onClose();
  };

  const filledCount = playerNames.filter((n) => n.trim()).length;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/40">
          <div>
            <h2 className="text-white font-bold text-lg">Start Session</h2>
            <p className="text-slate-400 text-xs mt-0.5">Table {table.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FiX />
          </button>
        </div>
        <form onSubmit={handleStart} className="p-6 space-y-6">
          {/* Game Type */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-3">
              Select Game Type
            </label>
            {activeGames.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-sm">No active game types.</p>
                <a
                  href="/games"
                  className="text-blue-400 text-xs hover:underline"
                >
                  Go to Games page to enable
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {activeGames.map((game) => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => setSelectedGame(game)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedGame?.id === game.id
                        ? "bg-blue-600/20 border-blue-500/50 ring-1 ring-blue-500/30"
                        : "bg-slate-800/50 border-slate-700/40 hover:border-slate-600"
                    }`}
                  >
                    <p
                      className={`text-sm font-semibold ${selectedGame?.id === game.id ? "text-blue-400" : "text-white"}`}
                    >
                      {game.name}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Rs. {game.rate} / {game.unit.replace("per ", "")}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Players */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-slate-300 text-sm font-semibold">
                Players{" "}
                <span className="text-slate-500 text-xs font-normal">
                  ({filledCount} added)
                </span>
              </label>
              {playerNames.length < 4 && (
                <button
                  type="button"
                  onClick={() => setPlayerNames([...playerNames, ""])}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <FiPlus /> Add Player
                </button>
              )}
            </div>
            <div className="space-y-2.5">
              {playerNames.map((name, i) => (
                <PlayerSearchInput
                  key={i}
                  index={i}
                  value={name}
                  onChange={(v) =>
                    setPlayerNames(
                      playerNames.map((p, idx) => (idx === i ? v : p)),
                    )
                  }
                  onRemove={() =>
                    setPlayerNames(playerNames.filter((_, idx) => idx !== i))
                  }
                  savedPlayers={savedPlayers}
                  canRemove={playerNames.length > 2}
                />
              ))}
            </div>
            <p className="text-slate-600 text-xs mt-2">
              Min 2 players • Max 4 players
            </p>
          </div>
          {/* Summary */}
          {selectedGame && filledCount > 0 && (
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Game</span>
                <span className="text-white font-medium">
                  {selectedGame.name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Rate</span>
                <span className="text-white">
                  Rs. {selectedGame.rate} /{" "}
                  {selectedGame.unit.replace("per ", "")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Players</span>
                <span className="text-white">{filledCount}</span>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedGame || filledCount < 1}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <FiCheck /> Start Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── End Session Modal ─────────────────────────────────────
function EndSessionModal({
  table,
  elapsed,
  onClose,
  onEnd,
}: {
  table: Table;
  elapsed: number;
  onClose: () => void;
  onEnd: (
    tableId: number,
    splits: PaymentSplit[],
    totalAmount: number,
    paymentMethod?: string,
    creditPlayerName?: string,
  ) => void;
}) {
  const session = table.session!;
  const totalBill = calcBill(session, elapsed);
  const playerCount = session.players.length;
  type SplitMode = "loser" | "equal" | "teams" | "custom";
  const [splitMode, setSplitMode] = useState<SplitMode>(
    playerCount < 3 ? "equal" : "equal",
  );
  const [loserIndex, setLoserIndex] = useState(0);
  const [losingTeam, setLosingTeam] = useState<"A" | "B">("B");
  const [teamAssignments, setTeamAssignments] = useState<
    Record<number, "A" | "B">
  >(() =>
    Object.fromEntries(
      session.players.map((_, i) => [
        i,
        i < Math.floor(session.players.length / 2) ? "A" : "B",
      ]),
    ),
  );
  const [customAmounts, setCustomAmounts] = useState<number[]>(
    session.players.map(() => Math.floor(totalBill / playerCount)),
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "Cash" | "EasyPaisa" | "JazzCash" | "OnCredit"
  >("Cash");
  const [creditPlayerId, setCreditPlayerId] = useState<string>("");
  const registeredPlayers = session.players.filter((p) => p.isRegistered);

  const getSplits = (): PaymentSplit[] => {
    if (splitMode === "loser")
      return session.players.map((p, i) => ({
        playerName: p.name,
        amount: i === loserIndex ? totalBill : 0,
      }));
    if (splitMode === "equal")
      return session.players.map((p) => ({
        playerName: p.name,
        amount: Math.ceil(totalBill / playerCount),
      }));
    if (splitMode === "teams") {
      const losingPlayers = session.players.filter(
        (_, i) => teamAssignments[i] === losingTeam,
      );
      const eachPays =
        losingPlayers.length > 0
          ? Math.ceil(totalBill / losingPlayers.length)
          : 0;
      return session.players.map((p, i) => ({
        playerName: p.name,
        amount: teamAssignments[i] === losingTeam ? eachPays : 0,
      }));
    }
    return session.players.map((p, i) => ({
      playerName: p.name,
      amount: customAmounts[i] || 0,
    }));
  };

  const customTotal = customAmounts.reduce((a, b) => a + b, 0);
  const teamsInvalid =
    splitMode === "teams" &&
    (["A", "B"] as const).some(
      (team) =>
        session.players.filter((_, i) => teamAssignments[i] === team).length ===
        0,
    );

  const collectDisabled =
    (splitMode === "custom" && customTotal !== totalBill) ||
    teamsInvalid ||
    (paymentMethod === "OnCredit" &&
      registeredPlayers.length > 0 &&
      !creditPlayerId);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/40">
          <div>
            <h2 className="text-white font-bold text-lg">End Session</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Table {table.id} • {formatTime(elapsed)} played
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FiX />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {/* Bill */}
          <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Total Bill</span>
              <span className="text-emerald-400 font-bold text-2xl">
                Rs. {totalBill.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                {session.gameType} • {session.players.length} Players
              </span>
              <span>{formatTime(elapsed)}</span>
            </div>
          </div>
          {/* Players */}
          <div>
            <p className="text-slate-400 text-xs font-medium mb-2">Players</p>
            <div className="flex flex-wrap gap-2">
              {session.players.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 bg-slate-800/50 border border-slate-700/40 rounded-lg px-2.5 py-1.5"
                >
                  <div className="w-5 h-5 bg-blue-600/30 rounded-full flex items-center justify-center">
                    <span className="text-blue-400 text-[10px] font-bold">
                      {p.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-white text-xs font-medium">
                    {p.name}
                  </span>
                  {p.isRegistered && (
                    <span className="text-blue-400 text-[10px]">★</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Split Mode */}
          <div>
            <p className="text-slate-300 text-sm font-semibold mb-3">
              How to split?
            </p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {(
                [
                  {
                    key: "loser",
                    label: "Loser Pays",
                    desc: "One player pays all",
                  },
                  {
                    key: "equal",
                    label: "Split Equal",
                    desc: "Divide equally",
                  },
                  { key: "teams", label: "Teams", desc: "Losing team pays" },
                  { key: "custom", label: "Custom", desc: "Set each amount" },
                ] as { key: SplitMode; label: string; desc: string }[]
              )
                .filter((m) => !(m.key === "teams" && playerCount < 3))
                .map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setSplitMode(m.key)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      splitMode === m.key
                        ? "bg-blue-600/20 border-blue-500/40 ring-1 ring-blue-500/20"
                        : "bg-slate-800/50 border-slate-700/40 hover:border-slate-600"
                    }`}
                  >
                    <p className="text-xs font-semibold text-white">
                      {m.label}
                    </p>
                    <p className="text-slate-500 text-[10px] mt-0.5">
                      {m.desc}
                    </p>
                  </button>
                ))}
              {teamsInvalid && (
                <p className="text-orange-400 text-xs flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
                  <FiAlertTriangle className="text-xs shrink-0" />
                  Both teams must have at least one player
                </p>
              )}
            </div>

            {splitMode === "loser" && (
              <div className="space-y-2">
                <p className="text-slate-400 text-xs mb-2">
                  Who lost? (pays Rs. {totalBill})
                </p>
                {session.players.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setLoserIndex(i)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      loserIndex === i
                        ? "bg-red-500/10 border-red-500/30"
                        : "bg-slate-800/50 border-slate-700/40 hover:border-slate-600"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${loserIndex === i ? "bg-red-500/20 text-red-400" : "bg-slate-700 text-slate-400"}`}
                    >
                      {p.name.charAt(0)}
                    </div>
                    <span
                      className={`text-sm font-medium flex-1 text-left ${loserIndex === i ? "text-red-400" : "text-white"}`}
                    >
                      {p.name}
                    </span>
                    {loserIndex === i && (
                      <span className="text-red-400 text-xs font-bold">
                        Rs. {totalBill}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {splitMode === "equal" && (
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 space-y-2">
                {session.players.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-600/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 text-[10px] font-bold">
                          {p.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-white text-sm">{p.name}</span>
                    </div>
                    <span className="text-emerald-400 font-semibold text-sm">
                      Rs. {Math.ceil(totalBill / playerCount)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {splitMode === "teams" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {(["A", "B"] as const).map((team) => (
                    <div
                      key={team}
                      className={`rounded-xl p-3 border ${team === "A" ? "bg-blue-500/5 border-blue-500/20" : "bg-red-500/5 border-red-500/20"}`}
                    >
                      <p
                        className={`text-xs font-semibold mb-2 ${team === "A" ? "text-blue-400" : "text-red-400"}`}
                      >
                        Team {team}
                      </p>
                      <div className="space-y-1 min-h-8">
                        {session.players
                          .filter((_, i) => teamAssignments[i] === team)
                          .map((p, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1.5 bg-slate-800/50 rounded-lg px-2 py-1"
                            >
                              <span className="text-white text-xs">
                                {p.name}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  {session.players.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-white text-sm flex-1">
                        {p.name}
                      </span>
                      <div className="flex gap-1.5">
                        {(["A", "B"] as const).map((team) => (
                          <button
                            key={team}
                            onClick={() =>
                              setTeamAssignments((prev) => ({
                                ...prev,
                                [i]: team,
                              }))
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                              teamAssignments[i] === team
                                ? team === "A"
                                  ? "bg-blue-600/30 border-blue-500/50 text-blue-400"
                                  : "bg-red-600/30 border-red-500/50 text-red-400"
                                : "bg-slate-800 border-slate-700 text-slate-500 hover:text-white"
                            }`}
                          >
                            Team {team}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-2">
                    Which team lost?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["A", "B"] as const).map((team) => {
                      const teamPlayers = session.players.filter(
                        (_, i) => teamAssignments[i] === team,
                      );
                      const eachPays =
                        teamPlayers.length > 0
                          ? Math.ceil(totalBill / teamPlayers.length)
                          : 0;
                      return (
                        <button
                          key={team}
                          onClick={() => setLosingTeam(team)}
                          className={`p-3 rounded-xl border transition-all ${
                            losingTeam === team
                              ? team === "A"
                                ? "bg-blue-500/10 border-blue-500/30"
                                : "bg-red-500/10 border-red-500/30"
                              : "bg-slate-800/50 border-slate-700/40"
                          }`}
                        >
                          <p
                            className={`text-sm font-semibold ${losingTeam === team ? (team === "A" ? "text-blue-400" : "text-red-400") : "text-slate-300"}`}
                          >
                            Team {team} Lost
                          </p>
                          {teamPlayers.length > 0 && (
                            <p className="text-slate-500 text-xs mt-0.5">
                              Rs. {eachPays} each
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {splitMode === "custom" && (
              <div className="space-y-2">
                <p className="text-slate-400 text-xs mb-2">
                  Set amount per player
                  <span
                    className={`ml-2 font-semibold ${customTotal === totalBill ? "text-emerald-400" : "text-orange-400"}`}
                  >
                    (Rs. {customTotal} / Rs. {totalBill})
                  </span>
                </p>
                {session.players.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-blue-600/20 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-blue-400 text-xs font-bold">
                        {p.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-white text-sm flex-1">{p.name}</span>
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                        Rs.
                      </span>
                      <input
                        type="number"
                        value={customAmounts[i]}
                        min={0}
                        onChange={(e) => {
                          const u = [...customAmounts];
                          u[i] = Number(e.target.value);
                          setCustomAmounts(u);
                        }}
                        className="w-full bg-slate-800/50 border border-slate-600/50 text-white rounded-lg pl-7 pr-2 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <p className="text-slate-300 text-sm font-semibold mb-2">
              Payment Method
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["Cash", "EasyPaisa", "JazzCash", "OnCredit"] as const).map(
                (m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setPaymentMethod(m);
                      if (m !== "OnCredit") setCreditPlayerId("");
                    }}
                    className={`py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      paymentMethod === m
                        ? m === "OnCredit"
                          ? "bg-orange-500/20 border-orange-500/40 text-orange-400"
                          : "bg-blue-600/20 border-blue-500/40 text-blue-400"
                        : "bg-slate-800/50 border-slate-700/40 text-slate-400 hover:text-white"
                    }`}
                  >
                    {m === "Cash"
                      ? "Cash"
                      : m === "EasyPaisa"
                        ? "EasyPaisa"
                        : m === "JazzCash"
                          ? "JazzCash"
                          : "On Credit"}
                  </button>
                ),
              )}
            </div>

            {/* On Credit Player Selector */}
            {paymentMethod === "OnCredit" && (
              <div className="mt-3">
                {registeredPlayers.length === 0 ? (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
                    <p className="text-orange-400 text-xs flex items-center gap-2">
                      <FiAlertTriangle className="shrink-0" />
                      No registered players in this session. Only saved players
                      can take credit.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-400 text-xs mb-2">
                      Who is taking credit?
                    </p>
                    <div className="space-y-2">
                      {registeredPlayers.map((p, i) => (
                        <button
                          key={i}
                          onClick={() =>
                            setCreditPlayerId(p.playerId || p.name)
                          }
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                            creditPlayerId === (p.playerId || p.name)
                              ? "bg-orange-500/10 border-orange-500/30"
                              : "bg-slate-800/50 border-slate-700/40 hover:border-slate-600"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              creditPlayerId === (p.playerId || p.name)
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-slate-700 text-slate-400"
                            }`}
                          >
                            {p.name.charAt(0)}
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              creditPlayerId === (p.playerId || p.name)
                                ? "text-orange-400"
                                : "text-white"
                            }`}
                          >
                            {p.name}
                          </span>
                          <span className="text-blue-400 text-xs ml-auto">
                            ★ Registered
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (collectDisabled) return;
                const creditPlayer = registeredPlayers.find(
                  (p) => (p.playerId || p.name) === creditPlayerId,
                );
                onEnd(
                  table.id,
                  getSplits(),
                  totalBill,
                  paymentMethod,
                  creditPlayer?.name,
                );
                onClose();
              }}
              disabled={collectDisabled}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <FiCheck /> Collect & End
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Table Card ────────────────────────────────────────────
function TableCard({
  table,
  elapsed,
  onStartClick,
  onEndClick,
  onRemove,
  canRemove,
}: {
  table: Table;
  elapsed: number;
  onStartClick: (t: Table) => void;
  onEndClick: (t: Table) => void;
  onRemove: (id: number) => void;
  canRemove: boolean;
}) {
  const isOccupied = table.status === "occupied";
  const bill = table.session ? calcBill(table.session, elapsed) : 0;

  return (
    <div
      className={`relative rounded-2xl border overflow-hidden transition-all duration-300 ${
        isOccupied
          ? "border-red-500/30 shadow-lg shadow-red-500/10"
          : "border-slate-700/40 hover:border-slate-600/60 shadow-lg shadow-slate-900/50"
      }`}
    >
      {/* Remove Button — only on free tables */}
      {!isOccupied && canRemove && (
        <button
          onClick={() => onRemove(table.id)}
          className="absolute top-2 right-2 z-10 w-6 h-6 bg-slate-800/80 hover:bg-red-500/20 border border-slate-700/50 hover:border-red-500/40 rounded-full flex items-center justify-center text-slate-500 hover:text-red-400 transition-all"
        >
          <FiMinus className="text-xs" />
        </button>
      )}

      {/* Status Bar */}
      <div
        className={`h-1 w-full ${isOccupied ? "bg-red-500" : "bg-emerald-500"}`}
      />

      <div className="p-4 bg-slate-900/60">
        {/* SVG Table */}
        <div className="mb-3">
          <SnookerTableSVG
            occupied={isOccupied}
            tableNumber={table.id}
            tableName={table.name}
            pulse={isOccupied}
          />
        </div>

        {/* Status & Timer */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${isOccupied ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`}
            />
            <span
              className={`text-xs font-semibold ${isOccupied ? "text-red-400" : "text-emerald-400"}`}
            >
              {isOccupied ? "In Use" : "Available"}
            </span>
          </div>
          {isOccupied && (
            <span className="text-white font-mono text-sm font-bold">
              {formatTime(elapsed)}
            </span>
          )}
        </div>

        {/* Session Info */}
        {isOccupied && table.session ? (
          <div className="space-y-2 mb-3">
            {/* Players */}
            <div className="flex flex-wrap gap-1">
              {table.session.players.map((p, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 bg-slate-800/60 border border-slate-700/40 rounded-lg px-2 py-1 text-xs text-white"
                >
                  <span className="w-4 h-4 bg-blue-600/30 rounded-full flex items-center justify-center text-blue-400 text-[9px] font-bold shrink-0">
                    {p.name.charAt(0)}
                  </span>
                  {p.name}
                  {p.isRegistered && (
                    <span className="text-blue-400 text-[9px]">★</span>
                  )}
                </span>
              ))}
            </div>
            {/* Game & Bill */}
            <div className="flex items-center justify-between bg-slate-800/50 rounded-xl px-3 py-2">
              <span className="text-slate-400 text-xs">
                {table.session.gameType}
              </span>
              <span className="text-emerald-400 font-bold text-sm">
                Rs. {bill.toLocaleString()}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-3 mb-3">
            <p className="text-slate-600 text-xs">Ready for players</p>
          </div>
        )}

        {/* Action Button */}
        {isOccupied ? (
          <button
            onClick={() => onEndClick(table)}
            className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            <FiSquare className="text-xs" /> End Session
          </button>
        ) : (
          <button
            onClick={() => onStartClick(table)}
            className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            <FiCheck /> Start Session
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Add Table Modal ───────────────────────────────────────
function AddTableModal({
  nextId,
  onClose,
  onAdd,
}: {
  nextId: number;
  onClose: () => void;
  onAdd: (name: string) => void;
}) {
  const [name, setName] = useState(`Table ${nextId}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(name);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-bold text-lg">Add New Table</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Give your table a name
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-300 text-sm font-medium block mb-1.5">
              Table Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Table ${nextId}`}
              autoFocus
              className="w-full bg-slate-800/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            <p className="text-slate-600 text-xs mt-1.5">
              e.g. VIP Table, Corner Table, Table A
            </p>
          </div>

          {/* Quick Name Suggestions */}
          <div>
            <p className="text-slate-500 text-xs mb-2">Quick suggestions</p>
            <div className="flex flex-wrap gap-2">
              {[
                `Table ${nextId}`,
                "VIP Table",
                "Corner Table",
                "Back Room",
                `Table ${String.fromCharCode(64 + nextId)}`,
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setName(suggestion)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    name === suggestion
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <FiPlus /> Add Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Remove Table Confirm ──────────────────────────────────
function RemoveTableModal({
  table,
  onClose,
  onConfirm,
}: {
  table: Table;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
        <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiAlertTriangle className="text-red-400 text-2xl" />
        </div>
        <h2 className="text-white font-bold text-lg mb-2">
          Remove {table.name}?
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          This table will be permanently removed. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
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
                ${link.active ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "text-slate-400 hover:text-white hover:bg-slate-800/60"}`}
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

// ─── Main Page ─────────────────────────────────────────────
export default function TablesPage() {
  const router = useRouter();
  const [user, setUser] = useState<ClubUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tables, setTables] = useState<Table[]>([]);
  const [savedPlayers, setSavedPlayers] = useState<Player[]>([]);
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [tick, setTick] = useState(0);
  const [startModal, setStartModal] = useState<Table | null>(null);
  const [endModal, setEndModal] = useState<Table | null>(null);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todaySessions, setTodaySessions] = useState(0);
  const [recentSessions, setRecentSessions] = useState<CompletedSession[]>([]);
  const [storageKey, setStorageKey] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [removeTableId, setRemoveTableId] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("club_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const u: ClubUser = JSON.parse(stored);
    setUser(u);
    const key = `club_tables_${u.email}`;
    setStorageKey(key);

    const savedTables = localStorage.getItem(key);
    if (savedTables) {
      setTables(JSON.parse(savedTables));
    } else {
      const initial = Array.from({ length: u.tables }, (_, i) => ({
        id: i + 1,
        name: `Table ${i + 1}`,
        status: "available" as const,
        session: null,
      }));
      setTables(initial);
      localStorage.setItem(key, JSON.stringify(initial));
    }

    const players = localStorage.getItem(`club_players_${u.email}`);
    if (players) setSavedPlayers(JSON.parse(players));

    const games = localStorage.getItem(`club_games_${u.email}`);
    setGameTypes(games ? JSON.parse(games) : []);

    const stats = localStorage.getItem(`club_today_${u.email}`);
    if (stats) {
      const s = JSON.parse(stats);
      const savedDate = s.date || "";
      const todayDate = new Date().toISOString().split("T")[0];
      if (savedDate === todayDate) {
        setTodayRevenue(s.revenue || 0);
        setTodaySessions(s.sessions || 0);
      } else {
        // New day — reset stats
        localStorage.setItem(
          `club_today_${u.email}`,
          JSON.stringify({
            revenue: 0,
            sessions: 0,
            date: todayDate,
          }),
        );
      }
    }

    const recent = localStorage.getItem(`club_recent_${u.email}`);
    if (recent) setRecentSessions(JSON.parse(recent));
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const getElapsed = (table: Table) => {
    if (!table.session) return 0;
    return Math.floor((Date.now() - table.session.startTime) / 1000);
  };

  const persistTables = useCallback(
    (updated: Table[], u?: ClubUser) => {
      setTables(updated);
      const key = storageKey || `club_tables_${u?.email}`;
      localStorage.setItem(key, JSON.stringify(updated));
    },
    [storageKey],
  );

  const handleAddTable = (name: string) => {
    if (!user) return;
    const maxId = tables.length > 0 ? Math.max(...tables.map((t) => t.id)) : 0;
    const newTable: Table = {
      id: maxId + 1,
      name: name.trim() || `Table ${maxId + 1}`,
      status: "available",
      session: null,
    };
    const updated = [...tables, newTable];
    persistTables(updated);
    const updatedUser = { ...user, tables: updated.length };
    setUser(updatedUser);
    localStorage.setItem("club_user", JSON.stringify(updatedUser));
  };

  const handleRemoveTable = useCallback(
    (id: number) => {
      if (!user) return;
      const table = tables.find((t) => t.id === id);
      if (!table || table.status === "occupied") return;
      const updated = tables.filter((t) => t.id !== id);
      persistTables(updated);
      const updatedUser = { ...user, tables: updated.length };
      setUser(updatedUser);
      localStorage.setItem("club_user", JSON.stringify(updatedUser));
    },
    [tables, user, persistTables],
  );

  const handleLogout = () => {
    localStorage.removeItem("club_user");
    router.push("/login");
  };

  const handleStartSession = useCallback(
    (
      tableId: number,
      players: SessionPlayer[],
      gameType: string,
      gameUnit: string,
      gameRate: number,
    ) => {
      if (!user) return;
      const updated = tables.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: "occupied" as const,
              session: {
                players,
                gameType,
                gameUnit,
                gameRate,
                startTime: Date.now(),
              },
            }
          : t,
      );
      persistTables(updated);
    },
    [tables, user, persistTables],
  );

  const handleEndSession = useCallback(
    (
      tableId: number,
      splits: PaymentSplit[],
      totalAmount: number,
      paymentMethod?: string,
      creditPlayerName?: string,
    ) => {
      if (!user) return;
      const table = tables.find((t) => t.id === tableId);
      if (!table?.session) return;
      const elapsed = getElapsed(table);

      const completed: CompletedSession = {
        id: `session-${Date.now()}`,
        tableNo: tableId,
        players: table.session.players,
        gameType: table.session.gameType,
        duration: formatTime(elapsed),
        totalAmount,
        splits,
        endTime: Date.now(),
        paymentMethod:
          (paymentMethod as CompletedSession["paymentMethod"]) || "Cash",
        creditPlayerName,
      };

      // ── Save debt if On Credit ──────────────────────────
      if (paymentMethod === "OnCredit" && creditPlayerName) {
        const debtKey = `club_debts_${user.email}`;
        const existing = localStorage.getItem(debtKey);
        const debts: Record<string, number> = existing
          ? JSON.parse(existing)
          : {};
        debts[creditPlayerName] = (debts[creditPlayerName] || 0) + totalAmount;
        localStorage.setItem(debtKey, JSON.stringify(debts));
      }

      const updatedRecent = [completed, ...recentSessions].slice(0, 100);
      setRecentSessions(updatedRecent);
      localStorage.setItem(
        `club_recent_${user.email}`,
        JSON.stringify(updatedRecent),
      );

      const newRevenue = todayRevenue + totalAmount;
      const newSessions = todaySessions + 1;
      setTodayRevenue(newRevenue);
      setTodaySessions(newSessions);
      localStorage.setItem(
        `club_today_${user.email}`,
        JSON.stringify({
          revenue: newRevenue,
          sessions: newSessions,
          date: new Date().toISOString().split("T")[0],
        }),
      );

      const updated = tables.map((t) =>
        t.id === tableId
          ? { ...t, status: "available" as const, session: null }
          : t,
      );
      persistTables(updated);
    },
    [tables, user, recentSessions, todayRevenue, todaySessions, persistTables],
  );

  const occupiedCount = tables.filter((t) => t.status === "occupied").length;
  const availableCount = tables.filter((t) => t.status === "available").length;
  const activePlayers = tables.reduce(
    (acc, t) => acc + (t.session?.players.length || 0),
    0,
  );

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
                <h1 className="text-white font-bold text-base leading-tight">
                  Tables
                </h1>
                <p className="text-slate-500 text-[11px] leading-tight">
                  {occupiedCount} occupied • {availableCount} available •{" "}
                  {activePlayers} players active
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              {/* Status pills — desktop only */}
              <div className="hidden sm:flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium ${
                    occupiedCount > 0
                      ? "bg-red-500/10 border-red-500/20 text-red-400"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      occupiedCount > 0
                        ? "bg-red-400 animate-pulse"
                        : "bg-emerald-400"
                    }`}
                  />
                  {occupiedCount > 0 ? `${occupiedCount} In Use` : "All Free"}
                </div>

                {/* Live clock */}
                <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/50 rounded-xl px-3 py-1.5">
                  <FiClock className="text-slate-500 text-xs" />
                  <span className="text-slate-300 text-xs font-mono tracking-wide">
                    {new Date().toLocaleTimeString("en-PK", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Add Table button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <FiPlus className="text-sm" />
                <span className="hidden sm:inline">Add Table</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 space-y-6" suppressHydrationWarning>
          {/* Today Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Today's Revenue",
                value: `Rs. ${todayRevenue.toLocaleString()}`,
                color: "emerald",
                icon: FiDollarSign,
              },
              {
                label: "Sessions Today",
                value: todaySessions,
                color: "blue",
                icon: FiClock,
              },
              {
                label: "Tables Occupied",
                value: occupiedCount,
                color: "red",
                icon: FiSquare,
              },
              {
                label: "Active Players",
                value: activePlayers,
                color: "purple",
                icon: FiUsers,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-xs">{s.label}</p>
                  <s.icon
                    className={`text-sm ${
                      s.color === "emerald"
                        ? "text-emerald-400"
                        : s.color === "blue"
                          ? "text-blue-400"
                          : s.color === "red"
                            ? "text-red-400"
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
                        : s.color === "red"
                          ? "text-red-400"
                          : "text-purple-400"
                  }`}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Tables Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white font-semibold">All Tables</h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  {tables.length} total • Click{" "}
                  <FiMinus className="inline text-xs" /> on a free table to
                  remove it
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />{" "}
                  Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />{" "}
                  In Use
                </span>
              </div>
            </div>

            {tables.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-700/40 border-dashed rounded-2xl p-16 text-center">
                <p className="text-4xl mb-4">🎱</p>
                <p className="text-white font-semibold mb-1">No Tables Yet</p>
                <p className="text-slate-500 text-sm mb-6">
                  Add your first table to get started
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors"
                >
                  <FiPlus /> Add First Table
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tables.map((table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    elapsed={getElapsed(table)}
                    onStartClick={setStartModal}
                    onEndClick={setEndModal}
                    onRemove={(id) => setRemoveTableId(id)}
                    canRemove={tables.length > 1}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recent Sessions */}
          {recentSessions.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700/40 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">Recent Sessions</h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Today's completed sessions
                  </p>
                </div>
                <a
                  href="/payments"
                  className="text-blue-400 text-xs hover:underline"
                >
                  View all →
                </a>
              </div>
              <div className="divide-y divide-slate-700/30">
                {recentSessions.slice(0, 6).map((s) => (
                  <div
                    key={s.id}
                    className="px-6 py-4 flex items-center gap-4 hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-blue-400 text-xs font-bold">
                        T{s.tableNo}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {s.players.map((p) => p.name).join(" vs ")}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {s.gameType} • {s.duration}
                      </p>
                    </div>
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
            </div>
          )}
        </main>
      </div>

      {showAddModal && (
        <AddTableModal
          nextId={
            tables.length > 0 ? Math.max(...tables.map((t) => t.id)) + 1 : 1
          }
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddTable}
        />
      )}

      {removeTableId !== null &&
        (() => {
          const tableToRemove = tables.find((t) => t.id === removeTableId);
          return tableToRemove ? (
            <RemoveTableModal
              table={tableToRemove}
              onClose={() => setRemoveTableId(null)}
              onConfirm={() => handleRemoveTable(removeTableId)}
            />
          ) : null;
        })()}

      {startModal && (
        <StartSessionModal
          table={startModal}
          savedPlayers={savedPlayers}
          gameTypes={gameTypes}
          onClose={() => setStartModal(null)}
          onStart={handleStartSession}
        />
      )}
      {endModal && (
        <EndSessionModal
          table={endModal}
          elapsed={getElapsed(endModal)}
          onClose={() => setEndModal(null)}
          onEnd={handleEndSession}
        />
      )}
    </div>
  );
}
