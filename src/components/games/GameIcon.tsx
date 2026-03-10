"use client";

// ================================================================
// GAME ICON — Custom SVG ball icons for each game type
// Each icon shows actual colored snooker balls arranged visually
// ================================================================

interface GameIconProps {
  icon: string;
  color: string;
  size?: number;
}

// ── Ball color map ───────────────────────────────────────────────
const BALL_COLORS: Record<string, string> = {
  red: "#e53e3e",
  yellow: "#d69e2e",
  green: "#38a169",
  brown: "#92400e",
  blue: "#3182ce",
  pink: "#d53f8c",
  black: "#1a202c",
  white: "#f7fafc",
};

// ── Single snooker ball SVG ──────────────────────────────────────
function Ball({
  cx,
  cy,
  r = 7,
  color,
}: {
  cx: number;
  cy: number;
  r?: number;
  color: string;
}) {
  const fill = BALL_COLORS[color] ?? color;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      {/* shine */}
      <circle
        cx={cx - r * 0.25}
        cy={cy - r * 0.25}
        r={r * 0.3}
        fill="rgba(255,255,255,0.35)"
      />
    </g>
  );
}

// ── Clock icon for Per Hour ──────────────────────────────────────
function ClockIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle
        cx="20"
        cy="20"
        r="17"
        fill="#3b82f6"
        opacity="0.15"
        stroke="#3b82f6"
        strokeWidth="1.5"
      />
      <circle cx="20" cy="20" r="2" fill="#3b82f6" />
      {/* hour hand */}
      <line
        x1="20"
        y1="20"
        x2="20"
        y2="9"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* minute hand */}
      <line
        x1="20"
        y1="20"
        x2="28"
        y2="20"
        stroke="#3b82f6"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Full frame icon ──────────────────────────────────────────────
function FullFrameIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {/* triangle rack of 6 balls */}
      <Ball cx={20} cy={10} r={6} color="red" />
      <Ball cx={15} cy={19} r={6} color="yellow" />
      <Ball cx={25} cy={19} r={6} color="green" />
      <Ball cx={10} cy={28} r={6} color="brown" />
      <Ball cx={20} cy={28} r={6} color="blue" />
      <Ball cx={30} cy={28} r={6} color="pink" />
    </svg>
  );
}

// ── N-ball icons ─────────────────────────────────────────────────
const BALL_CONFIGS: Record<
  string,
  { color: string; cx: number; cy: number }[]
> = {
  "1ball": [{ color: "red", cx: 20, cy: 20 }],
  "2ball": [
    { color: "red", cx: 14, cy: 20 },
    { color: "yellow", cx: 26, cy: 20 },
  ],
  "3ball": [
    { color: "red", cx: 20, cy: 12 },
    { color: "yellow", cx: 13, cy: 26 },
    { color: "green", cx: 27, cy: 26 },
  ],
  "4ball": [
    { color: "red", cx: 13, cy: 13 },
    { color: "yellow", cx: 27, cy: 13 },
    { color: "green", cx: 13, cy: 27 },
    { color: "brown", cx: 27, cy: 27 },
  ],
  "5ball": [
    { color: "red", cx: 20, cy: 10 },
    { color: "yellow", cx: 11, cy: 20 },
    { color: "green", cx: 29, cy: 20 },
    { color: "brown", cx: 14, cy: 30 },
    { color: "blue", cx: 26, cy: 30 },
  ],
  "6ball": [
    { color: "red", cx: 20, cy: 9 },
    { color: "yellow", cx: 13, cy: 20 },
    { color: "green", cx: 27, cy: 20 },
    { color: "brown", cx: 10, cy: 30 },
    { color: "blue", cx: 20, cy: 30 },
    { color: "pink", cx: 30, cy: 30 },
  ],
};

export default function GameIcon({ icon, color, size = 40 }: GameIconProps) {
  if (icon === "clock") return <ClockIcon size={size} />;
  if (icon === "fullframe") return <FullFrameIcon size={size} />;

  const balls = BALL_CONFIGS[icon];
  if (!balls) {
    // Fallback — colored circle
    return (
      <svg width={size} height={size} viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="16" fill={color} opacity="0.2" />
        <circle cx="20" cy="20" r="10" fill={color} opacity="0.6" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {balls.map((b, i) => (
        <Ball key={i} cx={b.cx} cy={b.cy} r={7} color={b.color} />
      ))}
    </svg>
  );
}
