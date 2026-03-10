"use client";

// ================================================================
// SETTLE DEBT MODAL
// Full or partial payment with quick preset amounts
// ================================================================

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import type { Player } from "@/types";

interface SettleDebtModalProps {
  open: boolean;
  onClose: () => void;
  player: Player | null;
  debt: number;
  onSettle: (playerName: string, amount: number) => void;
}

export default function SettleDebtModal({
  open,
  onClose,
  player,
  debt,
  onSettle,
}: SettleDebtModalProps) {
  const [amount, setAmount] = useState(0);
  const remaining = Math.max(0, debt - amount);

  useEffect(() => {
    if (open) setAmount(debt);
  }, [open, debt]);

  const presets = [
    { label: "Full", value: debt },
    { label: "75%", value: Math.round(debt * 0.75) },
    { label: "50%", value: Math.round(debt * 0.5) },
    { label: "25%", value: Math.round(debt * 0.25) },
  ];

  const handleSettle = () => {
    if (!player || amount <= 0) return;
    onSettle(player.name, amount);
    onClose();
  };

  if (!player) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Settle Debt"
      subtitle={`${player.name} owes Rs. ${debt.toLocaleString()}`}
      size="sm"
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
            onClick={handleSettle}
            disabled={amount <= 0 || amount > debt}
            className="
              flex-1 py-2.5 rounded-xl text-sm font-semibold text-white
              bg-orange-500 hover:bg-orange-400
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-lg shadow-orange-500/20
              transition-all duration-200
            "
          >
            Collect Rs. {amount.toLocaleString()}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* ── Debt summary ──────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
            <p className="text-orange-500 text-[10px] uppercase tracking-wide">
              Total Debt
            </p>
            <p className="text-orange-500 font-bold text-lg mt-0.5">
              Rs. {debt.toLocaleString()}
            </p>
          </div>
          <div
            className={`
            p-3 rounded-xl border text-center transition-colors duration-200
            ${
              remaining === 0
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-theme-secondary border-theme"
            }
          `}
          >
            <p
              className={`text-[10px] uppercase tracking-wide
              ${remaining === 0 ? "text-emerald-500" : "text-theme-muted"}`}
            >
              Remaining
            </p>
            <p
              className={`font-bold text-lg mt-0.5
              ${remaining === 0 ? "text-emerald-500" : "text-theme-primary"}`}
            >
              Rs. {remaining.toLocaleString()}
            </p>
          </div>
        </div>

        {/* ── Quick presets ─────────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-theme-secondary mb-2">
            Quick amounts
          </p>
          <div className="grid grid-cols-4 gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => setAmount(p.value)}
                className={`
                  py-2 rounded-xl text-xs font-semibold border
                  transition-all duration-200
                  ${
                    amount === p.value
                      ? "border-orange-500 bg-orange-500/10 text-orange-500"
                      : "border-theme bg-theme-secondary text-theme-secondary hover:border-theme-hover"
                  }
                `}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Custom amount ─────────────────────────────── */}
        <div>
          <p className="text-xs font-medium text-theme-secondary mb-1.5">
            Custom amount
          </p>
          <div className="relative">
            <span
              className="
              absolute left-3 top-1/2 -translate-y-1/2
              text-theme-muted text-xs font-medium
            "
            >
              Rs.
            </span>
            <input
              type="number"
              min={1}
              max={debt}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="input-theme pl-10"
            />
          </div>
          {amount > debt && (
            <p className="text-red-500 text-xs mt-1">
              Amount cannot exceed total debt
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
