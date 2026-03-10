"use client";

// ================================================================
// END SESSION MODAL
// 4 split modes: Loser Pays, Equal, Teams, Custom
// Payment methods: Cash, EasyPaisa, JazzCash, On Credit
// ================================================================

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import type {
  Table,
  GameType,
  Player,
  PaymentMethod,
  SplitMode,
  PlayerSplit,
} from "@/types";

interface EndSessionModalProps {
  open: boolean;
  onClose: () => void;
  table: Table | null;
  games: GameType[];
  players: Player[];
  onEnd: (
    tableId: number,
    paymentMethod: PaymentMethod,
    splitMode: SplitMode,
    playerSplits: PlayerSplit[],
    creditPlayer?: string,
  ) => void;
}

// ── Helpers ─────────────────────────────────────────────────────
function calcDuration(startTime: number): number {
  return Math.floor((Date.now() - startTime) / 1000 / 60);
}

function calcTotal(rate: number, unit: string, startTime: number): number {
  if (unit === "per hour") {
    const mins = (Date.now() - startTime) / 1000 / 60;
    return Math.round((mins / 60) * rate);
  }
  return rate;
}

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  "Cash",
  "EasyPaisa",
  "JazzCash",
  "OnCredit",
];

const METHOD_STYLES: Record<string, string> = {
  Cash: "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  EasyPaisa: "border-purple-500/50  bg-purple-500/10  text-purple-500",
  JazzCash: "border-orange-500/50  bg-orange-500/10  text-orange-500",
  OnCredit: "border-red-500/50     bg-red-500/10     text-red-500",
};

export default function EndSessionModal({
  open,
  onClose,
  table,
  games,
  players,
  onEnd,
}: EndSessionModalProps) {
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [loserIdx, setLoserIdx] = useState(0);
  const [teamA, setTeamA] = useState<number[]>([]);
  const [teamB, setTeamB] = useState<number[]>([]);
  const [losingTeam, setLosingTeam] = useState<"A" | "B">("A");
  const [customAmts, setCustomAmts] = useState<number[]>([]);
  const [payMethod, setPayMethod] = useState<PaymentMethod>("Cash");
  const [creditPlayer, setCreditPlayer] = useState("");

  const session = table?.session ?? null;
  const pNames = session?.players.map((p) => p.name) ?? [];
  const game = games.find((g) => g.name === session?.gameType);
  const total = session
    ? calcTotal(session.gameRate, session.gameUnit, session.startTime)
    : 0;
  const duration = session ? calcDuration(session.startTime) : 0;

  // Reset on open
  useEffect(() => {
    if (!open || !session) return;
    setSplitMode("equal");
    setLoserIdx(0);
    setTeamA([0]);
    setTeamB([1]);
    setLosingTeam("A");
    setCustomAmts(
      session.players.map(() => Math.floor(total / session.players.length)),
    );
    setPayMethod("Cash");
    setCreditPlayer(session.players.find((p) => p.isRegistered)?.name ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Build splits ────────────────────────────────────────────
  const buildSplits = (): PlayerSplit[] => {
    if (!session) return [];

    if (splitMode === "loser") {
      return pNames.map((name, i) => ({
        name,
        amount: i === loserIdx ? total : 0,
      }));
    }

    if (splitMode === "equal") {
      const share = Math.round(total / pNames.length);
      return pNames.map((name) => ({ name, amount: share }));
    }

    if (splitMode === "teams") {
      const losingPlayers = losingTeam === "A" ? teamA : teamB;
      const share =
        losingPlayers.length > 0 ? Math.round(total / losingPlayers.length) : 0;
      return pNames.map((name, i) => ({
        name,
        amount: losingPlayers.includes(i) ? share : 0,
      }));
    }

    // custom
    return pNames.map((name, i) => ({
      name,
      amount: customAmts[i] ?? 0,
    }));
  };

  const customTotal = customAmts.reduce((s, a) => s + (a || 0), 0);
  const customValid = splitMode !== "custom" || customTotal === total;

  const canEnd = (payMethod !== "OnCredit" || !!creditPlayer) && customValid;

  const handleEnd = () => {
    if (!table) return;
    const splits = buildSplits();
    onEnd(
      table.id,
      payMethod,
      splitMode,
      splits,
      payMethod === "OnCredit" ? creditPlayer : undefined,
    );
    onClose();
  };

  // ── Team toggle helper ───────────────────────────────────────
  const toggleTeam = (playerIdx: number, team: "A" | "B") => {
    if (team === "A") {
      setTeamA((prev) =>
        prev.includes(playerIdx)
          ? prev.filter((x) => x !== playerIdx)
          : [...prev, playerIdx],
      );
      setTeamB((prev) => prev.filter((x) => x !== playerIdx));
    } else {
      setTeamB((prev) =>
        prev.includes(playerIdx)
          ? prev.filter((x) => x !== playerIdx)
          : [...prev, playerIdx],
      );
      setTeamA((prev) => prev.filter((x) => x !== playerIdx));
    }
  };

  if (!session || !table) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="End Session"
      subtitle={`${table.name} — ${session.gameType}`}
      size="lg"
      footer={
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="
              flex-1 py-2.5 rounded-xl text-sm font-semibold
              text-theme-primary bg-theme-secondary
              border border-theme transition-all duration-200
            "
          >
            Cancel
          </button>
          <button
            onClick={handleEnd}
            disabled={!canEnd}
            className="
              flex-1 py-2.5 rounded-xl text-sm font-semibold text-white
              bg-blue-600 hover:bg-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-lg shadow-blue-500/20
              transition-all duration-200
            "
          >
            Confirm & End
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* ── Session summary ────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Duration", value: formatDuration(duration) },
            { label: "Game", value: session.gameType },
            { label: "Total", value: `Rs. ${total}` },
          ].map((s) => (
            <div
              key={s.label}
              className="
              p-3 rounded-xl bg-theme-secondary border border-theme text-center
            "
            >
              <p className="text-theme-muted text-[10px] uppercase tracking-wide">
                {s.label}
              </p>
              <p className="text-theme-primary font-bold text-sm mt-1">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Players ────────────────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-theme-secondary mb-2">
            Players
          </p>
          <div className="flex gap-2 flex-wrap">
            {pNames.map((name, i) => (
              <span
                key={i}
                className="
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs
                bg-theme-secondary border border-theme text-theme-primary font-medium
              "
              >
                <span
                  className="w-4 h-4 rounded-full bg-blue-500/20
                  text-blue-500 text-[9px] font-bold
                  flex items-center justify-center"
                >
                  {i + 1}
                </span>
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* ── Split mode ─────────────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-theme-secondary mb-2">
            Split Mode
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["equal", "loser", "teams", "custom"] as SplitMode[]).map(
              (mode) => {
                // Hide teams for 2 players
                if (mode === "teams" && pNames.length < 3) return null;
                return (
                  <button
                    key={mode}
                    onClick={() => setSplitMode(mode)}
                    className={`
                      py-2 rounded-xl text-xs font-semibold border capitalize
                      transition-all duration-200
                      ${
                        splitMode === mode
                          ? "border-blue-500 bg-blue-500/10 text-blue-500"
                          : "border-theme bg-theme-secondary text-theme-secondary hover:border-theme-hover"
                      }
                    `}
                  >
                    {mode === "equal"
                      ? "Split Equal"
                      : mode === "loser"
                        ? "Loser Pays"
                        : mode === "teams"
                          ? "Teams"
                          : "Custom"}
                  </button>
                );
              },
            )}
          </div>
        </div>

        {/* ── Loser pays ─────────────────────────────────── */}
        {splitMode === "loser" && (
          <div>
            <p className="text-xs font-medium text-theme-secondary mb-2">
              Who lost?
            </p>
            <div className="flex gap-2 flex-wrap">
              {pNames.map((name, i) => (
                <button
                  key={i}
                  onClick={() => setLoserIdx(i)}
                  className={`
                    px-4 py-2 rounded-xl text-xs font-semibold border
                    transition-all duration-200
                    ${
                      loserIdx === i
                        ? "border-red-500 bg-red-500/10 text-red-500"
                        : "border-theme bg-theme-secondary text-theme-secondary"
                    }
                  `}
                >
                  {name}
                </button>
              ))}
            </div>
            <p className="text-theme-muted text-xs mt-2">
              {pNames[loserIdx]} pays full Rs. {total}
            </p>
          </div>
        )}

        {/* ── Teams ──────────────────────────────────────── */}
        {splitMode === "teams" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {(["A", "B"] as const).map((team) => (
                <div
                  key={team}
                  className={`
                  p-3 rounded-xl border
                  ${
                    team === "A"
                      ? "border-blue-500/30 bg-blue-500/5"
                      : "border-orange-500/30 bg-orange-500/5"
                  }
                `}
                >
                  <p
                    className={`text-xs font-bold mb-2
                    ${team === "A" ? "text-blue-500" : "text-orange-500"}`}
                  >
                    Team {team}
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    {pNames.map((name, i) => (
                      <button
                        key={i}
                        onClick={() => toggleTeam(i, team)}
                        className={`
                          px-2.5 py-1 rounded-lg text-[11px] font-medium border
                          transition-all duration-200
                          ${
                            (team === "A" ? teamA : teamB).includes(i)
                              ? team === "A"
                                ? "border-blue-500 bg-blue-500/15 text-blue-500"
                                : "border-orange-500 bg-orange-500/15 text-orange-500"
                              : "border-theme bg-theme-secondary text-theme-muted"
                          }
                        `}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              {(["A", "B"] as const).map((team) => (
                <button
                  key={team}
                  onClick={() => setLosingTeam(team)}
                  className={`
                    flex-1 py-2 rounded-xl text-xs font-semibold border
                    transition-all duration-200
                    ${
                      losingTeam === team
                        ? "border-red-500 bg-red-500/10 text-red-500"
                        : "border-theme bg-theme-secondary text-theme-secondary"
                    }
                  `}
                >
                  Team {team} Lost
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Custom amounts ─────────────────────────────── */}
        {splitMode === "custom" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-theme-secondary">
                Custom amounts
              </p>
              <span
                className={`text-xs font-semibold ${
                  customTotal === total ? "text-emerald-500" : "text-red-500"
                }`}
              >
                Rs. {customTotal} / {total}
              </span>
            </div>
            <div className="space-y-2">
              {pNames.map((name, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-theme-primary text-xs font-medium w-24 truncate">
                    {name}
                  </span>
                  <div className="flex-1 relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2
                      text-theme-muted text-xs"
                    >
                      Rs.
                    </span>
                    <input
                      type="number"
                      min={0}
                      className="input-theme pl-9"
                      value={customAmts[i] ?? 0}
                      onChange={(e) => {
                        const na = [...customAmts];
                        na[i] = Number(e.target.value);
                        setCustomAmts(na);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Payment method ─────────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-theme-secondary mb-2">
            Payment Method
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m}
                onClick={() => setPayMethod(m)}
                className={`
                  py-2.5 rounded-xl text-xs font-semibold border
                  transition-all duration-200
                  ${
                    payMethod === m
                      ? METHOD_STYLES[m]
                      : "border-theme bg-theme-secondary text-theme-secondary hover:border-theme-hover"
                  }
                `}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* ── Credit player selector ─────────────────────── */}
        {payMethod === "OnCredit" && (
          <div className="p-3 rounded-xl bg-orange-500/8 border border-orange-500/20">
            <p className="text-orange-500 text-xs font-medium mb-2">
              Who is taking credit?
            </p>
            <div className="flex gap-2 flex-wrap">
              {session.players
                .filter((p) => p.isRegistered)
                .map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setCreditPlayer(p.name)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-semibold border
                      transition-all duration-200
                      ${
                        creditPlayer === p.name
                          ? "border-orange-500 bg-orange-500/15 text-orange-500"
                          : "border-theme bg-theme-secondary text-theme-secondary"
                      }
                    `}
                  >
                    {p.name}
                  </button>
                ))}
            </div>
            {session.players.every((p) => !p.isRegistered) && (
              <p className="text-red-400 text-xs mt-1">
                Only registered players can take credit
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
