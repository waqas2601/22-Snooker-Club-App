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
  FiEdit2,
  FiCheck,
  FiX,
  FiSquare,
  FiPlus,
  FiTrash2,
  FiAlertTriangle,
  FiClock,
  FiCircle,
  FiToggleLeft,
  FiToggleRight,
  FiZap,
  FiTarget,
  FiAward,
  FiStar,
  FiInfo,
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

interface GameType {
  id: string;
  name: string;
  description: string;
  rate: number;
  unit: "per hour" | "per frame" | "per game";
  enabled: boolean;
  color: string;
  icon: string;
  isDefault: boolean;
}

// ─── Defaults ─────────────────────────────────────────────
const DEFAULT_GAMES: GameType[] = [
  {
    id: "per-hour",
    name: "Per Hour",
    description: "Charged by time. Timer runs until session ends.",
    rate: 200,
    unit: "per hour",
    enabled: true,
    color: "blue",
    icon: "clock",
    isDefault: true,
  },
  {
    id: "full-frame",
    name: "Full Frame",
    description: "Complete game from start to finish. Fixed price per frame.",
    rate: 100,
    unit: "per frame",
    enabled: true,
    color: "emerald",
    icon: "fullframe",
    isDefault: true,
  },
  {
    id: "6-balls",
    name: "6 Balls",
    description: "Game played with 6 balls only. Popular quick game.",
    rate: 60,
    unit: "per game",
    enabled: true,
    color: "purple",
    icon: "6ball",
    isDefault: true,
  },
  {
    id: "3-balls",
    name: "3 Balls",
    description: "Quick game with only 3 balls. Fast and popular.",
    rate: 40,
    unit: "per game",
    enabled: true,
    color: "orange",
    icon: "3ball",
    isDefault: true,
  },
  {
    id: "1-ball",
    name: "1 Ball",
    description: "Single ball game. Simplest and cheapest option.",
    rate: 20,
    unit: "per game",
    enabled: false,
    color: "red",
    icon: "1ball",
    isDefault: true,
  },
];

const navLinks = [
  { label: "Dashboard", icon: FiHome, href: "/dashboard", active: false },
  { label: "Tables", icon: FiSquare, href: "/tables", active: false },
  { label: "Players", icon: FiUsers, href: "/members", active: false },
  { label: "Payments", icon: FiDollarSign, href: "/payments", active: false },
  { label: "Games", icon: FiSquare, href: "/games", active: true },
  { label: "Profile", icon: FiSettings, href: "/profile", active: false },
];

const COLORS = [
  "blue",
  "emerald",
  "purple",
  "orange",
  "red",
  "yellow",
  "pink",
  "cyan",
];
const ICON_OPTIONS = [
  "clock",
  "1ball",
  "2ball",
  "3ball",
  "4ball",
  "5ball",
  "6ball",
  "fullframe",
];
const UNITS: GameType["unit"][] = ["per hour", "per frame", "per game"];

const colorMap: Record<string, { card: string; badge: string; btn: string }> = {
  blue: {
    card: "border-blue-500/25 hover:border-blue-500/50",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    btn: "bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/30 text-blue-400",
  },
  emerald: {
    card: "border-emerald-500/25 hover:border-emerald-500/50",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    btn: "bg-emerald-600/20 hover:bg-emerald-600/30 border-emerald-500/30 text-emerald-400",
  },
  purple: {
    card: "border-purple-500/25 hover:border-purple-500/50",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    btn: "bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/30 text-purple-400",
  },
  orange: {
    card: "border-orange-500/25 hover:border-orange-500/50",
    badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    btn: "bg-orange-600/20 hover:bg-orange-600/30 border-orange-500/30 text-orange-400",
  },
  red: {
    card: "border-red-500/25 hover:border-red-500/50",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    btn: "bg-red-600/20 hover:bg-red-600/30 border-red-500/30 text-red-400",
  },
  yellow: {
    card: "border-yellow-500/25 hover:border-yellow-500/50",
    badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    btn: "bg-yellow-600/20 hover:bg-yellow-600/30 border-yellow-500/30 text-yellow-400",
  },
  pink: {
    card: "border-pink-500/25 hover:border-pink-500/50",
    badge: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    btn: "bg-pink-600/20 hover:bg-pink-600/30 border-pink-500/30 text-pink-400",
  },
  cyan: {
    card: "border-cyan-500/25 hover:border-cyan-500/50",
    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    btn: "bg-cyan-600/20 hover:bg-cyan-600/30 border-cyan-500/30 text-cyan-400",
  },
};

const dotColors: Record<string, string> = {
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  pink: "bg-pink-500",
  cyan: "bg-cyan-500",
};

// ─── Icon Renderer ─────────────────────────────────────────
function GameIcon({
  icon,
  className,
  size = 20,
}: {
  icon: string;
  className?: string;
  size?: number;
}) {
  // SVG ball icons
  if (icon === "1ball")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
        <circle cx="12" cy="12" r="10" fill="#ef4444" />
        <circle cx="9" cy="9" r="3" fill="rgba(255,255,255,0.25)" />
        <text
          x="12"
          y="16"
          textAnchor="middle"
          fill="white"
          fontSize="9"
          fontWeight="bold"
        >
          1
        </text>
      </svg>
    );
  if (icon === "2ball")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
        <circle cx="7" cy="12" r="7" fill="#fbbf24" />
        <circle cx="17" cy="12" r="7" fill="#3b82f6" />
        <circle cx="5" cy="9" r="2" fill="rgba(255,255,255,0.25)" />
        <circle cx="15" cy="9" r="2" fill="rgba(255,255,255,0.25)" />
      </svg>
    );
  if (icon === "3ball")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
        <circle cx="12" cy="7" r="6" fill="#ef4444" />
        <circle cx="6" cy="17" r="6" fill="#fbbf24" />
        <circle cx="18" cy="17" r="6" fill="#3b82f6" />
        <circle cx="10" cy="5" r="1.5" fill="rgba(255,255,255,0.25)" />
      </svg>
    );
  if (icon === "4ball")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
        <circle cx="7" cy="7" r="5.5" fill="#ef4444" />
        <circle cx="17" cy="7" r="5.5" fill="#fbbf24" />
        <circle cx="7" cy="17" r="5.5" fill="#3b82f6" />
        <circle cx="17" cy="17" r="5.5" fill="#a855f7" />
        <circle cx="5" cy="5" r="1.5" fill="rgba(255,255,255,0.25)" />
      </svg>
    );
  if (icon === "5ball")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
        <circle cx="12" cy="5" r="4.5" fill="#ef4444" />
        <circle cx="4" cy="13" r="4.5" fill="#fbbf24" />
        <circle cx="20" cy="13" r="4.5" fill="#3b82f6" />
        <circle cx="7.5" cy="20" r="4.5" fill="#a855f7" />
        <circle cx="16.5" cy="20" r="4.5" fill="#10b981" />
        <circle cx="10" cy="3.5" r="1.2" fill="rgba(255,255,255,0.25)" />
      </svg>
    );
  if (icon === "6ball")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
        <circle cx="8" cy="6" r="4.5" fill="#ef4444" />
        <circle cx="16" cy="6" r="4.5" fill="#fbbf24" />
        <circle cx="4" cy="14" r="4.5" fill="#3b82f6" />
        <circle cx="12" cy="14" r="4.5" fill="#a855f7" />
        <circle cx="20" cy="14" r="4.5" fill="#10b981" />
        <circle cx="8" cy="21" r="4.5" fill="#f97316" />
        <circle cx="6" cy="4.5" r="1.2" fill="rgba(255,255,255,0.25)" />
      </svg>
    );
  if (icon === "fullframe")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
        {/* Table outline */}
        <rect x="2" y="5" width="20" height="14" rx="3" fill="#166534" />
        <rect x="4" y="7" width="16" height="10" rx="2" fill="#15803d" />
        {/* Pockets */}
        <circle cx="4" cy="7" r="1.5" fill="#0a0a0a" />
        <circle cx="20" cy="7" r="1.5" fill="#0a0a0a" />
        <circle cx="4" cy="17" r="1.5" fill="#0a0a0a" />
        <circle cx="20" cy="17" r="1.5" fill="#0a0a0a" />
        <circle cx="12" cy="5.5" r="1.2" fill="#0a0a0a" />
        <circle cx="12" cy="18.5" r="1.2" fill="#0a0a0a" />
        {/* Ball */}
        <circle cx="12" cy="12" r="2.5" fill="#ef4444" />
        <circle cx="11" cy="11" r="0.7" fill="rgba(255,255,255,0.4)" />
      </svg>
    );
  // Default — clock for per hour
  const icons: Record<string, React.ElementType> = {
    clock: FiClock,
  };
  const Icon = icons[icon] || FiClock;
  return <Icon className={className} />;
}

// ─── Add/Edit Modal ───────────────────────────────────────
function GameModal({
  game,
  onClose,
  onSave,
}: {
  game: GameType | null;
  onClose: () => void;
  onSave: (g: Omit<GameType, "id" | "isDefault">) => void;
}) {
  const isEditing = !!game;
  const [form, setForm] = useState({
    name: game?.name ?? "",
    description: game?.description ?? "",
    rate: game?.rate ?? 100,
    unit: game?.unit ?? ("per game" as GameType["unit"]),
    enabled: game?.enabled ?? true,
    color: game?.color ?? "blue",
    icon: game?.icon ?? "circle",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  const c = colorMap[form.color];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/40">
          <div>
            <h2 className="text-white font-bold text-lg">
              {isEditing ? "Edit Game Type" : "Add New Game Type"}
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              {isEditing
                ? "Update your game settings"
                : "Create a custom game for your club"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            {/* Preview + Name Row */}
            <div className="flex items-center gap-4">
              {/* Live Preview */}
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center border shrink-0 ${c.badge}`}
              >
                <GameIcon icon={form.icon} className="text-2xl" />
              </div>
              {/* Name */}
              <div className="flex-1">
                <label className="text-slate-300 text-sm font-medium block mb-1.5">
                  Game Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Practice Session"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Icon + Color Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Icon Picker */}
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm({ ...form, icon })}
                      className={`aspect-square rounded-xl flex items-center justify-center transition-all border p-1.5 ${
                        form.icon === icon
                          ? "bg-blue-600/30 border-blue-500/50"
                          : "bg-slate-800/50 border-slate-700/40 hover:border-slate-500"
                      }`}
                    >
                      <GameIcon icon={icon} size={22} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">
                  Color
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, color })}
                      className={`aspect-square rounded-xl flex items-center justify-center transition-all border bg-slate-800/50 ${
                        form.color === color
                          ? "border-white/40 scale-110"
                          : "border-slate-700/40 hover:border-slate-500"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full ${dotColors[color]}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">
                Description
              </label>
              <input
                type="text"
                placeholder="Brief description..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full bg-slate-800/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Rate & Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1.5">
                  Rate (Rs.)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">
                    Rs.
                  </span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.rate}
                    onChange={(e) =>
                      setForm({ ...form, rate: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800/50 border border-slate-600/50 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1.5">
                  Billing Unit
                </label>
                <select
                  value={form.unit}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      unit: e.target.value as GameType["unit"],
                    })
                  }
                  className="w-full bg-slate-800/50 border border-slate-600/50 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <p className="text-slate-500 text-xs mb-2">Quick Presets</p>
              <div className="flex gap-2 flex-wrap">
                {[20, 40, 60, 100, 150, 200, 250, 300].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setForm({ ...form, rate: preset })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      form.rate === preset
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                    }`}
                  >
                    Rs. {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 px-6 pb-6">
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
              <FiCheck /> {isEditing ? "Save Changes" : "Add Game"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────
function DeleteModal({
  game,
  onClose,
  onConfirm,
}: {
  game: GameType;
  onClose: () => void;
  onConfirm: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiAlertTriangle className="text-red-400 text-2xl" />
          </div>
          <h2 className="text-white font-bold text-lg">Delete Game Type?</h2>
          <p className="text-slate-400 text-sm mt-2">
            Are you sure you want to delete{" "}
            <span className="text-white font-semibold">{game.name}</span>? This
            cannot be undone.
          </p>
        </div>
        {game.isDefault && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-5 flex items-start gap-2">
            <FiAlertTriangle className="text-yellow-400 text-sm shrink-0 mt-0.5" />
            <p className="text-yellow-400 text-xs">
              This is a default game. Consider disabling it instead of deleting.
            </p>
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(game.id);
              onClose();
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <FiTrash2 /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Game Card ────────────────────────────────────────────
function GameCard({
  game,
  onEdit,
  onToggle,
  onDelete,
}: {
  game: GameType;
  onEdit: (g: GameType) => void;
  onToggle: (id: string) => void;
  onDelete: (g: GameType) => void;
}) {
  const c = colorMap[game.color];

  return (
    <div
      className={`relative bg-slate-900/60 border rounded-2xl p-5 transition-all duration-300 ${
        game.enabled ? c.card : "border-slate-700/30 opacity-60"
      }`}
    >
      {/* Default Badge */}
      {game.isDefault && (
        <span className="absolute top-3 right-3 text-[10px] text-slate-600 bg-slate-800/50 border border-slate-700/40 px-2 py-0.5 rounded-full">
          Default
        </span>
      )}

      {/* Top Row */}
      <div className="flex items-start gap-3 mb-4 pr-10">
        {/* Icon */}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${
            game.enabled
              ? c.badge
              : "bg-slate-800/50 border-slate-700/40 text-slate-600"
          }`}
        >
          <GameIcon icon={game.icon} className="text-lg" />
        </div>
        {/* Name + Status */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold truncate">{game.name}</h3>
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium mt-0.5 ${
              game.enabled ? "text-emerald-400" : "text-slate-500"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${game.enabled ? "bg-emerald-400" : "bg-slate-600"}`}
            />
            {game.enabled ? "Active" : "Disabled"}
          </span>
        </div>
        {/* Toggle */}
        <button
          onClick={() => onToggle(game.id)}
          className="shrink-0 absolute top-12 right-6"
        >
          {game.enabled ? (
            <FiToggleRight className="text-2xl text-emerald-400 hover:text-emerald-300 transition-colors" />
          ) : (
            <FiToggleLeft className="text-2xl text-slate-600 hover:text-slate-400 transition-colors" />
          )}
        </button>
      </div>

      {/* Description */}
      {game.description && (
        <p className="text-slate-400 text-xs mb-4 leading-relaxed">
          {game.description}
        </p>
      )}

      {/* Rate Badge */}
      <div
        className={`rounded-xl px-3 py-2.5 mb-4 border flex items-center justify-between ${
          game.enabled ? c.badge : "bg-slate-800/30 border-slate-700/30"
        }`}
      >
        <span className="text-slate-400 text-xs">{game.unit}</span>
        <span
          className={`text-lg font-bold ${game.enabled ? "" : "text-slate-500"}`}
        >
          Rs. {game.rate.toLocaleString()}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(game)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
            game.enabled
              ? c.btn
              : "bg-slate-800/30 border-slate-700/30 text-slate-600 cursor-not-allowed"
          }`}
          disabled={!game.enabled}
        >
          <FiEdit2 className="text-xs" /> Edit
        </button>
        <button
          onClick={() => onDelete(game)}
          className="flex items-center justify-center px-3 py-2 rounded-xl text-xs font-medium border bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
        >
          <FiTrash2 className="text-xs" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function GamesPage() {
  const router = useRouter();
  const [user, setUser] = useState<ClubUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [games, setGames] = useState<GameType[]>([]);
  const [addModal, setAddModal] = useState(false);
  const [editGame, setEditGame] = useState<GameType | null>(null);
  const [deleteGame, setDeleteGame] = useState<GameType | null>(null);
  const [storageKey, setStorageKey] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("club_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const u: ClubUser = JSON.parse(stored);
    setUser(u);
    const key = `club_games_${u.email}`;
    setStorageKey(key);
    const savedGames = localStorage.getItem(key);
    setGames(savedGames ? JSON.parse(savedGames) : DEFAULT_GAMES);
  }, [router]);

  const persist = (updated: GameType[]) => {
    setGames(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem("club_user");
    router.push("/login");
  };
  const handleAdd = (form: Omit<GameType, "id" | "isDefault">) => {
    persist([
      ...games,
      { ...form, id: `custom-${Date.now()}`, isDefault: false },
    ]);
  };
  const handleEdit = (form: Omit<GameType, "id" | "isDefault">) => {
    if (!editGame) return;
    persist(games.map((g) => (g.id === editGame.id ? { ...g, ...form } : g)));
  };
  const handleToggle = (id: string) => {
    persist(
      games.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g)),
    );
  };
  const handleDelete = (id: string) =>
    persist(games.filter((g) => g.id !== id));

  const activeGames = games.filter((g) => g.enabled).length;

  if (!user)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`
        fixed top-0 left-0 h-screen w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50
        z-30 flex flex-col transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
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
              onClick={handleLogout}
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

      <div className="flex-1 flex flex-col min-w-0">
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
                  Game Types
                </h1>
                <p className="text-slate-500 text-[11px] leading-tight">
                  {activeGames} active • {games.length - activeGames} disabled •{" "}
                  {games.length} total
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                <span className="text-emerald-400 text-xs font-medium">
                  {activeGames} Active
                </span>
              </div>
              <button
                onClick={() => setAddModal(true)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <FiPlus className="text-sm" />
                <span className="hidden sm:inline">Add Game</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-3">
            <FiInfo className="text-blue-400 text-lg shrink-0" />
            <p className="text-slate-400 text-sm">
              Add, edit or disable game types based on what your club offers.
              Set your own rates. Changes are saved automatically.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Games", value: games.length, color: "blue" },
              { label: "Active", value: activeGames, color: "emerald" },
              {
                label: "Disabled",
                value: games.length - activeGames,
                color: "red",
              },
              {
                label: "Lowest Rate",
                value:
                  games.filter((g) => g.enabled).length > 0
                    ? `Rs. ${Math.min(...games.filter((g) => g.enabled).map((g) => g.rate))}`
                    : "N/A",
                color: "purple",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-4"
              >
                <p className="text-slate-400 text-xs mb-1">{s.label}</p>
                <p
                  className={`text-xl font-bold ${
                    s.color === "blue"
                      ? "text-blue-400"
                      : s.color === "emerald"
                        ? "text-emerald-400"
                        : s.color === "red"
                          ? "text-red-400"
                          : "text-purple-400"
                  }`}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Games Grid */}
          {games.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-700/40 border-dashed rounded-2xl p-16 text-center">
              <div className="w-14 h-14 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiSquare className="text-slate-600 text-2xl" />
              </div>
              <p className="text-white font-semibold mb-1">No Game Types Yet</p>
              <p className="text-slate-500 text-sm mb-6">
                Add your first game type to get started
              </p>
              <button
                onClick={() => setAddModal(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors"
              >
                <FiPlus /> Add First Game
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onEdit={(g) => setEditGame(g)}
                  onToggle={handleToggle}
                  onDelete={(g) => setDeleteGame(g)}
                />
              ))}
            </div>
          )}

          {/* Rate Table */}
          {games.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700/40">
                <h3 className="text-white font-semibold">Rate Summary</h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  All games at a glance
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/30">
                      <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wider px-6 py-3">
                        Game
                      </th>
                      <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wider px-6 py-3">
                        Rate
                      </th>
                      <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                        Unit
                      </th>
                      <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wider px-6 py-3">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {games.map((game) => (
                      <tr
                        key={game.id}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center border ${colorMap[game.color].badge}`}
                            >
                              <GameIcon icon={game.icon} className="text-xs" />
                            </div>
                            <span className="text-white text-sm font-medium">
                              {game.name}
                            </span>
                            {!game.isDefault && (
                              <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-full">
                                Custom
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-emerald-400 font-bold text-sm">
                            Rs. {game.rate}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 hidden md:table-cell">
                          <span className="text-slate-400 text-sm">
                            {game.unit}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-lg border ${
                              game.enabled
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-slate-800/50 text-slate-500 border-slate-700/40"
                            }`}
                          >
                            {game.enabled ? "Active" : "Disabled"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {addModal && (
        <GameModal
          game={null}
          onClose={() => setAddModal(false)}
          onSave={handleAdd}
        />
      )}
      {editGame && (
        <GameModal
          game={editGame}
          onClose={() => setEditGame(null)}
          onSave={handleEdit}
        />
      )}
      {deleteGame && (
        <DeleteModal
          game={deleteGame}
          onClose={() => setDeleteGame(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
