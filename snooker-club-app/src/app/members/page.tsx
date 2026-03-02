"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiHome,
  FiUsers,
  FiDollarSign,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiSquare,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
  FiPhone,
  FiClock,
  FiAward,
  FiUser,
  FiStar,
  FiAlertTriangle,
  FiMinusCircle,
  FiMapPin,
  FiMessageCircle,
  FiTarget,
  FiInfo,
  FiCheckCircle,
} from "react-icons/fi";
import { GiPoolTriangle } from "react-icons/gi";

// ─── Types ─────────────────────────────────────────────────
interface ClubUser {
  club_name: string;
  owner_name: string;
  email: string;
  location: string;
  tables: number;
}
interface Player {
  id: string;
  name: string;
  phone: string;
  membershipType: "Regular" | "Premium" | "VIP";
  totalGames: number;
  totalPaid: number;
  lastVisit: string;
  joinDate: string;
}

// ─── Constants ──────────────────────────────────────────────
const navLinks = [
  { label: "Dashboard", icon: FiHome, href: "/dashboard", active: false },
  { label: "Tables", icon: FiSquare, href: "/tables", active: false },
  { label: "Players", icon: FiUsers, href: "/members", active: true },
  { label: "Payments", icon: FiDollarSign, href: "/payments", active: false },
  { label: "Games", icon: FiTarget, href: "/games", active: false },
  { label: "Profile", icon: FiSettings, href: "/profile", active: false },
];

const MEMBERSHIP_COLORS: Record<string, string> = {
  Regular: "bg-green-500/10 text-slate-400 border-green-500/20",
  Premium: "bg-blue-500/10  text-blue-400  border-blue-500/20",
  VIP: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};
const MEMBERSHIP_ICONS: Record<string, React.ElementType> = {
  Regular: FiUser,
  Premium: FiStar,
  VIP: FiStar,
};

// ─── Sidebar ───────────────────────────────────────────────
function Sidebar({
  user,
  open,
  onClose,
  onLogout,
}: {
  user: ClubUser;
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-30 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto`}
      >
        <div className="px-5 pt-5 pb-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <GiPoolTriangle className="text-white text-base" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">
                Snooker Manager
              </p>
              <p className="text-blue-400/70 text-[10px] font-medium tracking-wide uppercase">
                Pro Edition
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-slate-700/50">
          <div className="relative bg-gradient-to-br from-blue-600/15 to-blue-500/5 border border-blue-500/20 rounded-xl p-3 overflow-hidden">
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <p className="text-white text-sm font-bold truncate pr-4">
              {user.club_name}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                <FiMapPin className="text-[9px]" />
                {user.location}
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                <FiSquare className="text-[9px]" />
                {user.tables} Tables
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider px-3 mb-3">
            Navigation
          </p>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${link.active ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "text-slate-400 hover:text-white hover:bg-slate-800/60"}`}
            >
              <link.icon className="text-lg shrink-0" />
              {link.label}
              {link.active && (
                <div className="ml-auto w-1.5 h-1.5 bg-blue-400 rounded-full" />
              )}
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/40 rounded-xl px-3 py-2.5 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.owner_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {user.owner_name}
              </p>
              <p className="text-slate-500 text-[10px] truncate">
                {user.email}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
              title="Logout"
            >
              <FiLogOut className="text-sm" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400/70 text-[10px] font-medium">
              System Online
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Add / Edit Modal ──────────────────────────────────────
function PlayerModal({
  player,
  onClose,
  onSave,
}: {
  player: Player | null;
  onClose: () => void;
  onSave: (
    p: Omit<Player, "id" | "totalGames" | "totalPaid" | "joinDate">,
  ) => void;
}) {
  const isEditing = !!player;
  const [form, setForm] = useState({
    name: player?.name ?? "",
    phone: player?.phone ?? "",
    membershipType:
      player?.membershipType ?? ("Regular" as Player["membershipType"]),
    lastVisit: player?.lastVisit ?? new Date().toISOString().split("T")[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-bold text-lg">
              {isEditing ? "Edit Player" : "Add New Player"}
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              {isEditing
                ? "Update player details"
                : "Register a player to your club"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {form.name ? form.name.charAt(0).toUpperCase() : "?"}
            </div>
          </div>

          <div>
            <label className="text-slate-300 text-sm font-medium block mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                required
                placeholder="Ahmed Khan"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 text-sm font-medium block mb-1.5">
              Phone <span className="text-slate-500">(optional)</span>
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="0300-1234567"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 text-sm font-medium block mb-1.5">
              Player Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Regular", "Premium", "VIP"] as const).map((type) => {
                const Icon = MEMBERSHIP_ICONS[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, membershipType: type })}
                    className={`py-2.5 rounded-xl text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${form.membershipType === type ? MEMBERSHIP_COLORS[type] : "bg-slate-800/50 border-slate-700/40 text-slate-400 hover:text-white"}`}
                  >
                    <Icon className="text-xs" />
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <FiCheck /> {isEditing ? "Save Changes" : "Add Player"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Modal ────────────────────────────���─────────────
function DeleteModal({
  player,
  onClose,
  onConfirm,
}: {
  player: Player;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
        <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiTrash2 className="text-red-400 text-2xl" />
        </div>
        <h2 className="text-white font-bold text-lg mb-2">Remove Player?</h2>
        <p className="text-slate-400 text-sm mb-6">
          Remove <span className="text-white font-semibold">{player.name}</span>{" "}
          from your club? Their payment history will remain in Payments.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Settle Debt Modal ─────────────────────────────────────
function SettleDebtModal({
  player,
  debt,
  onClose,
  onSettle,
}: {
  player: Player;
  debt: number;
  onClose: () => void;
  onSettle: (
    playerName: string,
    amount: number,
    method: "Cash" | "EasyPaisa" | "JazzCash",
  ) => void;
}) {
  const [amount, setAmount] = useState(debt);
  const [method, setMethod] = useState<"Cash" | "EasyPaisa" | "JazzCash">(
    "Cash",
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const remaining = debt - amount;

  const handleSettle = () => {
    onSettle(player.name, amount, method);
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="text-emerald-400 text-3xl" />
          </div>
          <h2 className="text-white font-bold text-lg mb-2">
            Debt Settled! 🎉
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            Rs. {amount.toLocaleString()} collected from{" "}
            <span className="text-white font-semibold">{player.name}</span>
          </p>

          <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 mb-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Amount Collected</span>
              <span className="text-emerald-400 font-bold">
                Rs. {amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Payment Method</span>
              <span className="text-white font-medium">{method}</span>
            </div>
            {remaining > 0 && (
              <div className="flex justify-between text-sm pt-2 border-t border-slate-700/40">
                <span className="text-slate-400">Remaining Debt</span>
                <span className="text-orange-400 font-semibold">
                  Rs. {remaining.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 mb-5">
            <p className="text-blue-400 text-xs flex items-start gap-2">
              <FiInfo className="shrink-0 mt-0.5" />
              This payment has been added to today's revenue and will appear in
              the Payments page.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-bold text-lg">Settle Debt</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              {player.name} owes Rs. {debt.toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FiX />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-orange-400 text-sm font-medium">
              Outstanding Debt
            </span>
            <span className="text-orange-400 font-bold text-xl">
              Rs. {debt.toLocaleString()}
            </span>
          </div>

          <div>
            <label className="text-slate-300 text-sm font-medium block mb-1.5">
              Amount Collecting Now
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">
                Rs.
              </span>
              <input
                type="number"
                min={1}
                max={debt}
                value={amount}
                onChange={(e) =>
                  setAmount(Math.min(Math.max(1, Number(e.target.value)), debt))
                }
                className="w-full bg-slate-800/50 border border-slate-600/50 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <p className="text-slate-500 text-xs mb-2">Quick amounts</p>
            <div className="flex gap-2 flex-wrap">
              {[debt, Math.floor(debt / 2), Math.floor(debt / 4)]
                .filter((v, i, a) => a.indexOf(v) === i && v > 0)
                .map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${amount === preset ? "bg-blue-600 text-white border-blue-500" : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"}`}
                  >
                    Rs. {preset.toLocaleString()}
                  </button>
                ))}
            </div>
          </div>

          <div>
            <p className="text-slate-300 text-sm font-medium mb-2">
              Payment Method
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(["Cash", "EasyPaisa", "JazzCash"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`py-2.5 rounded-xl border text-xs font-medium transition-all ${method === m ? "bg-blue-600/20 border-blue-500/40 text-blue-400" : "bg-slate-800/50 border-slate-700/40 text-slate-400 hover:text-white"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {amount >= debt ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
              <span className="text-emerald-400 text-sm font-semibold">
                ✓ Debt will be fully cleared!
              </span>
            </div>
          ) : (
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-slate-400 text-xs">
                Remaining after payment
              </span>
              <span className="text-orange-400 font-semibold text-sm">
                Rs. {remaining.toLocaleString()}
              </span>
            </div>
          )}

          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl px-3 py-2.5">
            <p className="text-blue-400 text-xs flex items-start gap-2">
              <FiDollarSign className="shrink-0 mt-0.5" />
              Rs. {amount.toLocaleString()} will be added to today's revenue
              under <strong>{method}</strong>
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSettle}
              disabled={amount <= 0}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <FiCheck /> Collect Rs. {amount.toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Player Card ───────────────────────────────────────────
function PlayerCard({
  player,
  debt,
  onEdit,
  onDelete,
  onSettle,
}: {
  player: Player;
  debt: number;
  onEdit: (p: Player) => void;
  onDelete: (p: Player) => void;
  onSettle: (p: Player) => void;
}) {
  const todayStr = new Date().toISOString().split("T")[0];
  const visitStr = player.lastVisit ? player.lastVisit.split("T")[0] : "";
  const isVisitedToday = visitStr === todayStr;
  const daysSince = player.lastVisit
    ? Math.floor(
        (Date.now() - new Date(player.lastVisit).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 999;
  const Icon = MEMBERSHIP_ICONS[player.membershipType];

  return (
    <div
      className={`bg-slate-900/60 border rounded-2xl p-5 transition-all flex flex-col ${
        debt > 0
          ? "border-orange-500/20 hover:border-orange-500/40"
          : "border-slate-700/40 hover:border-slate-600/60"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white text-lg font-bold shrink-0 ${
              isVisitedToday
                ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                : "bg-gradient-to-br from-blue-500 to-blue-700"
            }`}
          >
            {player.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm leading-tight">
              {player.name}
            </h3>
            {player.phone ? (
              <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                <FiPhone className="text-[10px]" />
                {player.phone}
              </p>
            ) : (
              <p className="text-slate-600 text-xs mt-0.5">No phone saved</p>
            )}
          </div>
        </div>
        <span
          className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border font-medium shrink-0 ${MEMBERSHIP_COLORS[player.membershipType]}`}
        >
          <Icon className="text-[10px]" />
          {player.membershipType}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-slate-800/40 rounded-xl p-2.5 text-center">
          <p className="text-white font-bold text-base">
            {player.totalGames || 0}
          </p>
          <p className="text-slate-500 text-[10px]">Games</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-2.5 text-center">
          <p className="text-emerald-400 font-bold text-xs leading-snug mt-0.5">
            {(player.totalPaid || 0) >= 1000
              ? `Rs.${((player.totalPaid || 0) / 1000).toFixed(1)}k`
              : `Rs.${player.totalPaid || 0}`}
          </p>
          <p className="text-slate-500 text-[10px]">Paid</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-2.5 text-center">
          <p
            className={`font-bold text-xs leading-snug mt-0.5 ${
              isVisitedToday
                ? "text-emerald-400"
                : daysSince <= 3
                  ? "text-blue-400"
                  : "text-slate-400"
            }`}
          >
            {isVisitedToday
              ? "Today"
              : player.lastVisit
                ? `${daysSince}d ago`
                : "Never"}
          </p>
          <p className="text-slate-500 text-[10px]">Last Visit</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <FiClock className="text-slate-600 text-xs shrink-0" />
        <p className="text-slate-500 text-xs truncate">
          {player.lastVisit
            ? new Date(player.lastVisit).toLocaleDateString("en-PK", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "No visits yet"}
        </p>
        {isVisitedToday && (
          <span className="ml-auto shrink-0 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            Active
          </span>
        )}
      </div>

      <div className="mb-3 min-h-[38px]">
        {debt > 0 ? (
          <div className="bg-orange-500/10 border border-orange-500/25 rounded-xl px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FiAlertTriangle className="text-orange-400 text-xs" />
              <span className="text-orange-400 text-xs font-semibold">
                Owes
              </span>
            </div>
            <span className="text-orange-400 font-bold text-sm">
              Rs. {debt.toLocaleString()}
            </span>
          </div>
        ) : (
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-3 py-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span className="text-emerald-600 text-xs">
              No outstanding debt
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onEdit(player)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/40 hover:border-slate-600 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-all"
        >
          <FiEdit2 className="text-xs" /> Edit
        </button>

        {player.phone && (
          <a
            href={`https://wa.me/92${player.phone.replace(/^0/, "").replace(/-/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-3 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-xl text-xs transition-all"
            title="WhatsApp"
          >
            <FiMessageCircle className="text-xs" />
          </a>
        )}

        {debt > 0 && (
          <button
            onClick={() => onSettle(player)}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium transition-all"
          >
            <FiMinusCircle className="text-xs" /> Settle
          </button>
        )}

        <button
          onClick={() => onDelete(player)}
          className="flex items-center justify-center px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-xs transition-all"
        >
          <FiTrash2 className="text-xs" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────
export default function PlayersPage() {
  const router = useRouter();
  const [user, setUser] = useState<ClubUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [debts, setDebts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | Player["membershipType"]>("All");
  const [addModal, setAddModal] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [deletePlayer, setDeletePlayer] = useState<Player | null>(null);
  const [settlePlayer, setSettlePlayer] = useState<Player | null>(null);
  const [storageKey, setStorageKey] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("club_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const u: ClubUser = JSON.parse(stored);
    setUser(u);

    const key = `club_players_${u.email}`;
    setStorageKey(key);
    const saved = localStorage.getItem(key);
    setPlayers(saved ? JSON.parse(saved) : []);

    const savedDebts = localStorage.getItem(`club_debts_${u.email}`);
    if (savedDebts) setDebts(JSON.parse(savedDebts));
    else setDebts({});
  }, [router]);

  // ✅ Reload debts when tab gains focus (in case Dashboard updated them)
  useEffect(() => {
    const onFocus = () => {
      if (!user) return;
      const savedDebts = localStorage.getItem(`club_debts_${user.email}`);
      setDebts(savedDebts ? JSON.parse(savedDebts) : {});
      const saved = localStorage.getItem(`club_players_${user.email}`);
      if (saved) setPlayers(JSON.parse(saved));
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user]);

  const persist = (updated: Player[]) => {
    setPlayers(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem("club_user");
    router.push("/login");
  };

  const handleAdd = (
    form: Omit<Player, "id" | "totalGames" | "totalPaid" | "joinDate">,
  ) => {
    const p: Player = {
      ...form,
      id: `player-${Date.now()}`,
      totalGames: 0,
      totalPaid: 0,
      joinDate: new Date().toISOString().split("T")[0],
    };
    persist([p, ...players]);
  };

  const handleEdit = (
    form: Omit<Player, "id" | "totalGames" | "totalPaid" | "joinDate">,
  ) => {
    if (!editPlayer) return;
    persist(
      players.map((p) => (p.id === editPlayer.id ? { ...p, ...form } : p)),
    );
  };

  const handleDelete = (id: string) =>
    persist(players.filter((p) => p.id !== id));

  // ✅ FIXED: Settle debt — NO club_today updates
  const handleSettle = (
    playerName: string,
    amount: number,
    method: "Cash" | "EasyPaisa" | "JazzCash",
  ) => {
    if (!user) return;

    // 1. Reduce / clear debt in club_debts
    const newDebts = { ...debts };
    newDebts[playerName] = Math.max(0, (newDebts[playerName] || 0) - amount);
    if (newDebts[playerName] === 0) delete newDebts[playerName];
    setDebts(newDebts);
    localStorage.setItem(`club_debts_${user.email}`, JSON.stringify(newDebts));

    // ❌ REMOVED: Don't write to club_today — Dashboard calculates from club_recent

    // 2. Write DebtPayment record to club_recent
    const recentKey = `club_recent_${user.email}`;
    const raw = localStorage.getItem(recentKey);
    const recent = raw ? JSON.parse(raw) : [];
    const record = {
      id: `debt-${Date.now()}`,
      tableNo: 0,
      players: [{ name: playerName, isRegistered: true }],
      gameType: "Debt Payment",
      duration: "—",
      totalAmount: amount,
      splits: [{ playerName, amount }],
      endTime: Date.now(),
      paymentMethod: "DebtPayment",
      settledMethod: method,
      creditPlayerName: undefined,
    };
    localStorage.setItem(
      recentKey,
      JSON.stringify([record, ...recent].slice(0, 200)),
    );

    // 3. Update player: totalPaid increases, lastVisit = today
    const todayStr = new Date().toISOString().split("T")[0];
    persist(
      players.map((p) => {
        if (p.name !== playerName) return p;
        return {
          ...p,
          totalPaid: (p.totalPaid || 0) + amount,
          lastVisit: todayStr,
        };
      }),
    );
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const activeToday = players.filter(
    (p) => p.lastVisit?.split("T")[0] === todayStr,
  ).length;
  const totalDebt = Object.values(debts).reduce((a, b) => a + b, 0);
  const debtorCount = Object.values(debts).filter((v) => v > 0).length;

  const filtered = players.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search);
    const matchFilter = filter === "All" || p.membershipType === filter;
    return matchSearch && matchFilter;
  });

  if (!user)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-xl border-b border-slate-700/40 px-4 lg:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <FiMenu className="text-lg" />
              </button>
              <div className="hidden lg:block w-px h-5 bg-slate-700/60" />
              <div>
                <h1 className="text-white font-bold text-base leading-tight">
                  Players
                </h1>
                <p className="text-slate-500 text-[11px] leading-tight">
                  {players.length} registered • {activeToday} active today
                </p>
              </div>
            </div>
            <button
              onClick={() => setAddModal(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <FiPlus className="text-sm" />
              <span className="hidden sm:inline">Add Player</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Players",
                value: players.length,
                sub: "Registered members",
                icon: FiUsers,
                color: "blue",
              },
              {
                label: "Active Today",
                value: activeToday,
                sub: "Visited today",
                icon: FiClock,
                color: "emerald",
              },
              {
                label: "Total Games",
                value: players.reduce((a, p) => a + (p.totalGames || 0), 0),
                sub: "All time",
                icon: FiAward,
                color: "purple",
              },
              {
                label: "Outstanding Debt",
                value: `Rs. ${totalDebt.toLocaleString()}`,
                sub: `${debtorCount} player${debtorCount !== 1 ? "s" : ""} owe`,
                icon: FiAlertTriangle,
                color: "orange",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`bg-slate-900/60 border rounded-2xl p-4 ${s.color === "orange" && totalDebt > 0 ? "border-orange-500/25 bg-orange-500/5" : "border-slate-700/40"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-xs font-medium">
                    {s.label}
                  </p>
                  <s.icon
                    className={`text-sm ${s.color === "blue" ? "text-blue-400" : s.color === "emerald" ? "text-emerald-400" : s.color === "purple" ? "text-purple-400" : "text-orange-400"}`}
                  />
                </div>
                <p
                  className={`text-2xl font-bold ${s.color === "blue" ? "text-blue-400" : s.color === "emerald" ? "text-emerald-400" : s.color === "purple" ? "text-purple-400" : "text-orange-400"}`}
                >
                  {s.value}
                </p>
                <p className="text-slate-500 text-xs mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          {totalDebt > 0 && (
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl px-4 py-3 flex items-start gap-3">
              <FiAlertTriangle className="text-orange-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-orange-400 font-semibold text-sm">
                  Rs. {totalDebt.toLocaleString()} Outstanding Debt
                </p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {debtorCount} player{debtorCount !== 1 ? "s" : ""} owe money.
                  Click <span className="text-white font-medium">Settle</span>{" "}
                  on a player card to collect — payment will be added to today's
                  revenue automatically.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/40 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["All", "Regular", "Premium", "VIP"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${filter === f ? "bg-blue-600 text-white border-blue-500" : "bg-slate-900/60 border-slate-700/40 text-slate-400 hover:text-white"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-700/40 border-dashed rounded-2xl p-16 text-center">
              <div className="w-14 h-14 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiUsers className="text-slate-600 text-2xl" />
              </div>
              <p className="text-white font-semibold mb-1">No Players Found</p>
              <p className="text-slate-500 text-sm mb-6">
                {search
                  ? "Try a different search"
                  : "Add your first registered player"}
              </p>
              {!search && (
                <button
                  onClick={() => setAddModal(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors"
                >
                  <FiPlus /> Add First Player
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  debt={debts[player.name] || 0}
                  onEdit={setEditPlayer}
                  onDelete={setDeletePlayer}
                  onSettle={setSettlePlayer}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {addModal && (
        <PlayerModal
          player={null}
          onClose={() => setAddModal(false)}
          onSave={handleAdd}
        />
      )}
      {editPlayer && (
        <PlayerModal
          player={editPlayer}
          onClose={() => setEditPlayer(null)}
          onSave={handleEdit}
        />
      )}
      {settlePlayer && (
        <SettleDebtModal
          player={settlePlayer}
          debt={debts[settlePlayer.name] || 0}
          onClose={() => setSettlePlayer(null)}
          onSettle={handleSettle}
        />
      )}
      {deletePlayer && (
        <DeleteModal
          player={deletePlayer}
          onClose={() => setDeletePlayer(null)}
          onConfirm={() => handleDelete(deletePlayer.id)}
        />
      )}
    </div>
  );
}
