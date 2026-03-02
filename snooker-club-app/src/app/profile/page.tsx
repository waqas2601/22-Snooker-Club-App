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
  FiLock,
  FiPhone,
  FiMapPin,
  FiClock,
  FiCalendar,
  FiPrinter,
  FiEye,
  FiEyeOff,
  FiTarget,
  FiAlertCircle,
  FiInfo,
} from "react-icons/fi";
import { GiPoolTriangle } from "react-icons/gi";

interface ClubUser {
  club_name: string;
  owner_name: string;
  email: string;
  location: string;
  tables: number;
}

interface ClubProfile {
  club_name: string;
  owner_name: string;
  phone: string;
  email: string;
  location: string;
  address: string;
  established: string;
  tables: number;
  openTime: string;
  closeTime: string;
  workingDays: string[];
  receiptClubName: string;
  receiptPhone: string;
  receiptAddress: string;
  receiptMessage: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const navLinks = [
  { label: "Dashboard", icon: FiHome, href: "/dashboard", active: false },
  { label: "Tables", icon: FiSquare, href: "/tables", active: false },
  { label: "Players", icon: FiUsers, href: "/members", active: false },
  { label: "Payments", icon: FiDollarSign, href: "/payments", active: false },
  { label: "Games", icon: FiTarget, href: "/games", active: false },
  { label: "Profile", icon: FiSettings, href: "/profile", active: true },
];

// ─── Section Card Wrapper ─────────────────────────────────
function SectionCard({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700/40 flex items-center gap-3">
        <div className={`p-2 rounded-xl ${iconColor}`}>
          <Icon className="text-lg" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">{title}</h3>
          <p className="text-slate-500 text-xs">{subtitle}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Editable Field ───────────────────────────────────────
function Field({
  label,
  value,
  editing,
  children,
  required,
}: {
  label: string;
  value: string | number;
  editing: boolean;
  children?: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-slate-400 text-xs font-medium block mb-1.5">
        {label}
        {required && editing && <span className="text-red-400 ml-1">*</span>}
      </label>
      {editing ? (
        children
      ) : (
        <p className="text-white text-sm font-medium">
          {value || <span className="text-slate-600">Not set</span>}
        </p>
      )}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────
function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
  required,
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ElementType;
  required?: boolean;
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full bg-slate-800/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors ${Icon ? "pl-9 pr-4" : "px-4"}`}
      />
    </div>
  );
}

// ─── Save / Edit Buttons ──────────────────────────────────
function EditActions({
  editing,
  onEdit,
  onSave,
  onCancel,
}: {
  editing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  if (!editing)
    return (
      <button
        onClick={onEdit}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/40 rounded-lg transition-all"
      >
        <FiEdit2 className="text-xs" /> Edit
      </button>
    );
  return (
    <div className="flex gap-2">
      <button
        onClick={onCancel}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
      >
        <FiX className="text-xs" /> Cancel
      </button>
      <button
        onClick={onSave}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
      >
        <FiCheck className="text-xs" /> Save
      </button>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────
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

// ─── Main Page ────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<ClubUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profile, setProfile] = useState<ClubProfile>({
    club_name: "",
    owner_name: "",
    phone: "",
    email: "",
    location: "",
    address: "",
    established: "",
    tables: 0,
    openTime: "10:00",
    closeTime: "02:00",
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    receiptClubName: "",
    receiptPhone: "",
    receiptAddress: "",
    receiptMessage: "شکریہ! Thank you for visiting!",
  });

  const [editingClub, setEditingClub] = useState(false);
  const [editingHours, setEditingHours] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState(false);
  const [tempProfile, setTempProfile] = useState<ClubProfile>(profile);

  const [editingPassword, setEditingPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("club_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const u: ClubUser = JSON.parse(stored);
    setUser(u);

    const savedProfile = localStorage.getItem(`club_profile_${u.email}`);
    if (savedProfile) {
      const p = JSON.parse(savedProfile);
      setProfile(p);
      setTempProfile(p);
    } else {
      const defaultProfile: ClubProfile = {
        club_name: u.club_name,
        owner_name: u.owner_name,
        phone: "",
        email: u.email,
        location: u.location,
        address: "",
        established: "",
        tables: u.tables,
        openTime: "10:00",
        closeTime: "02:00",
        workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        receiptClubName: u.club_name,
        receiptPhone: "",
        receiptAddress: "",
        receiptMessage: "شکریہ! Thank you for visiting!",
      };
      setProfile(defaultProfile);
      setTempProfile(defaultProfile);
    }
  }, [router]);

  const persistProfile = (updated: ClubProfile) => {
    setProfile(updated);
    setTempProfile(updated);
    if (user) {
      localStorage.setItem(
        `club_profile_${user.email}`,
        JSON.stringify(updated),
      );
      // Update club_user with new data
      const updatedUser = {
        ...user,
        club_name: updated.club_name,
        owner_name: updated.owner_name,
        location: updated.location,
        tables: updated.tables,
      };
      localStorage.setItem("club_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const startEdit = (section: string) => {
    setTempProfile({ ...profile });
    if (section === "club") setEditingClub(true);
    if (section === "hours") setEditingHours(true);
    if (section === "receipt") setEditingReceipt(true);
  };

  const cancelEdit = (section: string) => {
    setTempProfile({ ...profile });
    if (section === "club") setEditingClub(false);
    if (section === "hours") setEditingHours(false);
    if (section === "receipt") setEditingReceipt(false);
  };

  const saveSection = (section: string) => {
    persistProfile({ ...tempProfile });
    if (section === "club") setEditingClub(false);
    if (section === "hours") setEditingHours(false);
    if (section === "receipt") setEditingReceipt(false);
  };

  const toggleDay = (day: string) => {
    const days = tempProfile.workingDays.includes(day)
      ? tempProfile.workingDays.filter((d) => d !== day)
      : [...tempProfile.workingDays, day];
    setTempProfile({ ...tempProfile, workingDays: days });
  };

  const handlePasswordSave = () => {
    setPasswordError("");
    setPasswordSuccess(false);
    if (passwords.current !== "password123") {
      setPasswordError("Current password is incorrect");
      return;
    }
    if (passwords.newPass.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordSuccess(true);
    setPasswords({ current: "", newPass: "", confirm: "" });
    setEditingPassword(false);
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("club_user");
    router.push("/login");
  };

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
                  Profile & Settings
                </h1>
                <p className="text-slate-500 text-[11px] leading-tight">
                  Manage your club information
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {saved && (
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-medium">
                  <FiCheck className="text-xs" /> Saved
                </div>
              )}
              {passwordSuccess && (
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-medium">
                  <FiCheck className="text-xs" /> Password updated
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 space-y-6">
          {/* Club Owner Banner */}
          <div className="relative bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl p-6 overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg shadow-blue-500/30">
                {profile.owner_name.charAt(0)}
              </div>
              <div>
                <h2 className="text-white text-xl font-bold">
                  {profile.club_name}
                </h2>
                <p className="text-slate-400 text-sm">
                  {profile.owner_name} • {profile.location}
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  {profile.email}
                  {profile.phone && ` • ${profile.phone}`}
                </p>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
            <FiInfo className="text-blue-400 text-lg shrink-0 mt-0.5" />
            <div>
              <p className="text-slate-300 text-sm font-medium">
                Keep Your Information Updated
              </p>
              <p className="text-slate-400 text-xs mt-1">
                This information appears on receipts and helps customers find
                you. Make sure your phone number and address are accurate.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Club Information ── */}
            <SectionCard
              title="Club Information"
              subtitle="Basic details about your snooker club"
              icon={FiMapPin}
              iconColor="bg-blue-500/10 text-blue-400"
            >
              <div className="flex items-center justify-between mb-5">
                <p className="text-slate-500 text-xs">Edit your club details</p>
                <EditActions
                  editing={editingClub}
                  onEdit={() => startEdit("club")}
                  onSave={() => saveSection("club")}
                  onCancel={() => cancelEdit("club")}
                />
              </div>
              <div className="space-y-4">
                <Field
                  label="Club Name"
                  value={profile.club_name}
                  editing={editingClub}
                  required
                >
                  <Input
                    value={tempProfile.club_name}
                    onChange={(v) =>
                      setTempProfile({ ...tempProfile, club_name: v })
                    }
                    placeholder="Royal Snooker Club"
                    required
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Owner Name"
                    value={profile.owner_name}
                    editing={editingClub}
                    required
                  >
                    <Input
                      value={tempProfile.owner_name}
                      onChange={(v) =>
                        setTempProfile({ ...tempProfile, owner_name: v })
                      }
                      placeholder="Muhammad Ali"
                      required
                    />
                  </Field>
                  <Field
                    label="Total Tables"
                    value={profile.tables}
                    editing={editingClub}
                    required
                  >
                    <Input
                      type="number"
                      value={tempProfile.tables}
                      onChange={(v) =>
                        setTempProfile({
                          ...tempProfile,
                          tables: parseInt(v) || 0,
                        })
                      }
                      placeholder="6"
                      required
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Phone Number"
                    value={profile.phone}
                    editing={editingClub}
                    required
                  >
                    <Input
                      value={tempProfile.phone}
                      onChange={(v) =>
                        setTempProfile({ ...tempProfile, phone: v })
                      }
                      placeholder="0300-1234567"
                      icon={FiPhone}
                      required
                    />
                  </Field>
                  <Field
                    label="City"
                    value={profile.location}
                    editing={editingClub}
                    required
                  >
                    <Input
                      value={tempProfile.location}
                      onChange={(v) =>
                        setTempProfile({ ...tempProfile, location: v })
                      }
                      placeholder="Karachi"
                      icon={FiMapPin}
                      required
                    />
                  </Field>
                </div>

                <Field
                  label="Full Address"
                  value={profile.address}
                  editing={editingClub}
                >
                  <Input
                    value={tempProfile.address}
                    onChange={(v) =>
                      setTempProfile({ ...tempProfile, address: v })
                    }
                    placeholder="Shop 12, Block 5, Gulshan-e-Iqbal"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Established Year"
                    value={profile.established}
                    editing={editingClub}
                  >
                    <Input
                      value={tempProfile.established}
                      onChange={(v) =>
                        setTempProfile({ ...tempProfile, established: v })
                      }
                      placeholder="2015"
                      icon={FiCalendar}
                    />
                  </Field>
                  <Field label="Email" value={profile.email} editing={false} />
                </div>
              </div>
            </SectionCard>

            {/* ── Working Hours ── */}
            <SectionCard
              title="Working Hours"
              subtitle="Set your club opening and closing times"
              icon={FiClock}
              iconColor="bg-emerald-500/10 text-emerald-400"
            >
              <div className="flex items-center justify-between mb-5">
                <p className="text-slate-500 text-xs">
                  Set your operating hours
                </p>
                <EditActions
                  editing={editingHours}
                  onEdit={() => startEdit("hours")}
                  onSave={() => saveSection("hours")}
                  onCancel={() => cancelEdit("hours")}
                />
              </div>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Opening Time"
                    value={profile.openTime}
                    editing={editingHours}
                  >
                    <input
                      type="time"
                      value={tempProfile.openTime}
                      onChange={(e) =>
                        setTempProfile({
                          ...tempProfile,
                          openTime: e.target.value,
                        })
                      }
                      className="w-full bg-slate-800/50 border border-slate-600/50 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </Field>
                  <Field
                    label="Closing Time"
                    value={profile.closeTime}
                    editing={editingHours}
                  >
                    <input
                      type="time"
                      value={tempProfile.closeTime}
                      onChange={(e) =>
                        setTempProfile({
                          ...tempProfile,
                          closeTime: e.target.value,
                        })
                      }
                      className="w-full bg-slate-800/50 border border-slate-600/50 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </Field>
                </div>

                <div>
                  <p className="text-slate-400 text-xs font-medium mb-2">
                    Working Days
                  </p>
                  {editingHours ? (
                    <div className="flex gap-2 flex-wrap">
                      {DAYS.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                            tempProfile.workingDays.includes(day)
                              ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-400 scale-105"
                              : "bg-slate-800/50 border-slate-700/40 text-slate-500 hover:border-slate-600"
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      {DAYS.map((day) => (
                        <span
                          key={day}
                          className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                            profile.workingDays.includes(day)
                              ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-400"
                              : "bg-slate-800/30 border-slate-700/30 text-slate-600"
                          }`}
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {!editingHours && (
                  <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-xs">
                        Operating Hours
                      </span>
                      <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        Open
                      </span>
                    </div>
                    <p className="text-white text-base font-bold">
                      {profile.openTime} — {profile.closeTime}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      {profile.workingDays.length === 7
                        ? "Open all week"
                        : `${profile.workingDays.length} days a week`}
                    </p>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* ── Receipt Settings ── */}
            <SectionCard
              title="Receipt Settings"
              subtitle="Customize what appears on customer bills"
              icon={FiPrinter}
              iconColor="bg-orange-500/10 text-orange-400"
            >
              <div className="flex items-center justify-between mb-5">
                <p className="text-slate-500 text-xs">Receipt customization</p>
                <EditActions
                  editing={editingReceipt}
                  onEdit={() => startEdit("receipt")}
                  onSave={() => saveSection("receipt")}
                  onCancel={() => cancelEdit("receipt")}
                />
              </div>
              <div className="space-y-4">
                <Field
                  label="Club Name on Receipt"
                  value={profile.receiptClubName}
                  editing={editingReceipt}
                >
                  <Input
                    value={tempProfile.receiptClubName}
                    onChange={(v) =>
                      setTempProfile({ ...tempProfile, receiptClubName: v })
                    }
                    placeholder={profile.club_name}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Phone on Receipt"
                    value={profile.receiptPhone}
                    editing={editingReceipt}
                  >
                    <Input
                      value={tempProfile.receiptPhone}
                      onChange={(v) =>
                        setTempProfile({ ...tempProfile, receiptPhone: v })
                      }
                      placeholder={profile.phone}
                      icon={FiPhone}
                    />
                  </Field>
                  <Field
                    label="Address on Receipt"
                    value={profile.receiptAddress}
                    editing={editingReceipt}
                  >
                    <Input
                      value={tempProfile.receiptAddress}
                      onChange={(v) =>
                        setTempProfile({ ...tempProfile, receiptAddress: v })
                      }
                      placeholder={profile.location}
                      icon={FiMapPin}
                    />
                  </Field>
                </div>

                <Field
                  label="Thank You Message"
                  value={profile.receiptMessage}
                  editing={editingReceipt}
                >
                  {editingReceipt && (
                    <textarea
                      value={tempProfile.receiptMessage}
                      onChange={(e) =>
                        setTempProfile({
                          ...tempProfile,
                          receiptMessage: e.target.value,
                        })
                      }
                      rows={2}
                      placeholder="شکریہ! Thank you for visiting!"
                      className="w-full bg-slate-800/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                  )}
                </Field>

                {!editingReceipt && (
                  <div className="bg-white rounded-xl p-5 border-2 border-dashed border-slate-300 shadow-lg">
                    <div className="text-center space-y-2">
                      <p className="text-slate-900 text-base font-bold">
                        {profile.receiptClubName || profile.club_name}
                      </p>
                      <p className="text-slate-600 text-xs">
                        {profile.receiptPhone || profile.phone}
                      </p>
                      <p className="text-slate-600 text-xs">
                        {profile.receiptAddress || profile.location}
                      </p>
                      <div className="border-t border-slate-300 my-3" />
                      <div className="space-y-1">
                        <p className="text-slate-700 text-xs">
                          Table: 3 • Duration: 1:30:00
                        </p>
                        <p className="text-slate-700 text-xs">Game: Per Hour</p>
                        <p className="text-emerald-600 text-sm font-bold">
                          Total: Rs. 300
                        </p>
                      </div>
                      <div className="border-t border-slate-300 my-3" />
                      <p className="text-slate-600 text-xs italic">
                        {profile.receiptMessage}
                      </p>
                      <p className="text-slate-500 text-[10px] mt-2">
                        {new Date().toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* ── Change Password ── */}
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden lg:col-span-2">
              <div className="px-6 py-4 border-b border-slate-700/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                    <FiLock className="text-lg" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">
                      Security & Password
                    </h3>
                    <p className="text-slate-500 text-xs">
                      Keep your account secure with a strong password
                    </p>
                  </div>
                </div>
                {!editingPassword && (
                  <button
                    onClick={() => setEditingPassword(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/40 rounded-lg transition-all"
                  >
                    <FiEdit2 className="text-xs" /> Change Password
                  </button>
                )}
              </div>

              {editingPassword ? (
                <div className="p-6">
                  {passwordError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
                      <FiAlertCircle className="text-red-400 text-sm shrink-0 mt-0.5" />
                      <p className="text-red-400 text-sm">{passwordError}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                    {[
                      {
                        label: "Current Password",
                        key: "current",
                        show: showPasswords.current,
                        toggleKey: "current",
                      },
                      {
                        label: "New Password",
                        key: "newPass",
                        show: showPasswords.new,
                        toggleKey: "new",
                      },
                      {
                        label: "Confirm New Password",
                        key: "confirm",
                        show: showPasswords.confirm,
                        toggleKey: "confirm",
                      },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="text-slate-400 text-xs font-medium block mb-1.5">
                          {field.label}
                        </label>
                        <div className="relative">
                          <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                          <input
                            type={field.show ? "text" : "password"}
                            value={
                              passwords[field.key as keyof typeof passwords]
                            }
                            onChange={(e) =>
                              setPasswords({
                                ...passwords,
                                [field.key]: e.target.value,
                              })
                            }
                            placeholder="••••••••"
                            className="w-full bg-slate-800/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords({
                                ...showPasswords,
                                [field.toggleKey]: !field.show,
                              })
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                          >
                            {field.show ? (
                              <FiEyeOff className="text-sm" />
                            ) : (
                              <FiEye className="text-sm" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 mb-4 flex items-start gap-2">
                    <FiInfo className="text-blue-400 text-sm shrink-0 mt-0.5" />
                    <p className="text-blue-400 text-xs">
                      Password must be at least 6 characters long. Use a mix of
                      letters and numbers for better security.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setEditingPassword(false);
                        setPasswordError("");
                        setPasswords({
                          current: "",
                          newPass: "",
                          confirm: "",
                        });
                      }}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePasswordSave}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                      <FiCheck /> Update Password
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">
                      Password last changed
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">Never</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                    <FiLock className="text-xs" />
                    Secured
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
