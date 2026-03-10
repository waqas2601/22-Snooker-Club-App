"use client";

import { FiMenu } from "react-icons/fi";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  actions?: React.ReactNode; // buttons on the right side
  statusPill?: React.ReactNode; // optional colored pill (e.g. "3 Active")
}

export default function PageHeader({
  title,
  subtitle,
  onMenuClick,
  actions,
  statusPill,
}: PageHeaderProps) {
  return (
    <header
      className="
      sticky top-0 z-10 px-4 lg:px-6
      bg-header backdrop-blur-xl
      border-b border-theme
    "
    >
      <div className="flex items-center justify-between h-14">
        {/* ── Left: menu button + title ───────────────── */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={onMenuClick}
            className="
              lg:hidden p-2 rounded-lg transition-all duration-200
              text-theme-secondary hover:text-theme-primary
              hover:bg-theme-secondary
            "
          >
            <FiMenu className="text-lg" />
          </button>

          {/* Divider — desktop only */}
          <div className="hidden lg:block w-px h-5 bg-theme-border opacity-60" />

          {/* Title */}
          <div>
            <h1 className="text-theme-primary font-bold text-base leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-theme-muted text-[11px] leading-tight mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* ── Right: status pill + action buttons ─────── */}
        <div className="flex items-center gap-2">
          {statusPill}
          {actions}
        </div>
      </div>
    </header>
  );
}
