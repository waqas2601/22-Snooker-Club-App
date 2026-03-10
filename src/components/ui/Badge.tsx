// ================================================================
// BADGE — Small status pills used throughout the app
// ================================================================

type BadgeVariant =
  | "blue"
  | "emerald"
  | "orange"
  | "red"
  | "purple"
  | "slate"
  | "yellow";

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
  dot?: boolean; // show a dot before label
  small?: boolean; // smaller size
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  blue: "bg-blue-500/10    text-blue-500    border-blue-500/20",
  emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  orange: "bg-orange-500/10  text-orange-500  border-orange-500/20",
  red: "bg-red-500/10     text-red-500     border-red-500/20",
  purple: "bg-purple-500/10  text-purple-500  border-purple-500/20",
  slate: "bg-slate-500/10   text-slate-500   border-slate-500/20",
  yellow: "bg-yellow-500/10  text-yellow-500  border-yellow-500/20",
};

const DOT_CLASSES: Record<BadgeVariant, string> = {
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
  slate: "bg-slate-500",
  yellow: "bg-yellow-500",
};

export default function Badge({ label, variant, dot, small }: BadgeProps) {
  return (
    <span
      className={`
      inline-flex items-center gap-1.5 font-medium rounded-full border
      ${small ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"}
      ${VARIANT_CLASSES[variant]}
    `}
    >
      {dot && (
        <span
          className={`
          rounded-full shrink-0
          ${small ? "w-1 h-1" : "w-1.5 h-1.5"}
          ${DOT_CLASSES[variant]}
        `}
        />
      )}
      {label}
    </span>
  );
}
