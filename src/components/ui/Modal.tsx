"use client";

// ================================================================
// MODAL — Reusable modal wrapper
// Usage:
//   <Modal open={open} onClose={onClose} title="Add Player" size="md">
//     ... content ...
//   </Modal>
// ================================================================

import { useEffect } from "react";
import { FiX } from "react-icons/fi";

type ModalSize = "sm" | "md" | "lg" | "xl";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  children,
  footer,
}: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll when modal open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content w-full ${SIZE_CLASSES[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────────── */}
        <div className="flex items-start justify-between p-5 border-b border-theme">
          <div>
            <h2 className="text-theme-primary font-bold text-base">{title}</h2>
            {subtitle && (
              <p className="text-theme-muted text-xs mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="
              p-1.5 rounded-lg ml-3 shrink-0
              text-theme-muted hover:text-theme-primary
              hover:bg-theme-secondary
              transition-all duration-200
            "
          >
            <FiX className="text-base" />
          </button>
        </div>

        {/* ── Body ────────────────────────────────────── */}
        <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>

        {/* ── Footer (optional) ───────────────────────── */}
        {footer && <div className="px-5 pb-5 pt-1">{footer}</div>}
      </div>
    </div>
  );
}
