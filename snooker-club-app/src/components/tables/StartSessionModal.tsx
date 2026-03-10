"use client";

// ================================================================
// START SESSION MODAL
// Select game type, add 2-4 players, smart search for registered players
// ================================================================

import { useState, useEffect } from "react";
import { FiPlus, FiX, FiStar } from "react-icons/fi";
import Modal from "@/components/ui/Modal";
import type { Table, GameType, Player, SessionPlayer } from "@/types";

interface StartSessionModalProps {
  open: boolean;
  onClose: () => void;
  table: Table | null;
  games: GameType[];
  players: Player[];
  onStart: (tableId: number, gameId: string, players: SessionPlayer[]) => void;
}

export default function StartSessionModal({
  open,
  onClose,
  table,
  games,
  players,
  onStart,
}: StartSessionModalProps) {
  const [selectedGame, setSelectedGame] = useState("");
  const [sessionPlayers, setSessionPlayers] = useState<SessionPlayer[]>([
    { name: "", isRegistered: false },
    { name: "", isRegistered: false },
  ]);
  const [search, setSearch] = useState<string[]>(["", ""]);
  const [showSuggestion, setShowSuggestion] = useState<number | null>(null);

  // Reset on open
  useEffect(() => {
    if (open && games.length > 0) {
      const first = games.find((g) => g.enabled);
      setSelectedGame(first?.id ?? "");
      setSessionPlayers([
        { name: "", isRegistered: false },
        { name: "", isRegistered: false },
      ]);
      setSearch(["", ""]);
    }
  }, [open, games]);

  // ── Player input change ─────────────────────────────────────
  const handlePlayerInput = (i: number, value: string) => {
    const ns = [...search];
    ns[i] = value;
    setSearch(ns);

    const np = [...sessionPlayers];
    np[i] = { name: value, isRegistered: false };
    setSessionPlayers(np);
    setShowSuggestion(i);
  };

  // ── Select suggestion ───────────────────────────────────────
  const selectSuggestion = (i: number, player: Player) => {
    const ns = [...search];
    ns[i] = player.name;
    setSearch(ns);

    const np = [...sessionPlayers];
    np[i] = { name: player.name, isRegistered: true };
    setSessionPlayers(np);
    setShowSuggestion(null);
  };

  // ── Add player slot ─────────────────────────────────────────
  const addPlayer = () => {
    if (sessionPlayers.length >= 4) return;
    setSessionPlayers([...sessionPlayers, { name: "", isRegistered: false }]);
    setSearch([...search, ""]);
  };

  // ── Remove player slot ──────────────────────────────────────
  const removePlayer = (i: number) => {
    if (sessionPlayers.length <= 2) return;
    setSessionPlayers(sessionPlayers.filter((_, idx) => idx !== i));
    setSearch(search.filter((_, idx) => idx !== i));
  };

  // ── Suggestions filter ──────────────────────────────────────
  const getSuggestions = (i: number) => {
    const q = search[i].toLowerCase().trim();
    if (!q) return [];
    return players.filter(
      (p) =>
        (p.name.toLowerCase().includes(q) || p.phone.includes(q)) &&
        !sessionPlayers.some((sp) => sp.name === p.name),
    );
  };

  // ── Validation ──────────────────────────────────────────────
  const canStart =
    selectedGame &&
    sessionPlayers.length >= 2 &&
    sessionPlayers.every((p) => p.name.trim());

  const handleStart = () => {
    if (!table || !canStart) return;
    onStart(table.id, selectedGame, sessionPlayers);
    onClose();
  };

  const enabledGames = games.filter((g) => g.enabled);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Start Session"
      subtitle={table ? `Starting on ${table.name}` : ""}
      size="md"
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
            onClick={handleStart}
            disabled={!canStart}
            className="
              flex-1 py-2.5 rounded-xl text-sm font-semibold text-white
              bg-emerald-600 hover:bg-emerald-500
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-lg shadow-emerald-500/20
              transition-all duration-200
            "
          >
            Start Session
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* ── Game type selector ─────────────────────────── */}
        <div>
          <label className="block text-xs font-medium text-theme-secondary mb-2">
            Game Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {enabledGames.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGame(g.id)}
                className={`
                  p-3 rounded-xl border text-left transition-all duration-200
                  ${
                    selectedGame === g.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-theme bg-theme-secondary hover:border-theme-hover"
                  }
                `}
              >
                <p
                  className={`text-xs font-semibold
                  ${selectedGame === g.id ? "text-blue-500" : "text-theme-primary"}`}
                >
                  {g.name}
                </p>
                <p className="text-theme-muted text-[10px] mt-0.5">
                  Rs. {g.rate} {g.unit}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Players ────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-theme-secondary">
              Players ({sessionPlayers.length}/4)
            </label>
            {sessionPlayers.length < 4 && (
              <button
                onClick={addPlayer}
                className="
                  flex items-center gap-1 text-xs text-blue-500
                  hover:text-blue-400 transition-colors duration-200
                "
              >
                <FiPlus className="text-xs" /> Add Player
              </button>
            )}
          </div>

          <div className="space-y-2">
            {sessionPlayers.map((player, i) => (
              <div key={i} className="relative">
                <div className="flex items-center gap-2">
                  {/* Index badge */}
                  <span
                    className="
                    w-6 h-6 rounded-full bg-theme-secondary border border-theme
                    text-theme-muted text-[10px] font-bold
                    flex items-center justify-center shrink-0
                  "
                  >
                    {i + 1}
                  </span>

                  {/* Input */}
                  <div className="relative flex-1">
                    <input
                      className={`input-theme pr-8 ${
                        player.isRegistered
                          ? "border-emerald-500/50 bg-emerald-500/5"
                          : ""
                      }`}
                      placeholder={`Player ${i + 1} name`}
                      value={search[i]}
                      onChange={(e) => handlePlayerInput(i, e.target.value)}
                      onFocus={() => setShowSuggestion(i)}
                      onBlur={() =>
                        setTimeout(() => setShowSuggestion(null), 150)
                      }
                    />
                    {player.isRegistered && (
                      <FiStar
                        className="
                        absolute right-3 top-1/2 -translate-y-1/2
                        text-emerald-500 text-xs
                      "
                      />
                    )}
                  </div>

                  {/* Remove */}
                  {sessionPlayers.length > 2 && (
                    <button
                      onClick={() => removePlayer(i)}
                      className="
                        p-1.5 rounded-lg text-theme-muted
                        hover:text-red-500 hover:bg-red-500/10
                        transition-all duration-200 shrink-0
                      "
                    >
                      <FiX className="text-xs" />
                    </button>
                  )}
                </div>

                {/* Suggestions dropdown */}
                {showSuggestion === i && getSuggestions(i).length > 0 && (
                  <div
                    className="
                      absolute left-8 right-0 top-full mt-1 z-10
                      bg-modal border border-theme rounded-xl
                      shadow-xl overflow-hidden
                    "
                  >
                    {getSuggestions(i).map((p) => (
                      <button
                        key={p.id}
                        onMouseDown={() => selectSuggestion(i, p)}
                        className="
                            w-full flex items-center gap-3 px-3 py-2.5
                            hover:bg-theme-secondary transition-colors duration-150
                            text-left
                          "
                      >
                        {/* Avatar */}
                        <div
                          className="
                            w-7 h-7 rounded-full bg-blue-500/20
                            flex items-center justify-center shrink-0
                          "
                        >
                          <span className="text-blue-500 text-xs font-bold">
                            {p.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-theme-primary text-xs font-medium truncate">
                            {p.name}
                          </p>
                          <p className="text-theme-muted text-[10px]">
                            {p.phone}
                          </p>
                        </div>
                        <FiStar className="text-emerald-500 text-xs shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
