"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiClock, FiSquare, FiAlertCircle } from "react-icons/fi";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { useMenuToggle } from "@/components/layout/AppShell";
import SnookerTableSVG from "@/components/tables/SnookerTableSVG";
import StartSessionModal from "@/components/tables/StartSessionModal";
import EndSessionModal from "@/components/tables/EndSessionModal";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Badge from "@/components/ui/Badge";
import { getStoredUser } from "@/lib/storage/auth.storage";
import { getTables, saveTables } from "@/lib/storage/tables.storage";
import { getPlayers, savePlayers } from "@/lib/storage/players.storage";
import { getGames } from "@/lib/storage/games.storage";
import {
  saveSession,
  getTodayStats,
  saveTodayStats,
} from "@/lib/storage/payments.storage";
import { addDebt } from "@/lib/storage/debts.storage";
import type {
  ClubUser,
  Table,
  GameType,
  Player,
  SessionPlayer,
  PaymentMethod,
  SplitMode,
  PlayerSplit,
  CompletedSession,
  TodayStats,
} from "@/types";

// ── Format live timer ────────────────────────────────────────────
function formatTimer(startTime: number): string {
  const secs = Math.floor((Date.now() - startTime) / 1000);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function calcBill(rate: number, unit: string, startTime: number): number {
  if (unit === "per hour") {
    const mins = (Date.now() - startTime) / 1000 / 60;
    return Math.round((mins / 60) * rate);
  }
  return rate;
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

// ── Quick name suggestions ───────────────────────────────────────
const TABLE_SUGGESTIONS = [
  "VIP Table",
  "Championship",
  "Practice",
  "Corner Table",
  "Main Table",
];

// ================================================================
// TABLE CARD
// ================================================================
function TableCard({
  table,
  games,
  tick,
  onStart,
  onEnd,
}: {
  table: Table;
  games: GameType[];
  tick: number;
  onStart: (t: Table) => void;
  onEnd: (t: Table) => void;
}) {
  const session = table.session;
  const occupied = table.status === "occupied";
  const bill = session
    ? calcBill(session.gameRate, session.gameUnit, session.startTime)
    : 0;

  return (
    <div
      className={`
      card-theme p-4 flex flex-col gap-4 transition-all duration-300
      ${
        occupied
          ? "border-red-500/30 shadow-lg shadow-red-500/5"
          : "hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5"
      }
    `}
    >
      {/* ── SVG Table ───────────────────────────────────── */}
      <div className="flex justify-center">
        <div className="relative">
          <SnookerTableSVG
            occupied={occupied}
            tableName={table.name}
            size="md"
          />
          {/* Pulse ring when occupied */}
          {occupied && (
            <div
              className="
              absolute inset-0 rounded-lg
              border-2 border-red-500/30
              animate-pulse
            "
            />
          )}
        </div>
      </div>

      {/* ── Info ────────────────────────────────────────── */}
      <div className="space-y-2">
        {/* Status row */}
        <div className="flex items-center justify-between">
          <h3 className="text-theme-primary font-bold text-sm">{table.name}</h3>
          <Badge
            label={occupied ? "Occupied" : "Free"}
            variant={occupied ? "red" : "emerald"}
            dot
            small
          />
        </div>

        {/* Session info */}
        {occupied && session ? (
          <div className="space-y-2">
            {/* Game + timer */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-theme-secondary">{session.gameType}</span>
              <span className="text-blue-500 font-mono font-bold flex items-center gap-1">
                <FiClock className="text-[10px]" />
                {formatTimer(session.startTime)}
              </span>
            </div>

            {/* Players */}
            <div className="flex gap-1 flex-wrap">
              {session.players.map((p, i) => (
                <span
                  key={i}
                  className="
                  text-[10px] px-2 py-0.5 rounded-full
                  bg-theme-secondary border border-theme
                  text-theme-primary font-medium
                "
                >
                  {p.name}
                </span>
              ))}
            </div>

            {/* Running bill */}
            <div
              className="
              flex items-center justify-between
              px-3 py-2 rounded-xl
              bg-orange-500/10 border border-orange-500/20
            "
            >
              <span className="text-orange-500 text-xs">Running Bill</span>
              <span className="text-orange-500 font-bold text-sm">
                Rs. {bill}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-theme-muted text-xs">Ready to start a session</p>
        )}
      </div>

      {/* ── Action button ───────────────────────────────── */}
      <button
        onClick={() => (occupied ? onEnd(table) : onStart(table))}
        className={`
          w-full py-2.5 rounded-xl text-sm font-semibold
          transition-all duration-200
          ${
            occupied
              ? "bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20"
              : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
          }
        `}
      >
        {occupied ? "End Session" : "Start Session"}
      </button>
    </div>
  );
}

// ================================================================
// INNER PAGE
// ================================================================
function TablesPageInner({ user }: { user: ClubUser }) {
  const toggleMenu = useMenuToggle();

  const [tables, setTables] = useState<Table[]>([]);
  const [games, setGames] = useState<GameType[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [tick, setTick] = useState(0);

  // Modals
  const [startModal, setStartModal] = useState<Table | null>(null);
  const [endModal, setEndModal] = useState<Table | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [removeModal, setRemoveModal] = useState<Table | null>(null);
  const [newTableName, setNewTableName] = useState("");

  // ── Load data ────────────────────────────────────────────────
  useEffect(() => {
    setTables(getTables(user.email, user));
    setGames(getGames(user.email));
    setPlayers(getPlayers(user.email));
  }, [user]);

  // ── Live 1-second tick ──────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const persist = useCallback(
    (updated: Table[]) => {
      setTables(updated);
      saveTables(user.email, updated);
    },
    [user.email],
  );

  // ── Start session ────────────────────────────────────────────
  const handleStart = (
    tableId: number,
    gameId: string,
    sPlayers: SessionPlayer[],
  ) => {
    const game = games.find((g) => g.id === gameId);
    if (!game) return;

    persist(
      tables.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: "occupied",
              session: {
                players: sPlayers,
                gameType: game.name,
                gameUnit: game.unit,
                gameRate: game.rate,
                startTime: Date.now(),
              },
            }
          : t,
      ),
    );
  };

  // ── End session ──────────────────────────────────────────────
  const handleEnd = (
    tableId: number,
    payMethod: PaymentMethod,
    splitMode: SplitMode,
    playerSplits: PlayerSplit[],
    creditPlayer?: string,
  ) => {
    const table = tables.find((t) => t.id === tableId);
    const session = table?.session;
    if (!session) return;

    const mins = Math.floor((Date.now() - session.startTime) / 1000 / 60);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const durStr = h > 0 ? `${h}h ${m}m` : `${m}m`;

    const bill =
      session.gameUnit === "per hour"
        ? Math.round(
            ((Date.now() - session.startTime) / 1000 / 60 / 60) *
              session.gameRate,
          )
        : session.gameRate;

    // Save completed session
    const completed: CompletedSession = {
      id: `${tableId}-${Date.now()}`,
      tableNo: tableId,
      tableName: table?.name ?? `Table ${tableId}`,
      players: session.players,
      gameType: session.gameType,
      duration: durStr,
      totalAmount: bill,
      endTime: Date.now(),
      paymentMethod: payMethod,
      splitMode,
      playerSplits,
      creditPlayerName: creditPlayer,
    };
    saveSession(user.email, completed);

    // Update today stats
    if (payMethod !== "OnCredit") {
      const today = getTodayStats(user.email);
      const isToday = today.date === todayStr();
      const updated: TodayStats = {
        revenue: (isToday ? today.revenue : 0) + bill,
        sessions: (isToday ? today.sessions : 0) + 1,
        date: todayStr(),
      };
      saveTodayStats(user.email, updated);
    }

    // Add debt if on credit
    if (payMethod === "OnCredit" && creditPlayer) {
      addDebt(user.email, creditPlayer, bill);
      // Update player's total visits
      const allPlayers = getPlayers(user.email);
      const updated = allPlayers.map((p) =>
        p.name === creditPlayer
          ? { ...p, totalVisits: p.totalVisits + 1, lastVisit: Date.now() }
          : p,
      );
      savePlayers(user.email, updated);
      setPlayers(updated);
    }

    // Update player visits for registered players
    if (payMethod !== "OnCredit") {
      const allPlayers = getPlayers(user.email);
      const paidAmounts: Record<string, number> = {};
      playerSplits.forEach((sp) => {
        paidAmounts[sp.name] = sp.amount;
      });

      const updated = allPlayers.map((p) => {
        const split = paidAmounts[p.name];
        if (split !== undefined) {
          return {
            ...p,
            totalVisits: p.totalVisits + 1,
            totalPaid: p.totalPaid + split,
            lastVisit: Date.now(),
          };
        }
        return p;
      });
      savePlayers(user.email, updated);
      setPlayers(updated);
    }

    // Free the table
    persist(
      tables.map((t) =>
        t.id === tableId ? { ...t, status: "available", session: null } : t,
      ),
    );
  };

  // ── Add table ────────────────────────────────────────────────
  const handleAddTable = () => {
    if (!newTableName.trim()) return;
    const newTable: Table = {
      id: Date.now(),
      name: newTableName.trim(),
      status: "available",
      session: null,
    };
    persist([...tables, newTable]);
    setNewTableName("");
    setAddModal(false);
  };

  // ── Remove table ─────────────────────────────────────────────
  const handleRemove = () => {
    if (!removeModal) return;
    if (tables.length <= 1) return;
    persist(tables.filter((t) => t.id !== removeModal.id));
    setRemoveModal(null);
  };

  // ── Stats ─────────────────────────────────────────────────────
  const occupied = tables.filter((t) => t.status === "occupied").length;
  const free = tables.filter((t) => t.status === "available").length;

  return (
    <>
      {/* ── Header ──────────────────────────────────────── */}
      <PageHeader
        title="Tables"
        subtitle="Manage sessions and billing"
        onMenuClick={toggleMenu}
        statusPill={
          <div className="flex items-center gap-2">
            {occupied > 0 && (
              <Badge label={`${occupied} Occupied`} variant="red" dot small />
            )}
            <Badge label={`${free} Free`} variant="emerald" dot small />
          </div>
        }
        actions={
          <button
            onClick={() => setAddModal(true)}
            className="
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
              bg-blue-600 hover:bg-blue-500 text-white
              shadow-lg shadow-blue-500/25
              transition-all duration-200 hover:-translate-y-0.5
            "
          >
            <FiPlus className="text-base" />
            <span className="hidden sm:inline">Add Table</span>
          </button>
        }
      />

      {/* ── Page body ───────────────────────────────────── */}
      <div className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Summary row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl
            bg-theme-card border border-theme text-sm"
          >
            <FiSquare className="text-theme-muted text-xs" />
            <span className="text-theme-muted">Total</span>
            <span className="text-theme-primary font-bold">
              {tables.length}
            </span>
          </div>
          {occupied > 0 && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl
              bg-red-500/10 border border-red-500/20 text-sm"
            >
              <span className="text-red-500">Occupied</span>
              <span className="text-red-500 font-bold">{occupied}</span>
            </div>
          )}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl
            bg-emerald-500/10 border border-emerald-500/20 text-sm"
          >
            <span className="text-emerald-500">Free</span>
            <span className="text-emerald-500 font-bold">{free}</span>
          </div>
        </div>

        {/* Tables grid */}
        {tables.length === 0 ? (
          <div className="card-theme p-12 text-center">
            <FiSquare className="text-4xl text-theme-muted mx-auto mb-3" />
            <p className="text-theme-primary font-semibold">No tables yet</p>
            <p className="text-theme-muted text-sm mt-1">
              Add your first table to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tables.map((table, i) => (
              <div
                key={table.id}
                className={`animate-fade-in stagger-${Math.min(i + 1, 4)}`}
              >
                <TableCard
                  table={table}
                  games={games}
                  tick={tick}
                  onStart={setStartModal}
                  onEnd={setEndModal}
                />
              </div>
            ))}

            {/* Remove table cards */}
            {
              tables.filter((t) => t.status === "available").length > 0 &&
                tables
                  .filter((t) => t.status === "available")
                  .slice(0, 1)
                  .map(() => null) // placeholder — remove button on each free card
            }
          </div>
        )}

        {/* Remove table buttons */}
        {tables.some((t) => t.status === "available") && tables.length > 1 && (
          <div>
            <p className="text-theme-muted text-xs mb-3 flex items-center gap-1.5">
              <FiAlertCircle className="text-xs" />
              You can only remove free tables
            </p>
            <div className="flex gap-2 flex-wrap">
              {tables
                .filter((t) => t.status === "available")
                .map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setRemoveModal(t)}
                    className="
                      px-3 py-1.5 rounded-xl text-xs font-medium
                      border border-red-500/30 text-red-500
                      hover:bg-red-500/10 transition-all duration-200
                    "
                  >
                    Remove {t.name}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Start Session Modal ─────────────────────────── */}
      <StartSessionModal
        open={!!startModal}
        onClose={() => setStartModal(null)}
        table={startModal}
        games={games}
        players={players}
        onStart={handleStart}
      />

      {/* ── End Session Modal ───────────────────────────── */}
      <EndSessionModal
        open={!!endModal}
        onClose={() => setEndModal(null)}
        table={endModal}
        games={games}
        players={players}
        onEnd={handleEnd}
      />

      {/* ── Add Table Modal ─────────────────────────────── */}
      <Modal
        open={addModal}
        onClose={() => setAddModal(false)}
        title="Add New Table"
        subtitle="Give your table a name"
        size="sm"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setAddModal(false)}
              className="
                flex-1 py-2.5 rounded-xl text-sm font-semibold
                text-theme-primary bg-theme-secondary
                border border-theme transition-all duration-200
              "
            >
              Cancel
            </button>
            <button
              onClick={handleAddTable}
              disabled={!newTableName.trim()}
              className="
                flex-1 py-2.5 rounded-xl text-sm font-semibold
                text-white bg-blue-600 hover:bg-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
              "
            >
              Add Table
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <input
            className="input-theme"
            placeholder="e.g. VIP Table"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTable()}
            autoFocus
          />
          {/* Quick suggestions */}
          <div>
            <p className="text-theme-muted text-xs mb-2">Quick suggestions</p>
            <div className="flex gap-2 flex-wrap">
              {TABLE_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setNewTableName(s)}
                  className="
                    px-3 py-1.5 rounded-xl text-xs border
                    border-theme text-theme-secondary
                    hover:border-blue-500/50 hover:text-blue-500
                    hover:bg-blue-500/5 transition-all duration-200
                  "
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* ── Remove Table Confirm ────────────────────────── */}
      <ConfirmModal
        open={!!removeModal}
        onClose={() => setRemoveModal(null)}
        onConfirm={handleRemove}
        title="Remove Table?"
        message={`Remove "${removeModal?.name}"? This cannot be undone.`}
        confirmLabel="Remove"
        variant="danger"
      />
    </>
  );
}

// ================================================================
// MAIN EXPORT
// ================================================================
export default function TablesPage() {
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
      <TablesPageInner user={user} />
    </AppShell>
  );
}
