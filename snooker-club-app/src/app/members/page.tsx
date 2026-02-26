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
} from "react-icons/fi";
import { GiPoolTriangle } from "react-icons/gi";

// ─── Types ────────────────────────────────────────────────
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
  totalVisits: number;
  totalPaid: number;
  lastVisit: string;
  joinDate: string;
}

// const DUMMY_PLAYERS: Player[] = [
//   {
//     id: "1",
//     name: "Ahmed Khan",
//     phone: "0300-1234567",
//     membershipType: "VIP",
//     totalVisits: 89,
//     totalPaid: 45000,
//     lastVisit: "2025-02-20",
//     joinDate: "2024-01-15",
//   },
//   {
//     id: "2",
//     name: "Bilal Mahmood",
//     phone: "0311-9876543",
//     membershipType: "Premium",
//     totalVisits: 54,
//     totalPaid: 28000,
//     lastVisit: "2025-02-19",
//     joinDate: "2024-02-20",
//   },
//   {
//     id: "3",
//     name: "Kamran Raza",
//     phone: "0333-5551234",
//     membershipType: "Regular",
//     totalVisits: 32,
//     totalPaid: 12000,
//     lastVisit: "2025-02-18",
//     joinDate: "2024-03-10",
//   },
//   {
//     id: "4",
//     name: "Zain Ahmed",
//     phone: "0321-7778888",
//     membershipType: "Premium",
//     totalVisits: 21,
//     totalPaid: 15000,
//     lastVisit: "2025-02-15",
//     joinDate: "2024-01-05",
//   },
//   {
//     id: "5",
//     name: "Usman Ali",
//     phone: "0345-4443333",
//     membershipType: "Regular",
//     totalVisits: 15,
//     totalPaid: 6000,
//     lastVisit: "2025-02-10",
//     joinDate: "2024-04-01",
//   },
//   {
//     id: "6",
//     name: "Hassan Tariq",
//     phone: "0312-2223333",
//     membershipType: "VIP",
//     totalVisits: 120,
//     totalPaid: 72000,
//     lastVisit: "2025-02-20",
//     joinDate: "2023-11-20",
//   },
// ];

const navLinks = [
  { label: "Dashboard", icon: FiHome, href: "/dashboard", active: false },
  { label: "Tables", icon: FiSquare, href: "/tables", active: false },
  { label: "Players", icon: FiUsers, href: "/members", active: true },
  { label: "Payments", icon: FiDollarSign, href: "/payments", active: false },
  { label: "Games", icon: FiSquare, href: "/games", active: false },
  { label: "Profile", icon: FiSettings, href: "/profile", active: false },
];

const membershipColors = {
  Regular: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  Premium: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  VIP: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

const membershipIcons = {
  Regular: FiUser,
  Premium: FiStar,
  VIP: FiAward,
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
        className={`
        fixed top-0 left-0 h-screen w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50
        z-30 flex flex-col transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto
      `}
      >
        {/* Brand */}
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

        {/* Club Info */}
        <div className="px-4 py-3 border-b border-slate-700/50">
          <div className="relative bg-gradient-to-br from-blue-600/15 to-blue-500/5 border border-blue-500/20 rounded-xl p-3 overflow-hidden">
            {/* Decorative dot */}
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <p className="text-white text-sm font-bold truncate pr-4">
              {user.club_name}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                <FiMapPin className="text-[9px]" /> {user.location}
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                <FiSquare className="text-[9px]" /> {user.tables} Tables
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${
                  link.active
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
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
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow shadow-blue-500/30">
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
    p: Omit<Player, "id" | "totalVisits" | "totalPaid" | "joinDate">,
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
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-bold text-lg">
              {isEditing ? "Edit Player" : "Add New Player"}
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              {isEditing
                ? "Update player details"
                : "Add a regular player to your club"}
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
          {/* Avatar Preview */}
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {form.name ? form.name.charAt(0).toUpperCase() : "?"}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-slate-300 text-sm font-medium block mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
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

          {/* Phone */}
          <div>
            <label className="text-slate-300 text-sm font-medium block mb-1.5">
              Phone Number <span className="text-slate-500">(optional)</span>
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

          {/* Membership Type */}
          <div>
            <label className="text-slate-300 text-sm font-medium block mb-1.5">
              Player Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Regular", "Premium", "VIP"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, membershipType: type })}
                  className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${
                    form.membershipType === type
                      ? membershipColors[type]
                      : "bg-slate-800/50 border-slate-700/40 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    {(() => {
                      const Icon = membershipIcons[type];
                      return <Icon className="text-xs" />;
                    })()}
                    {type}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
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

// ─── Delete Confirm ────────────────────────────────────────
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
          Are you sure you want to remove{" "}
          <span className="text-white font-semibold">{player.name}</span> from
          your players list?
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
  onSettle: (playerName: string, amount: number) => void;
}) {
  const [amount, setAmount] = useState(debt);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-6">
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
          {/* Debt Summary */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-center justify-between">
            <span className="text-orange-400 text-sm font-medium">
              Outstanding Debt
            </span>
            <span className="text-orange-400 font-bold text-lg">
              Rs. {debt.toLocaleString()}
            </span>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-slate-300 text-sm font-medium block mb-1.5">
              Amount Paying Now
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                Rs.
              </span>
              <input
                type="number"
                min={1}
                max={debt}
                value={amount}
                onChange={(e) =>
                  setAmount(Math.min(Number(e.target.value), debt))
                }
                className="w-full bg-slate-800/50 border border-slate-600/50 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Quick amounts */}
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      amount === preset
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                    }`}
                  >
                    Rs. {preset.toLocaleString()}
                  </button>
                ))}
            </div>
          </div>

          {/* Remaining after payment */}
          {amount < debt && (
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 flex items-center justify-between">
              <span className="text-slate-400 text-xs">
                Remaining after payment
              </span>
              <span className="text-orange-400 font-semibold text-sm">
                Rs. {(debt - amount).toLocaleString()}
              </span>
            </div>
          )}
          {amount >= debt && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
              <span className="text-emerald-400 text-sm font-semibold">
                Debt fully cleared!
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSettle(player.name, amount);
                onClose();
              }}
              disabled={amount <= 0}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <FiCheck /> Settle Rs. {amount.toLocaleString()}
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
  const daysSinceVisit = Math.floor(
    (Date.now() - new Date(player.lastVisit).getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5 hover:border-slate-600/60 transition-all">
      {/* Top Row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white text-lg font-bold shrink-0">
            {player.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-white font-semibold">{player.name}</h3>
            {player.phone ? (
              <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                <FiPhone className="text-xs" /> {player.phone}
              </p>
            ) : (
              <p className="text-slate-600 text-xs mt-0.5">No phone saved</p>
            )}
          </div>
        </div>
        <span
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-medium ${membershipColors[player.membershipType]}`}
        >
          {(() => {
            const Icon = membershipIcons[player.membershipType];
            return <Icon className="text-xs" />;
          })()}
          {player.membershipType}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-800/40 rounded-xl p-2.5 text-center">
          <p className="text-white font-bold text-lg">{player.totalVisits}</p>
          <p className="text-slate-500 text-[10px]">Visits</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-2.5 text-center">
          <p className="text-emerald-400 font-bold text-sm">
            Rs.{(player.totalPaid / 1000).toFixed(0)}k
          </p>
          <p className="text-slate-500 text-[10px]">Total Paid</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-2.5 text-center">
          <p
            className={`font-bold text-sm ${daysSinceVisit === 0 ? "text-emerald-400" : daysSinceVisit <= 3 ? "text-blue-400" : "text-slate-400"}`}
          >
            {daysSinceVisit === 0 ? "Today" : `${daysSinceVisit}d`}
          </p>
          <p className="text-slate-500 text-[10px]">Last Visit</p>
        </div>
      </div>

      {/* Last Visit Bar */}
      <div className="flex items-center gap-2 mb-4">
        <FiClock className="text-slate-600 text-xs shrink-0" />
        <p className="text-slate-500 text-xs">
          Last seen:{" "}
          {new Date(player.lastVisit).toLocaleDateString("en-PK", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
        {daysSinceVisit === 0 && (
          <span className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            Active Today
          </span>
        )}
      </div>

      {/* Debt Badge */}
      {debt > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-2 flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <FiAlertTriangle className="text-orange-400 text-xs" />
            <span className="text-orange-400 text-xs font-medium">Owes</span>
          </div>
          <span className="text-orange-400 font-bold text-sm">
            Rs. {debt.toLocaleString()}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(player)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/40 hover:border-slate-600 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-all"
        >
          <FiEdit2 className="text-xs" /> Edit
        </button>
        {debt > 0 && (
          <button
            onClick={() => onSettle(player)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium transition-all"
          >
            <FiMinusCircle className="text-xs" /> Settle
          </button>
        )}
        <button
          onClick={() => onDelete(player)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-medium transition-all"
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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | Player["membershipType"]>("All");
  const [addModal, setAddModal] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [deletePlayer, setDeletePlayer] = useState<Player | null>(null);
  const [storageKey, setStorageKey] = useState("");
  const [debts, setDebts] = useState<Record<string, number>>({});
  const [settlePlayer, setSettlePlayer] = useState<Player | null>(null);

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
  }, [router]);

  const persist = (updated: Player[]) => {
    setPlayers(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem("club_user");
    router.push("/login");
  };

  const handleAdd = (
    form: Omit<Player, "id" | "totalVisits" | "totalPaid" | "joinDate">,
  ) => {
    const newPlayer: Player = {
      ...form,
      id: `player-${Date.now()}`,
      totalVisits: 0,
      totalPaid: 0,
      joinDate: new Date().toISOString().split("T")[0],
    };
    persist([newPlayer, ...players]);
  };

  const handleEdit = (
    form: Omit<Player, "id" | "totalVisits" | "totalPaid" | "joinDate">,
  ) => {
    if (!editPlayer) return;
    persist(
      players.map((p) => (p.id === editPlayer.id ? { ...p, ...form } : p)),
    );
  };

  const handleDelete = (id: string) => {
    persist(players.filter((p) => p.id !== id));
  };

  const handleSettle = (playerName: string, amount: number) => {
    if (!user) return;
    const updated = { ...debts };
    updated[playerName] = Math.max(0, (updated[playerName] || 0) - amount);
    if (updated[playerName] === 0) delete updated[playerName];
    setDebts(updated);
    localStorage.setItem(`club_debts_${user.email}`, JSON.stringify(updated));
  };

  const filtered = players.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search);
    const matchFilter = filter === "All" || p.membershipType === filter;
    return matchSearch && matchFilter;
  });

  // Stats
  const totalVisits = players.reduce((a, p) => a + p.totalVisits, 0);
  const totalRevenue = players.reduce((a, p) => a + p.totalPaid, 0);
  const activeToday = players.filter((p) => {
    const days = Math.floor(
      (Date.now() - new Date(p.lastVisit).getTime()) / (1000 * 60 * 60 * 24),
    );
    return days === 0;
  }).length;

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
        {/* Header */}
        <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-xl border-b border-slate-700/40 px-4 lg:px-6">
          <div className="flex items-center justify-between h-18">
            {/* Left */}
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

            {/* Right */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAddModal(true)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <FiPlus className="text-sm" />
                <span className="hidden sm:inline">Add Player</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Players",
                value: players.length,
                color: "blue",
                icon: FiUsers,
              },
              {
                label: "Active Today",
                value: activeToday,
                color: "emerald",
                icon: FiClock,
              },
              {
                label: "Total Visits",
                value: totalVisits,
                color: "purple",
                icon: FiAward,
              },
              {
                label: "Outstanding Debt",
                value: `Rs. ${Object.values(debts)
                  .reduce((a, b) => a + b, 0)
                  .toLocaleString()}`,
                color: "orange",
                icon: FiAlertTriangle,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-xs">{s.label}</p>
                  <s.icon
                    className={`text-sm ${
                      s.color === "blue"
                        ? "text-blue-400"
                        : s.color === "emerald"
                          ? "text-emerald-400"
                          : s.color === "purple"
                            ? "text-purple-400"
                            : "text-orange-400"
                    }`}
                  />
                </div>
                <p
                  className={`text-2xl font-bold ${
                    s.color === "blue"
                      ? "text-blue-400"
                      : s.color === "emerald"
                        ? "text-emerald-400"
                        : s.color === "purple"
                          ? "text-purple-400"
                          : "text-orange-400"
                  }`}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Search & Filter */}
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
            <div className="flex gap-2">
              {(["All", "Regular", "Premium", "VIP"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                    filter === f
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-slate-900/60 border-slate-700/40 text-slate-400 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Players Grid */}
          {filtered.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-700/40 border-dashed rounded-2xl p-16 text-center">
              <div className="w-14 h-14 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiUsers className="text-slate-600 text-2xl" />
              </div>
              <p className="text-white font-semibold mb-1">No Players Found</p>
              <p className="text-slate-500 text-sm mb-6">
                {search
                  ? "Try a different search"
                  : "Add your first regular player"}
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

      {/* Modals */}
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
