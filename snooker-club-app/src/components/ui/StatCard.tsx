"use client";

// ================================================================
// STAT CARD — Used on Dashboard, Players, Payments pages
// Shows a metric with icon, value, label and optional trend
// ================================================================

import type { IconType } from "react-icons";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: IconType;
  iconColor: string; // e.g. "text-blue-500"
  iconBg: string; // e.g. "bg-blue-500/10"
  trend?: string; // e.g. "+12%" or "vs yesterday"
  trendUp?: boolean; // true = green, false = red
  prefix?: string; // e.g. "Rs."
  suffix?: string; // e.g. "sessions"
  onClick?: () => void;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  trendUp,
  prefix,
  suffix,
  onClick,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        card-theme p-5 animate-fade-in
        ${onClick ? "cursor-pointer hover:-translate-y-0.5 active:translate-y-0" : ""}
        transition-all duration-200
      `}
    >
      <div className="flex items-start justify-between gap-3">
        {/* ── Text side ───────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <p className="text-theme-secondary text-xs font-medium uppercase tracking-wider mb-2">
            {label}
          </p>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            {prefix && (
              <span className="text-theme-secondary text-sm font-medium">
                {prefix}
              </span>
            )}
            <span className="text-theme-primary text-2xl font-bold leading-none">
              {typeof value === "number" ? value.toLocaleString() : value}
            </span>
            {suffix && (
              <span className="text-theme-secondary text-xs font-medium">
                {suffix}
              </span>
            )}
          </div>

          {/* Trend */}
          {trend && (
            <p
              className={`
              text-xs font-medium mt-2
              ${
                trendUp === true
                  ? "text-emerald-500"
                  : trendUp === false
                    ? "text-red-500"
                    : "text-theme-muted"
              }
            `}
            >
              {trendUp === true && "↑ "}
              {trendUp === false && "↓ "}
              {trend}
            </p>
          )}
        </div>

        {/* ── Icon side ───────────────────────────────── */}
        <div
          className={`
          w-11 h-11 rounded-xl flex items-center justify-center shrink-0
          ${iconBg}
        `}
        >
          <Icon className={`text-xl ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
