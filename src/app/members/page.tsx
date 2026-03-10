"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FiPlus,
  FiSearch,
  FiUsers,
  FiDollarSign,
  FiActivity,
  FiAlertCircle,
} from "react-icons/fi";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { useMenuToggle } from "@/components/layout/AppShell";
import StatCard from "@/components/ui/StatCard";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Badge from "@/components/ui/Badge";
import PlayerCard from "@/components/players/PlayerCard";
import SettleDebtModal from "@/components/players/SettleDebtModal";
import { getStoredUser } from "@/lib/storage/auth.storage";
import { getPlayers, savePlayers } from "@/lib/storage/players.storage";
import { getDebts, saveDebts, settleDebt } from "@/lib/storage/debts.storage";
import { getTables } from "@/lib/storage/tables.storage";
import type { ClubUser, Player, MembershipType, DebtsRecord } from "@/types";

// ── Empty form ───────────────────────────────────────────────────
const EMPTY_FORM = {
  name: "",
  phone: "",
  membershipType: "Regular" as MembershipType,
};

const MEMBERSHIP_TYPES: MembershipType[] = ["Regular", "Premium", "VIP"];
const FILTER_OPTIONS = ["All", "Regular", "Premium", "VIP"] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

// ================================================================
// INNER PAGE
// ================================================================
function PlayersPageInner({ user }: { user: ClubUser }) {
  const toggleMenu = useMenuToggle();

  const [players, setPlayers] = useState<Player[]>([]);
  const [debts, setDebts] = useState<DebtsRecord>({});
  const [activePNames, setActivePNames] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterOption>("All");

  // Modals
  const [addModal, setAddModal] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [deleteModal, setDeleteModal] = useState<Player | null>(null);
  const [settleModal, setSettleModal] = useState<Player | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // ── Load data ────────────────────────────────────────────────
  useEffect(() => {
    setPlayers(getPlayers(user.email));
    setDebts(getDebts(user.email));

    // Get active player names from tables
    const tables = getTables(user.email, user);
    const names = new Set<string>();
    tables
      .filter((t) => t.status === "occupied")
      .forEach((t) =>
        t.session?.players
          .filter((p) => p.isRegistered)
          .forEach((p) => names.add(p.name)),
      );
    setActivePNames(names);
  }, [user]);

  const persistPlayers = useCallback(
    (updated: Player[]) => {
      setPlayers(updated);
      savePlayers(user.email, updated);
    },
    [user.email],
  );

  // ── Open add modal ──────────────────────────────────────────
  const openAdd = () => {
    setEditPlayer(null);
    setForm({ ...EMPTY_FORM });
    setAddModal(true);
  };

  // ── Open edit modal ─────────────────────────────────────────
  const openEdit = (player: Player) => {
    setEditPlayer(player);
    setForm({
      name: player.name,
      phone: player.phone,
      membershipType: player.membershipType,
    });
    setAddModal(true);
  };

  // ── Save player ─────────────────────────────────────────────
  const handleSave = () => {
    if (!form.name.trim()) return;

    if (editPlayer) {
      persistPlayers(
        players.map((p) => (p.id === editPlayer.id ? { ...p, ...form } : p)),
      );
    } else {
      const newPlayer: Player = {
        id: `player-${Date.now()}`,
        name: form.name.trim(),
        phone: form.phone.trim(),
        membershipType: form.membershipType,
        totalVisits: 0,
        totalPaid: 0,
        joinDate: Date.now(),
        lastVisit: 0,
      };
      persistPlayers([...players, newPlayer]);
    }
    setAddModal(false);
  };

  // ── Delete player ────────────────────────────────────────────
  const handleDelete = () => {
    if (!deleteModal) return;
    persistPlayers(players.filter((p) => p.id !== deleteModal.id));
    // Clear their debt too
    const updated = { ...debts };
    delete updated[deleteModal.name];
    setDebts(updated);
    saveDebts(user.email, updated);
    setDeleteModal(null);
  };

  // ── Settle debt ──────────────────────────────────────────────
  const handleSettle = (playerName: string, amount: number) => {
    settleDebt(user.email, playerName, amount);
    const updated = getDebts(user.email);
    setDebts(updated);

    // Update player total paid
    persistPlayers(
      players.map((p) =>
        p.name === playerName ? { ...p, totalPaid: p.totalPaid + amount } : p,
      ),
    );
  };

  // ── Filter + search ──────────────────────────────────────────
  const filtered = players.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search);
    const matchFilter = filter === "All" || p.membershipType === filter;
    return matchSearch && matchFilter;
  });

  // ── Stats ─────────────────────────���───────────────────────────
  const totalDebt = Object.values(debts).reduce((s, a) => s + a, 0);
  const totalPaid = players.reduce((s, p) => s + p.totalPaid, 0);
  const activeCount = activePNames.size;
  const debtorCount = Object.keys(debts).filter((k) => debts[k] > 0).length;

  return (
    <>
      {/* ── Header ──────────────────────────────────────── */}
      <PageHeader
        title="Players"
        subtitle="Manage your regular customers"
        onMenuClick={toggleMenu}
        statusPill={
          <Badge label={`${players.length} Players`} variant="blue" dot />
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
            <span className="hidden sm:inline">Add Player</span>
          </button>
        }
      />

      {/* ── Page body ───────────────────────────────────── */}
      <div className="flex-1 p-4 lg:p-6 space-y-6">
        {/* ── Stat cards ──────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard
            label="Total Players"
            value={players.length}
            icon={FiUsers}
            iconColor="text-blue-500"
            iconBg="bg-blue-500/10"
          />
          <StatCard
            label="Active Today"
            value={activeCount}
            icon={FiActivity}
            iconColor="text-emerald-500"
            iconBg="bg-emerald-500/10"
          />
          <StatCard
            label="Total Collected"
            value={totalPaid}
            prefix="Rs."
            icon={FiDollarSign}
            iconColor="text-purple-500"
            iconBg="bg-purple-500/10"
          />
          <StatCard
            label="Outstanding Debt"
            value={totalDebt}
            prefix="Rs."
            icon={FiAlertCircle}
            iconColor="text-orange-500"
            iconBg="bg-orange-500/10"
            trend={
              debtorCount > 0
                ? `${debtorCount} player${debtorCount > 1 ? "s" : ""} owe`
                : undefined
            }
          />
        </div>

        {/* ── Search + filter ──────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch
              className="
              absolute left-3.5 top-1/2 -translate-y-1/2
              text-theme-muted text-sm
            "
            />
            <input
              className="input-theme pl-10"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 p-1 rounded-xl bg-theme-secondary border border-theme">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-semibold
                  transition-all duration-200
                  ${
                    filter === f
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-theme-secondary hover:text-theme-primary"
                  }
                `}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Players grid ─────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="card-theme p-12 text-center">
            <FiUsers className="text-4xl text-theme-muted mx-auto mb-3" />
            <p className="text-theme-primary font-semibold">
              {search || filter !== "All"
                ? "No players found"
                : "No players yet"}
            </p>
            <p className="text-theme-muted text-sm mt-1">
              {search || filter !== "All"
                ? "Try a different search or filter"
                : "Add your first regular customer"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((player, i) => (
              <div
                key={player.id}
                className={`animate-fade-in stagger-${Math.min(i + 1, 4)}`}
              >
                <PlayerCard
                  player={player}
                  debts={debts}
                  isActive={activePNames.has(player.name)}
                  onEdit={openEdit}
                  onDelete={setDeleteModal}
                  onSettle={setSettleModal}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────── */}
      <Modal
        open={addModal}
        onClose={() => setAddModal(false)}
        title={editPlayer ? "Edit Player" : "Add New Player"}
        subtitle={
          editPlayer
            ? `Editing ${editPlayer.name}`
            : "Register a regular customer"
        }
        size="sm"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setAddModal(false)}
              className="
                flex-1 py-2.5 rounded-xl text-sm font-semibold
                text-theme-primary bg-theme-secondary
                border border-theme transition-all duration-200
              "
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!form.name.trim()}
              className="
                flex-1 py-2.5 rounded-xl text-sm font-semibold text-white
                bg-blue-600 hover:bg-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-lg shadow-blue-500/20
                transition-all duration-200
              "
            >
              {editPlayer ? "Save Changes" : "Add Player"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-theme-secondary mb-1.5">
              Full Name
            </label>
            <input
              className="input-theme"
              placeholder="e.g. Ahmed Khan"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-theme-secondary mb-1.5">
              Phone Number
            </label>
            <input
              className="input-theme"
              placeholder="e.g. 0300-1234567"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          {/* Membership */}
          <div>
            <label className="block text-xs font-medium text-theme-secondary mb-2">
              Membership Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MEMBERSHIP_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setForm({ ...form, membershipType: type })}
                  className={`
                    py-2.5 rounded-xl text-xs font-semibold border
                    transition-all duration-200
                    ${
                      form.membershipType === type
                        ? type === "Regular"
                          ? "border-slate-500 bg-slate-500/10 text-slate-500"
                          : type === "Premium"
                            ? "border-blue-500 bg-blue-500/10 text-blue-500"
                            : "border-yellow-500 bg-yellow-500/10 text-yellow-500"
                        : "border-theme bg-theme-secondary text-theme-secondary hover:border-theme-hover"
                    }
                  `}
                >
                  {type}
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
        title="Delete Player?"
        message={`Remove "${deleteModal?.name}" from your players list? Their debt record will also be cleared.`}
        confirmLabel="Delete"
        variant="danger"
      />

      {/* ── Settle debt modal ───────────────────────────── */}
      <SettleDebtModal
        open={!!settleModal}
        onClose={() => setSettleModal(null)}
        player={settleModal}
        debt={settleModal ? (debts[settleModal.name] ?? 0) : 0}
        onSettle={handleSettle}
      />
    </>
  );
}

// ================================================================
// MAIN EXPORT
// ================================================================
export default function PlayersPage() {
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
      <PlayersPageInner user={user} />
    </AppShell>
  );
}
