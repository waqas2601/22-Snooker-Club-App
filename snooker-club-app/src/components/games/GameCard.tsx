"use client";

// ================================================================
// GAME CARD — Individual game type card on Games page
// ================================================================

import { FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from "react-icons/fi";
import GameIcon from "./GameIcon";
import Badge from "@/components/ui/Badge";
import type { GameType } from "@/types";

interface GameCardProps {
  game: GameType;
  onEdit: (game: GameType) => void;
  onDelete: (game: GameType) => void;
  onToggle: (game: GameType) => void;
}

const COLOR_BORDER: Record<string, string> = {
  blue: "hover:border-blue-500/40",
  emerald: "hover:border-emerald-500/40",
  orange: "hover:border-orange-500/40",
  red: "hover:border-red-500/40",
  purple: "hover:border-purple-500/40",
  yellow: "hover:border-yellow-500/40",
};

const UNIT_LABELS: Record<string, string> = {
  "per hour": "/ hr",
  "per frame": "/ frame",
  "per game": "/ game",
};

export default function GameCard({
  game,
  onEdit,
  onDelete,
  onToggle,
}: GameCardProps) {
  return (
    <div
      className={`
      card-theme p-5 transition-all duration-200 animate-fade-in
      ${game.enabled ? (COLOR_BORDER[game.color] ?? "hover:border-blue-500/40") : "opacity-60"}
    `}
    >
      {/* ── Top row: icon + name + badges ───────────────── */}
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="shrink-0 w-12 h-12 rounded-xl bg-theme-secondary
          border border-theme flex items-center justify-center"
        >
          <GameIcon icon={game.icon} color={game.color} size={32} />
        </div>

        {/* Name + description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-theme-primary font-bold text-sm">
              {game.name}
            </h3>
            {game.isDefault && <Badge label="Default" variant="slate" small />}
            {!game.enabled && <Badge label="Disabled" variant="red" small />}
          </div>
          <p className="text-theme-muted text-xs mt-1 leading-relaxed line-clamp-2">
            {game.description}
          </p>
        </div>
      </div>

      {/* ── Rate ────────────────────────────────────────── */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-theme-secondary text-xs">Rs.</span>
          <span className="text-theme-primary text-xl font-bold">
            {game.rate.toLocaleString()}
          </span>
          <span className="text-theme-muted text-xs">
            {UNIT_LABELS[game.unit] ?? game.unit}
          </span>
        </div>

        {/* ── Action buttons ────────────────────────────── */}
        <div className="flex items-center gap-1">
          {/* Toggle enabled/disabled */}
          <button
            onClick={() => onToggle(game)}
            title={game.enabled ? "Disable" : "Enable"}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${
                game.enabled
                  ? "text-emerald-500 hover:bg-emerald-500/10"
                  : "text-theme-muted hover:bg-theme-secondary"
              }
            `}
          >
            {game.enabled ? (
              <FiToggleRight className="text-xl" />
            ) : (
              <FiToggleLeft className="text-xl" />
            )}
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(game)}
            title="Edit"
            className="
              p-2 rounded-lg transition-all duration-200
              text-theme-muted hover:text-blue-500
              hover:bg-blue-500/10
            "
          >
            <FiEdit2 className="text-sm" />
          </button>

          {/* Delete — only non-default games */}
          {!game.isDefault && (
            <button
              onClick={() => onDelete(game)}
              title="Delete"
              className="
                p-2 rounded-lg transition-all duration-200
                text-theme-muted hover:text-red-500
                hover:bg-red-500/10
              "
            >
              <FiTrash2 className="text-sm" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
