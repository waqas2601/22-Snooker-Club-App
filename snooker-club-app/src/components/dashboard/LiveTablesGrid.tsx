"use client";

// ================================================================
// LIVE TABLES GRID — Dashboard widget
// Shows all tables with live status, clicking goes to Tables page
// ================================================================

import { useRouter } from "next/navigation";
import SnookerTableSVG from "@/components/tables/SnookerTableSVG";
import Badge from "@/components/ui/Badge";
import { FiClock, FiArrowRight } from "react-icons/fi";
import type { Table } from "@/types";

interface LiveTablesGridProps {
  tables: Table[];
  tick: number;
}

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

export default function LiveTablesGrid({ tables, tick }: LiveTablesGridProps) {
  const router = useRouter();

  if (tables.length === 0) {
    return (
      <div className="card-theme p-8 text-center">
        <p className="text-theme-muted text-sm">No tables configured yet.</p>
        <button
          onClick={() => router.push("/tables")}
          className="mt-3 text-blue-500 text-sm hover:underline"
        >
          Go to Tables →
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {tables.map((table) => {
        const occupied = table.status === "occupied";
        const session = table.session;
        const bill = session
          ? calcBill(session.gameRate, session.gameUnit, session.startTime)
          : 0;

        return (
          <button
            key={table.id}
            onClick={() => router.push("/tables")}
            className={`
              card-theme p-3 text-left flex flex-col gap-2
              transition-all duration-200 hover:-translate-y-0.5
              ${
                occupied
                  ? "border-red-500/30 hover:border-red-500/50"
                  : "hover:border-emerald-500/30"
              }
            `}
          >
            {/* SVG */}
            <div className="flex justify-center">
              <SnookerTableSVG
                occupied={occupied}
                tableName={table.name}
                size="sm"
              />
            </div>

            {/* Info */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-theme-primary text-xs font-semibold truncate">
                  {table.name}
                </span>
                <Badge
                  label={occupied ? "On" : "Free"}
                  variant={occupied ? "red" : "emerald"}
                  dot
                  small
                />
              </div>

              {occupied && session ? (
                <>
                  <p className="text-theme-muted text-[10px] truncate">
                    {session.gameType}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-500 text-[10px] font-mono flex items-center gap-0.5">
                      <FiClock className="text-[8px]" />
                      {formatTimer(session.startTime)}
                    </span>
                    <span className="text-orange-500 text-[10px] font-bold">
                      Rs.{bill}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-theme-muted text-[10px]">Available</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
