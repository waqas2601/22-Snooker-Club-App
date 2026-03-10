"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiTarget } from "react-icons/fi";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { useMenuToggle } from "@/components/layout/AppShell";
import GameCard from "@/components/games/GameCard";
import GameIcon from "@/components/games/GameIcon";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Badge from "@/components/ui/Badge";
import { getStoredUser } from "@/lib/storage/auth.storage";
import { getGames, saveGames } from "@/lib/storage/games.storage";
import type { ClubUser, GameType, GameUnit } from "@/types";

// ── Icon options ─────────────────────────────────────────────────
const ICON_OPTIONS = [
  "clock",
  "fullframe",
  "1ball",
  "2ball",
  "3ball",
  "4ball",
  "5ball",
  "6ball",
];

const COLOR_OPTIONS = [
  { label: "Blue", value: "blue" },
  { label: "Emerald", value: "emerald" },
  { label: "Orange", value: "orange" },
  { label: "Purple", value: "purple" },
  { label: "Red", value: "red" },
  { label: "Yellow", value: "yellow" },
];

const UNIT_OPTIONS: GameUnit[] = ["per hour", "per frame", "per game"];

// ── Empty form ───────────────────────────────────────────────────
const EMPTY_FORM = {
  name: "",
  description: "",
  rate: 100,
  unit: "per game" as GameUnit,
  color: "blue",
  icon: "1ball",
};

// ================================================================
// INNER PAGE — has access to useMenuToggle
// ================================================================
function GamesPageInner({ user }: { user: ClubUser }) {
  const toggleMenu = useMenuToggle();
  const [games, setGames] = useState<GameType[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<GameType | null>(null);
  const [editing, setEditing] = useState<GameType | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // ── Load games ──────────────────────────────────────────────
  useEffect(() => {
    setGames(getGames(user.email));
  }, [user.email]);

  const persist = useCallback(
    (updated: GameType[]) => {
      setGames(updated);
      saveGames(user.email, updated);
    },
    [user.email],
  );

  // ── Open add modal ──────────────────────────────────────────
  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  // ── Open edit modal ─────────────────────────────────────────
  const openEdit = (game: GameType) => {
    setEditing(game);
    setForm({
      name: game.name,
      description: game.description,
      rate: game.rate,
      unit: game.unit,
      color: game.color,
      icon: game.icon,
    });
    setModalOpen(true);
  };

  // ── Save (add or edit) ──────────────────────────────────────
  const handleSave = () => {
    if (!form.name.trim()) return;

    if (editing) {
      persist(games.map((g) => (g.id === editing.id ? { ...g, ...form } : g)));
    } else {
      const newGame: GameType = {
        id: `custom-${Date.now()}`,
        ...form,
        enabled: true,
        isDefault: false,
      };
      persist([...games, newGame]);
    }
    setModalOpen(false);
  };

  // ── Toggle enabled ──────────────────────────────────────────
  const handleToggle = (game: GameType) => {
    persist(
      games.map((g) => (g.id === game.id ? { ...g, enabled: !g.enabled } : g)),
    );
  };

  // ── Delete ──────────────────────────────────────────────────
  const handleDelete = () => {
    if (!deleteModal) return;
    persist(games.filter((g) => g.id !== deleteModal.id));
    setDeleteModal(null);
  };

  // ── Stats ────────────────────────────────────────────────────
  const enabledCount = games.filter((g) => g.enabled).length;
  const disabledCount = games.filter((g) => !g.enabled).length;
  const customCount = games.filter((g) => !g.isDefault).length;

  return (
    <>
      {/* ── Header ──────────────────────────────────────── */}
      <PageHeader
        title="Games"
        subtitle="Manage game types and pricing"
        onMenuClick={toggleMenu}
        statusPill={
          <Badge label={`${enabledCount} Active`} variant="emerald" dot />
        }
        actions={
          <button
            onClick={openAdd}
            className="
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
              bg-blue-600 hover:bg-blue-500 text-white
              shadow-lg shadow-blue-500/25
              transition-all duration-200 hover:-translate-y-0.5
            "
          >
            <FiPlus className="text-base" />
            <span className="hidden sm:inline">Add Game</span>
          </button>
        }
      />

      {/* ── Page body ──���────────────────────────────────── */}
      <div className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Summary pills */}
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl
            bg-theme-card border border-theme text-sm"
          >
            <span className="text-theme-muted">Total</span>
            <span className="text-theme-primary font-bold">{games.length}</span>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl
            bg-emerald-500/10 border border-emerald-500/20 text-sm"
          >
            <span className="text-emerald-600 dark:text-emerald-400">
              Active
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {enabledCount}
            </span>
          </div>
          {disabledCount > 0 && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl
              bg-red-500/10 border border-red-500/20 text-sm"
            >
              <span className="text-red-500">Disabled</span>
              <span className="text-red-500 font-bold">{disabledCount}</span>
            </div>
          )}
          {customCount > 0 && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl
              bg-purple-500/10 border border-purple-500/20 text-sm"
            >
              <span className="text-purple-500">Custom</span>
              <span className="text-purple-500 font-bold">{customCount}</span>
            </div>
          )}
        </div>

        {/* Games grid */}
        {games.length === 0 ? (
          <div className="card-theme p-12 text-center">
            <FiTarget className="text-4xl text-theme-muted mx-auto mb-3" />
            <p className="text-theme-primary font-semibold">No games yet</p>
            <p className="text-theme-muted text-sm mt-1">
              Add your first game type to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {games.map((game, i) => (
              <div
                key={game.id}
                className={`animate-fade-in stagger-${Math.min(i + 1, 4)}`}
              >
                <GameCard
                  game={game}
                  onEdit={openEdit}
                  onDelete={setDeleteModal}
                  onToggle={handleToggle}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Game" : "Add New Game"}
        subtitle={
          editing ? `Editing ${editing.name}` : "Create a custom game type"
        }
        size="md"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setModalOpen(false)}
              className="
                flex-1 py-2.5 rounded-xl text-sm font-semibold
                text-theme-primary bg-theme-secondary
                border border-theme hover:border-theme-hover
                transition-all duration-200
              "
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!form.name.trim()}
              className="
                flex-1 py-2.5 rounded-xl text-sm font-semibold
                text-white bg-blue-600 hover:bg-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-lg shadow-blue-500/20
                transition-all duration-200
              "
            >
              {editing ? "Save Changes" : "Add Game"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-theme-secondary mb-1.5">
              Game Name
            </label>
            <input
              className="input-theme"
              placeholder="e.g. 8 Ball Pool"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-theme-secondary mb-1.5">
              Description
            </label>
            <input
              className="input-theme"
              placeholder="Short description of this game"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          {/* Rate + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-theme-secondary mb-1.5">
                Rate (Rs.)
              </label>
              <input
                type="number"
                min={1}
                className="input-theme"
                value={form.rate}
                onChange={(e) =>
                  setForm({ ...form, rate: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-secondary mb-1.5">
                Billing Unit
              </label>
              <select
                className="input-theme"
                value={form.unit}
                onChange={(e) =>
                  setForm({ ...form, unit: e.target.value as GameUnit })
                }
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-medium text-theme-secondary mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setForm({ ...form, color: c.value })}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium border
                    transition-all duration-200
                    ${
                      form.color === c.value
                        ? "border-blue-500 bg-blue-500/15 text-blue-500"
                        : "border-theme text-theme-secondary hover:border-theme-hover"
                    }
                  `}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-xs font-medium text-theme-secondary mb-2">
              Icon
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ICON_OPTIONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setForm({ ...form, icon: ic })}
                  className={`
                    p-3 rounded-xl border flex flex-col items-center gap-1.5
                    transition-all duration-200
                    ${
                      form.icon === ic
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-theme hover:border-theme-hover bg-theme-secondary"
                    }
                  `}
                >
                  <GameIcon icon={ic} color={form.color} size={28} />
                  <span className="text-[9px] text-theme-muted capitalize">
                    {ic}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* ── Delete confirm ──────────────────────────────── */}
      <ConfirmModal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        title="Delete Game?"
        message={`Are you sure you want to delete "${deleteModal?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}

// ================================================================
// MAIN EXPORT — Handles auth check + AppShell wrapper
// ================================================================
export default function GamesPage() {
  const router = useRouter();
  const [user, setUser] = useState<ClubUser | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      router.push("/login");
      return;
    }
    setUser(stored);
  }, [router]);

  if (!user) return null;

  return (
    <AppShell user={user}>
      <GamesPageInner user={user} />
    </AppShell>
  );
}
