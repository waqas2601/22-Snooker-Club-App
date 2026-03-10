"use client";

// ================================================================
// TODAY ACTIVITY — Recent completed sessions list
// ================================================================

import { FiClock, FiUser } from "react-icons/fi";
import Badge from "@/components/ui/Badge";
import type { CompletedSession } from "@/types";

interface TodayActivityProps {
  sessions: CompletedSession[];
}

const METHOD_VARIANT = {
  Cash: "emerald",
  EasyPaisa: "purple",
  JazzCash: "orange",
  OnCredit: "orange",
  DebtPayment: "blue",
} as const;

export default function TodayActivity({ sessions }: TodayActivityProps) {
  if (sessions.length === 0) {
    return (
      <div className="card-theme p-8 text-center">
        <FiClock className="text-3xl text-theme-muted mx-auto mb-2" />
        <p className="text-theme-muted text-sm">
          No sessions completed today yet
        </p>
      </div>
    );
  }

  return (
    <div className="card-theme divide-y divide-theme overflow-hidden">
      {sessions.map((session, i) => (
        <div
          key={session.id}
          className={`
            px-4 py-3 flex items-center gap-3
            hover:bg-theme-secondary transition-colors duration-150
            animate-fade-in stagger-${Math.min(i + 1, 4)}
          `}
        >
          {/* Table badge */}
          <div
            className="
            w-9 h-9 rounded-xl bg-theme-secondary border border-theme
            flex items-center justify-center shrink-0
          "
          >
            <span className="text-theme-primary text-xs font-bold">
              T{session.tableNo}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-theme-primary text-xs font-semibold">
                {session.tableName}
              </span>
              <span className="text-theme-muted text-[10px]">
                {session.gameType}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <FiUser className="text-[9px] text-theme-muted" />
              <span className="text-theme-muted text-[10px] truncate">
                {session.players.map((p) => p.name).join(", ")}
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-theme-primary text-sm font-bold">
              Rs. {session.totalAmount.toLocaleString()}
            </span>
            <Badge
              label={session.paymentMethod}
              variant={METHOD_VARIANT[session.paymentMethod] ?? "slate"}
              small
            />
          </div>
        </div>
      ))}
    </div>
  );
}
