"use client";

// ================================================================
// OUTSTANDING DEBTS — Dashboard widget
// Only shown when debts exist
// ================================================================

import { useRouter } from "next/navigation";
import { FiAlertCircle, FiArrowRight } from "react-icons/fi";
import type { DebtsRecord } from "@/types";

interface OutstandingDebtsProps {
  debts: DebtsRecord;
}

export default function OutstandingDebts({ debts }: OutstandingDebtsProps) {
  const router = useRouter();
  const entries = Object.entries(debts).filter(([, amt]) => amt > 0);
  const total = entries.reduce((s, [, amt]) => s + amt, 0);

  if (entries.length === 0) return null;

  return (
    <div
      className="
      card-theme border-orange-500/30 overflow-hidden
    "
    >
      {/* Header */}
      <div
        className="
        px-5 py-3 border-b border-orange-500/20
        bg-orange-500/5 flex items-center justify-between
      "
      >
        <div className="flex items-center gap-2">
          <FiAlertCircle className="text-orange-500 text-base" />
          <span className="text-orange-500 font-bold text-sm">
            Outstanding Debts
          </span>
          <span
            className="
            text-[10px] px-2 py-0.5 rounded-full
            bg-orange-500/15 text-orange-500 font-semibold
          "
          >
            {entries.length} player{entries.length > 1 ? "s" : ""}
          </span>
        </div>
        <span className="text-orange-500 font-bold text-sm">
          Rs. {total.toLocaleString()}
        </span>
      </div>

      {/* Debt rows */}
      <div className="divide-y divide-theme">
        {entries.map(([name, amount]) => (
          <div
            key={name}
            className="
              px-5 py-3 flex items-center gap-3
              hover:bg-theme-secondary transition-colors duration-150
            "
          >
            {/* Avatar */}
            <div
              className="
              w-8 h-8 rounded-full shrink-0
              bg-orange-500/15 border border-orange-500/20
              flex items-center justify-center
            "
            >
              <span className="text-orange-500 text-xs font-bold">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Name */}
            <span className="flex-1 text-theme-primary text-sm font-medium truncate">
              {name}
            </span>

            {/* Amount */}
            <span className="text-orange-500 font-bold text-sm shrink-0">
              Rs. {amount.toLocaleString()}
            </span>

            {/* Settle link */}
            <button
              onClick={() => router.push("/members")}
              className="
                flex items-center gap-1 text-xs text-blue-500
                hover:text-blue-400 font-medium shrink-0
                transition-colors duration-200
              "
            >
              Settle <FiArrowRight className="text-[10px]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
