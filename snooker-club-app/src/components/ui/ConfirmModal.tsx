"use client";

// ================================================================
// CONFIRM MODAL — Simple yes/no confirmation dialog
// Usage:
//   <ConfirmModal
//     open={open}
//     onClose={() => setOpen(false)}
//     onConfirm={handleDelete}
//     title="Delete Table?"
//     message="This action cannot be undone."
//     confirmLabel="Delete"
//     variant="danger"
//   />
// ================================================================

import Modal from "./Modal";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary";
}

const CONFIRM_STYLES = {
  danger: "bg-red-500 hover:bg-red-600 shadow-red-500/25",
  warning: "bg-orange-500 hover:bg-orange-600 shadow-orange-500/25",
  primary: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/25",
};

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-theme-secondary text-sm leading-relaxed">{message}</p>

      <div className="flex items-center gap-3 mt-6">
        {/* Cancel */}
        <button
          onClick={onClose}
          className="
            flex-1 py-2.5 rounded-xl text-sm font-semibold
            text-theme-primary bg-theme-secondary
            border border-theme hover:border-theme-hover
            transition-all duration-200
          "
        >
          {cancelLabel}
        </button>

        {/* Confirm */}
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`
            flex-1 py-2.5 rounded-xl text-sm font-semibold
            text-white shadow-lg transition-all duration-200
            hover:-translate-y-0.5 active:translate-y-0
            ${CONFIRM_STYLES[variant]}
          `}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
