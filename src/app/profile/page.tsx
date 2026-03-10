"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FiSettings,
  FiPhone,
  FiMapPin,
  FiEdit2,
  FiCalendar,
  FiClock,
  FiSave,
  FiX,
} from "react-icons/fi";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { useMenuToggle } from "@/components/layout/AppShell";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { getStoredUser } from "@/lib/storage/auth.storage";
import type { ClubUser, ClubProfile, WorkingDay } from "@/types";

// ── Default working days ─────────────────────────────────────────
const DEFAULT_DAYS: WorkingDay[] = [
  { day: "Monday", enabled: true },
  { day: "Tuesday", enabled: true },
  { day: "Wednesday", enabled: true },
  { day: "Thursday", enabled: true },
  { day: "Friday", enabled: true },
  { day: "Saturday", enabled: true },
  { day: "Sunday", enabled: false },
];

// ================================================================
// INNER PAGE
// ================================================================
function ProfilePageInner({ user }: { user: ClubUser }) {
  const toggleMenu = useMenuToggle();

  const [profile, setProfile] = useState<ClubProfile>({
    club_name: user.club_name,
    owner_name: user.owner_name,
    phone: "",
    city: user.location,
    address: "",
    established: "",
    open_time: "10:00",
    close_time: "23:00",
    working_days: DEFAULT_DAYS,
    receipt_name: user.club_name,
    receipt_phone: "",
    receipt_message: "Thank you for visiting!",
  });

  // Section edit states
  const [editClub, setEditClub] = useState(false);
  const [editHours, setEditHours] = useState(false);
  const [editReceipt, setEditReceipt] = useState(false);
  const [editPassword, setEditPassword] = useState(false);

  // Password fields
  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confPass, setConfPass] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Save profile handler (for now, only updates local state)
  const saveSection = (section: "club" | "hours" | "receipt") => {
    if (section === "club") setEditClub(false);
    else if (section === "hours") setEditHours(false);
    else if (section === "receipt") setEditReceipt(false);
    // In Phase 2 you'd PUT to /api/profile
  };

  // Password change handler
  const handleChangePassword = () => {
    // Phase 2: call API to update password if valid
    setEditPassword(false);
    setCurPass("");
    setNewPass("");
    setConfPass("");
    setShowPass(false);
  };

  // Section inputs
  const inputProps = {
    className: "input-theme",
  };

  return (
    <>
      <PageHeader
        title="Profile"
        subtitle="Club settings & receipt customization"
        onMenuClick={toggleMenu}
      />

      <div className="flex-1 p-4 lg:p-6 space-y-6">
        {/* ── Club Information ─────────────────────────── */}
        <div className="card-theme p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-theme-primary font-bold text-sm flex items-center gap-2">
              <FiSettings className="text-blue-500" />
              Club Information
            </h2>
            <button
              onClick={() => setEditClub((v) => !v)}
              className="p-2 rounded-lg text-theme-muted hover:text-blue-500 transition-colors duration-200"
              title={editClub ? "Cancel" : "Edit"}
            >
              {editClub ? <FiX /> : <FiEdit2 />}
            </button>
          </div>
          {editClub ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-theme-secondary mb-1.5">
                  Club Name
                </label>
                <input
                  {...inputProps}
                  value={profile.club_name}
                  onChange={(e) =>
                    setProfile({ ...profile, club_name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-theme-secondary mb-1.5">
                  Owner Name
                </label>
                <input
                  {...inputProps}
                  value={profile.owner_name}
                  onChange={(e) =>
                    setProfile({ ...profile, owner_name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-theme-secondary mb-1.5">
                  Phone
                </label>
                <input
                  {...inputProps}
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-theme-secondary mb-1.5">
                  City
                </label>
                <input
                  {...inputProps}
                  value={profile.city}
                  onChange={(e) =>
                    setProfile({ ...profile, city: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-theme-secondary mb-1.5">
                  Address
                </label>
                <input
                  {...inputProps}
                  value={profile.address}
                  onChange={(e) =>
                    setProfile({ ...profile, address: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-theme-secondary mb-1.5">
                  Established Year
                </label>
                <input
                  {...inputProps}
                  value={profile.established}
                  onChange={(e) =>
                    setProfile({ ...profile, established: e.target.value })
                  }
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <FiMapPin className="text-theme-muted" />
                <span className="text-theme-primary font-bold">
                  {profile.club_name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="text-theme-muted" />
                <span className="text-theme-primary">
                  {profile.phone || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-theme-secondary">Owner</span>
                <p className="text-theme-primary font-semibold">
                  {profile.owner_name}
                </p>
              </div>
              <div>
                <span className="text-theme-secondary">City</span>
                <p className="text-theme-primary">{profile.city}</p>
              </div>
              <div>
                <span className="text-theme-secondary">Address</span>
                <p className="text-theme-primary">{profile.address || "N/A"}</p>
              </div>
              <div>
                <span className="text-theme-secondary">Established</span>
                <p className="text-theme-primary">
                  {profile.established || "N/A"}
                </p>
              </div>
            </div>
          )}
          {editClub && (
            <button
              onClick={() => saveSection("club")}
              className="mt-5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200"
            >
              <FiSave className="inline mr-2" />
              Save Changes
            </button>
          )}
        </div>

        {/* ── Working Hours ─────────────────────────────── */}
        <div className="card-theme p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-theme-primary font-bold text-sm flex items-center gap-2">
              <FiClock className="text-orange-500" />
              Working Hours
            </h2>
            <button
              onClick={() => setEditHours((v) => !v)}
              className="p-2 rounded-lg text-theme-muted hover:text-orange-500 transition-colors duration-200"
              title={editHours ? "Cancel" : "Edit"}
            >
              {editHours ? <FiX /> : <FiEdit2 />}
            </button>
          </div>
          {editHours ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-theme-secondary mb-1.5">
                  Open Time
                </label>
                <input
                  {...inputProps}
                  type="time"
                  value={profile.open_time}
                  onChange={(e) =>
                    setProfile({ ...profile, open_time: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-theme-secondary mb-1.5">
                  Close Time
                </label>
                <input
                  {...inputProps}
                  type="time"
                  value={profile.close_time}
                  onChange={(e) =>
                    setProfile({ ...profile, close_time: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-theme-secondary mb-2">
                  Working Days
                </label>
                <div className="flex gap-2">
                  {profile.working_days.map((d, i) => (
                    <button
                      key={d.day}
                      onClick={() =>
                        setProfile({
                          ...profile,
                          working_days: profile.working_days.map((dw, idx) =>
                            idx === i ? { ...dw, enabled: !dw.enabled } : dw,
                          ),
                        })
                      }
                      className={`
                        px-3 py-1.5 rounded-xl text-xs font-medium border
                        transition-all duration-200
                        ${
                          d.enabled
                            ? "bg-emerald-500/15 border-emerald-500 text-emerald-700"
                            : "bg-theme-secondary border-theme text-theme-muted"
                        }
                      `}
                    >
                      {d.day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-theme-secondary">Open</span>
                <p className="text-theme-primary">{profile.open_time}</p>
              </div>
              <div>
                <span className="text-theme-secondary">Close</span>
                <p className="text-theme-primary">{profile.close_time}</p>
              </div>
              <div>
                <span className="text-theme-secondary">Working Days</span>
                <div className="flex gap-2 flex-wrap mt-1">
                  {profile.working_days
                    .filter((d) => d.enabled)
                    .map((d) => (
                      <Badge
                        key={d.day}
                        label={d.day}
                        variant="emerald"
                        small
                      />
                    ))}
                </div>
              </div>
            </div>
          )}
          {editHours && (
            <button
              onClick={() => saveSection("hours")}
              className="mt-5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold shadow-lg shadow-orange-500/20 transition-all duration-200"
            >
              <FiSave className="inline mr-2" />
              Save Changes
            </button>
          )}
        </div>

        {/* ── Receipt Settings ─────────────────────────── */}
        <div className="card-theme p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-theme-primary font-bold text-sm flex items-center gap-2">
              <FiCalendar className="text-purple-500" />
              Receipt Settings
            </h2>
            <button
              onClick={() => setEditReceipt((v) => !v)}
              className="p-2 rounded-lg text-theme-muted hover:text-purple-500 transition-colors duration-200"
              title={editReceipt ? "Cancel" : "Edit"}
            >
              {editReceipt ? <FiX /> : <FiEdit2 />}
            </button>
          </div>
          {editReceipt ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-theme-secondary mb-1.5">
                  Receipt Name
                </label>
                <input
                  {...inputProps}
                  value={profile.receipt_name}
                  onChange={(e) =>
                    setProfile({ ...profile, receipt_name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-theme-secondary mb-1.5">
                  Receipt Phone
                </label>
                <input
                  {...inputProps}
                  value={profile.receipt_phone}
                  onChange={(e) =>
                    setProfile({ ...profile, receipt_phone: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-theme-secondary mb-2">
                  Thank you message
                </label>
                <input
                  {...inputProps}
                  value={profile.receipt_message}
                  onChange={(e) =>
                    setProfile({ ...profile, receipt_message: e.target.value })
                  }
                />
              </div>
              {/* Live preview */}
              <div className="col-span-2 mt-4">
                <p className="text-theme-muted text-xs mb-2">
                  Live receipt preview:
                </p>
                <div className="rounded-xl border border-theme bg-theme-secondary p-4">
                  <div className="text-theme-primary text-base font-bold">
                    {profile.receipt_name}
                  </div>
                  <div className="text-theme-muted text-xs">
                    {profile.receipt_phone}
                  </div>
                  <div className="mt-3 text-theme-primary text-sm font-medium">
                    {profile.receipt_message}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-theme-secondary">Receipt Name</span>
                <p className="text-theme-primary">{profile.receipt_name}</p>
              </div>
              <div>
                <span className="text-theme-secondary">Receipt Phone</span>
                <p className="text-theme-primary">
                  {profile.receipt_phone || "N/A"}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-theme-secondary">Thank you message</span>
                <p className="text-theme-primary">{profile.receipt_message}</p>
              </div>
              {/* Live preview */}
              <div className="col-span-2 mt-4">
                <p className="text-theme-muted text-xs mb-2">
                  Live receipt preview:
                </p>
                <div className="rounded-xl border border-theme bg-theme-secondary p-4">
                  <div className="text-theme-primary text-base font-bold">
                    {profile.receipt_name}
                  </div>
                  <div className="text-theme-muted text-xs">
                    {profile.receipt_phone}
                  </div>
                  <div className="mt-3 text-theme-primary text-sm font-medium">
                    {profile.receipt_message}
                  </div>
                </div>
              </div>
            </div>
          )}
          {editReceipt && (
            <button
              onClick={() => saveSection("receipt")}
              className="mt-5 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-semibold shadow-lg shadow-purple-500/20 transition-all duration-200"
            >
              <FiSave className="inline mr-2" />
              Save Changes
            </button>
          )}
        </div>

        {/* ── Change Password ───────────────────────────── */}
        <div className="card-theme p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-theme-primary font-bold text-sm flex items-center gap-2">
              <FiSettings className="text-red-500" />
              Change Password
            </h2>
            <button
              onClick={() => setEditPassword((v) => !v)}
              className="p-2 rounded-lg text-theme-muted hover:text-red-500 transition-colors duration-200"
              title={editPassword ? "Cancel" : "Edit"}
            >
              {editPassword ? <FiX /> : <FiEdit2 />}
            </button>
          </div>
          {editPassword ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-theme-secondary mb-1.5">
                  Current Password
                </label>
                <input
                  {...inputProps}
                  type={showPass ? "text" : "password"}
                  value={curPass}
                  onChange={(e) => setCurPass(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-theme-secondary mb-1.5">
                  New Password
                </label>
                <input
                  {...inputProps}
                  type={showPass ? "text" : "password"}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-theme-secondary mb-1.5">
                  Confirm New Password
                </label>
                <input
                  {...inputProps}
                  type={showPass ? "text" : "password"}
                  value={confPass}
                  onChange={(e) => setConfPass(e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2 text-xs text-theme-secondary">
                  <input
                    type="checkbox"
                    checked={showPass}
                    onChange={() => setShowPass((v) => !v)}
                  />
                  Show passwords
                </label>
              </div>
            </div>
          ) : (
            <p className="text-theme-muted text-xs">
              Change your password for club account access.
            </p>
          )}
          {editPassword && (
            <button
              onClick={handleChangePassword}
              className="mt-5 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold shadow-lg shadow-red-500/20 transition-all duration-200"
            >
              <FiSave className="inline mr-2" />
              Change Password
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ================================================================
// MAIN EXPORT
// ================================================================
export default function ProfilePage() {
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
      <ProfilePageInner user={user} />
    </AppShell>
  );
}
