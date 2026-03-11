"use client";

// ================================================================
// PLAYER CARD — Shows player info, debt badge, membership type
// ================================================================

import {
  FiPhone,
  FiEdit2,
  FiTrash2,
  FiStar,
  FiAward,
  FiShield,
} from "react-icons/fi";
import Badge from "@/components/ui/Badge";
import type { Player, DebtsRecord } from "@/types";

interface PlayerCardProps {
  player: Player;
  debts: DebtsRecord;
  isActive: boolean;
  onEdit: (player: Player) => void;
  onDelete: (player: Player) => void;
  onSettle: (player: Player) => void;
}

const MEMBERSHIP_CONFIG = {
  Regular: {
    icon: FiStar,
    variant: "slate" as const,
    color: "text-slate-500",
  },
  Premium: {
    icon: FiAward,
    variant: "blue" as const,
    color: "text-blue-500",
  },
  VIP: {
    icon: FiShield,
    variant: "yellow" as const,
    color: "text-yellow-500",
  },
};

function formatDate(ts: number): string {
  if (!ts) return "Never";
  return new Date(ts).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PlayerCard({
  player,
  debts,
  isActive,
  onEdit,
  onDelete,
  onSettle,
}: PlayerCardProps) {
  const debt = debts[player.name] ?? 0;
  const config = MEMBERSHIP_CONFIG[player.membershipType] ?? MEMBERSHIP_CONFIG["Regular"];
  const Icon = config.icon;

  return (
    <div
      className={`
      card-theme p-5 flex flex-col gap-4
      transition-all duration-200 animate-fade-in
      ${isActive ? "border-emerald-500/30 shadow-lg shadow-emerald-500/5" : ""}
      ${debt > 0 ? "border-orange-500/20" : ""}
    `}
    >
      {/* ── Top row ─────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={`
          relative w-12 h-12 rounded-2xl shrink-0
          flex items-center justify-center text-lg font-bold text-white
          bg-gradient-to-br from-blue-500 to-blue-700
          shadow-lg shadow-blue-500/20
        `}
        >
          {player.name.charAt(0).toUpperCase()}
          {/* Active indicator */}
          {isActive && (
            <span
              className="
              absolute -top-1 -right-1
              w-3.5 h-3.5 rounded-full
              bg-emerald-500 border-2 border-theme-bg
            "
            >
              <span
                className="
                absolute inset-0 rounded-full bg-emerald-500
                animate-ping opacity-75
              "
              />
            </span>
          )}
        </div>

        {/* Name + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-theme-primary font-bold text-sm truncate">
              {player.name}
            </h3>
            {isActive && (
              <Badge label="Active Today" variant="emerald" dot small />
            )}
          </div>

          {/* Membership */}
          <div className="flex items-center gap-1.5 mt-1">
            <Icon className={`text-xs ${config.color}`} />
            <Badge
              label={player.membershipType}
              variant={config.variant}
              small
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(player)}
            className="
              p-1.5 rounded-lg text-theme-muted
              hover:text-blue-500 hover:bg-blue-500/10
              transition-all duration-200
            "
            title="Edit player"
          >
            <FiEdit2 className="text-sm" />
          </button>
          <button
            onClick={() => onDelete(player)}
            className="
              p-1.5 rounded-lg text-theme-muted
              hover:text-red-500 hover:bg-red-500/10
              transition-all duration-200
            "
            title="Delete player"
          >
            <FiTrash2 className="text-sm" />
          </button>
        </div>
      </div>

      {/* ── Stats row ───────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Visits", value: player.totalVisits },
          {
            label: "Total Paid",
            value: `Rs.${player.totalPaid.toLocaleString()}`,
          },
          { label: "Last Visit", value: formatDate(player.lastVisit) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="
              p-2 rounded-xl bg-theme-secondary border border-theme
              text-center
            "
          >
            <p className="text-theme-muted text-[9px] uppercase tracking-wide">
              {stat.label}
            </p>
            <p className="text-theme-primary text-xs font-bold mt-0.5 truncate">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Phone ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-theme-secondary text-xs">
        <FiPhone className="text-[11px] shrink-0" />
        <span>{player.phone || "No phone"}</span>
      </div>

      {/* ── Debt section ────────────────────────────────── */}
      {debt > 0 && (
        <div
          className="
          flex items-center justify-between
          px-3 py-2 rounded-xl
          bg-orange-500/10 border border-orange-500/20
        "
        >
          <div>
            <p className="text-orange-500 text-[10px] font-medium uppercase tracking-wide">
              Outstanding Debt
            </p>
            <p className="text-orange-500 font-bold text-sm">
              Rs. {debt.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => onSettle(player)}
            className="
              px-3 py-1.5 rounded-xl text-xs font-semibold
              bg-orange-500 hover:bg-orange-400 text-white
              shadow-lg shadow-orange-500/20
              transition-all duration-200 hover:-translate-y-0.5
            "
          >
            Settle
          </button>
        </div>
      )}
    </div>
  );
}
