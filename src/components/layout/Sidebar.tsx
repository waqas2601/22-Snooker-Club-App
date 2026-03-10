"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import {
  FiHome,
  FiUsers,
  FiDollarSign,
  FiSettings,
  FiLogOut,
  FiSquare,
  FiTarget,
  FiSun,
  FiMoon,
  FiMapPin,
  FiWifi,
} from "react-icons/fi";
import { GiPoolTriangle } from "react-icons/gi";
import type { ClubUser } from "@/types";

// ── Nav links ────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Dashboard", icon: FiHome, href: "/dashboard" },
  { label: "Tables", icon: FiSquare, href: "/tables" },
  { label: "Players", icon: FiUsers, href: "/members" },
  { label: "Payments", icon: FiDollarSign, href: "/payments" },
  { label: "Games", icon: FiTarget, href: "/games" },
  { label: "Profile", icon: FiSettings, href: "/profile" },
];

interface SidebarProps {
  user: ClubUser;
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function Sidebar({
  user,
  open,
  onClose,
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      {/* ── Mobile overlay ───────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* ── Sidebar panel ────────────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 z-30 flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto
          ${open ? "translate-x-0" : "-translate-x-full"}
          bg-sidebar border-r border-sidebar
        `}
      >
        {/* ── Logo ─────────────────────────────────────── */}
        <div className="px-5 pt-5 pb-4 border-b border-sidebar">
          <div className="flex items-center gap-3">
            <div
              className="
              w-10 h-10 rounded-xl flex items-center justify-center shrink-0
              bg-gradient-to-br from-blue-500 to-blue-700
              shadow-lg shadow-blue-500/25
            "
            >
              <GiPoolTriangle className="text-white text-lg" />
            </div>
            <div>
              <p className="text-theme-primary font-bold text-sm leading-tight">
                Snooker Manager
              </p>
              <p className="text-blue-500 text-[10px] font-semibold tracking-widest uppercase mt-0.5">
                Pro Edition
              </p>
            </div>
          </div>
        </div>

        {/* ── Club info card ───────────────────────────── */}
        <div className="px-4 py-3 border-b border-sidebar">
          <div
            className="
            relative rounded-xl p-3 overflow-hidden
            bg-gradient-to-br from-blue-500/10 to-blue-600/5
            border border-blue-500/20
          "
          >
            {/* Live dot */}
            <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>

            <p className="text-theme-primary text-sm font-bold truncate pr-5">
              {user.club_name}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1 text-theme-secondary text-[10px]">
                <FiMapPin className="text-[9px]" />
                {user.location}
              </span>
              <span className="text-theme-muted text-[10px]">•</span>
              <span className="flex items-center gap-1 text-theme-secondary text-[10px]">
                <FiSquare className="text-[9px]" />
                {user.tables} Tables
              </span>
            </div>
          </div>
        </div>

        {/* ── Navigation ───────────────────────────────── */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="text-theme-muted text-[10px] font-semibold uppercase tracking-widest px-3 mb-3 mt-1">
            Navigation
          </p>
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/dashboard" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={onClose}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-blue-500/15 text-blue-500 border border-blue-500/25 shadow-sm"
                      : "text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary"
                  }
                `}
              >
                {/* Icon */}
                <link.icon
                  className={`
                  text-base shrink-0 transition-transform duration-200
                  group-hover:scale-110
                  ${isActive ? "text-blue-500" : ""}
                `}
                />

                {/* Label */}
                <span className="flex-1">{link.label}</span>

                {/* Active indicator */}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom section ───────────────────────────── */}
        <div className="p-3 border-t border-sidebar space-y-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-sm font-medium transition-all duration-200
              text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary
              border border-transparent hover:border-theme
            "
          >
            {isDark ? (
              <>
                <FiSun className="text-base text-yellow-400 shrink-0" />
                <span className="flex-1 text-left">Light Mode</span>
                <span className="text-[10px] text-theme-muted bg-theme-secondary px-1.5 py-0.5 rounded-full">
                  OFF
                </span>
              </>
            ) : (
              <>
                <FiMoon className="text-base text-blue-400 shrink-0" />
                <span className="flex-1 text-left">Dark Mode</span>
                <span className="text-[10px] text-theme-muted bg-theme-secondary px-1.5 py-0.5 rounded-full">
                  OFF
                </span>
              </>
            )}
          </button>

          {/* User card with logout */}
          <div
            className="
            flex items-center gap-2.5 px-3 py-2.5 rounded-xl
            bg-theme-secondary border border-theme
          "
          >
            {/* Avatar */}
            <div
              className="
              w-8 h-8 rounded-full flex items-center justify-center
              bg-gradient-to-br from-blue-500 to-blue-700
              text-white text-xs font-bold shrink-0
            "
            >
              {user.owner_name.charAt(0).toUpperCase()}
            </div>

            {/* Name + email */}
            <div className="flex-1 min-w-0">
              <p className="text-theme-primary text-xs font-semibold truncate">
                {user.owner_name}
              </p>
              <p className="text-theme-muted text-[10px] truncate">
                {user.email}
              </p>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              title="Logout"
              className="
                p-1.5 rounded-lg shrink-0 transition-all duration-200
                text-theme-muted hover:text-red-500
                hover:bg-red-500/10
              "
            >
              <FiLogOut className="text-sm" />
            </button>
          </div>

          {/* System status */}
          <div className="flex items-center justify-center gap-2 py-1">
            <FiWifi className="text-emerald-500 text-[10px]" />
            <span className="text-emerald-500 text-[10px] font-medium">
              System Online
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
