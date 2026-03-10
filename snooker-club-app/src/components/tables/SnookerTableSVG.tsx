"use client";

// ================================================================
// SNOOKER TABLE SVG — Realistic top-down illustration
// Shows: felt, cushions, pockets, baulk line, D, spot dots
// Red tint + pulse ring when occupied
// ================================================================

interface SnookerTableSVGProps {
  occupied: boolean;
  tableName: string;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: { w: 140, h: 90 },
  md: { w: 180, h: 115 },
  lg: { w: 220, h: 140 },
};

export default function SnookerTableSVG({
  occupied,
  tableName,
  size = "md",
}: SnookerTableSVGProps) {
  const { w, h } = SIZES[size];

  // ── Layout constants ─────────────────────────────────────────
  const cushion = w * 0.055;
  const pocket = w * 0.052;
  const feltX = cushion + pocket * 0.5;
  const feltY = cushion + pocket * 0.5;
  const feltW = w - (cushion + pocket * 0.5) * 2;
  const feltH = h - (cushion + pocket * 0.5) * 2;
  const cx = w / 2;
  const cy = h / 2;

  // Baulk line — 1/5 from left
  const baulkX = feltX + feltW * 0.22;
  // D semicircle radius
  const dRadius = feltH * 0.28;

  // ── Colors ───────────────────────────────────────────────────
  const feltColor = occupied ? "#2d4a2d" : "#1a4731";
  const feltOverlay = occupied ? "rgba(180,30,30,0.12)" : "transparent";
  const cushionColor = occupied ? "#1a3318" : "#0f2d1e";
  const frameColor = occupied ? "#3d1a0a" : "#2d1a0a";
  const pocketColor = "#050a05";

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      className="drop-shadow-lg"
    >
      {/* ── Outer wooden frame ──────────────────────────────── */}
      <rect
        x={1}
        y={1}
        width={w - 2}
        height={h - 2}
        rx={w * 0.04}
        fill={frameColor}
        stroke="#5a3010"
        strokeWidth="1.5"
      />

      {/* ── Cushion layer ────────────────────────────────────── */}
      <rect
        x={pocket * 0.4}
        y={pocket * 0.4}
        width={w - pocket * 0.8}
        height={h - pocket * 0.8}
        rx={w * 0.033}
        fill={cushionColor}
      />

      {/* ── Felt surface ─────────────────────────────────────── */}
      <rect x={feltX} y={feltY} width={feltW} height={feltH} fill={feltColor} />

      {/* Felt texture lines */}
      {Array.from({ length: 6 }).map((_, i) => (
        <line
          key={i}
          x1={feltX}
          y1={feltY + (feltH / 6) * (i + 0.5)}
          x2={feltX + feltW}
          y2={feltY + (feltH / 6) * (i + 0.5)}
          stroke="rgba(255,255,255,0.025)"
          strokeWidth="0.8"
        />
      ))}

      {/* Occupied red overlay */}
      {occupied && (
        <rect
          x={feltX}
          y={feltY}
          width={feltW}
          height={feltH}
          fill={feltOverlay}
        />
      )}

      {/* ── Baulk line ───────────────────────────────────────── */}
      <line
        x1={baulkX}
        y1={feltY + 2}
        x2={baulkX}
        y2={feltY + feltH - 2}
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="0.8"
      />

      {/* ── D semicircle ─────────────────────────────────────── */}
      <path
        d={`
          M ${baulkX} ${cy - dRadius}
          A ${dRadius} ${dRadius} 0 0 0 ${baulkX} ${cy + dRadius}
        `}
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="0.8"
        fill="none"
      />

      {/* ── Spot dots ────────────────────────────────────────── */}
      {/* Brown spot */}
      <circle cx={baulkX} cy={cy} r={1.2} fill="rgba(255,255,255,0.4)" />
      {/* Blue spot — center */}
      <circle cx={cx} cy={cy} r={1.2} fill="rgba(255,255,255,0.4)" />
      {/* Pink spot */}
      <circle
        cx={feltX + feltW * 0.72}
        cy={cy}
        r={1.2}
        fill="rgba(255,255,255,0.4)"
      />
      {/* Black spot */}
      <circle
        cx={feltX + feltW * 0.88}
        cy={cy}
        r={1.2}
        fill="rgba(255,255,255,0.4)"
      />

      {/* ── Corner pockets ───────────────────────────────────── */}
      {[
        [feltX - 1, feltY - 1],
        [feltX + feltW + 1, feltY - 1],
        [feltX - 1, feltY + feltH + 1],
        [feltX + feltW + 1, feltY + feltH + 1],
      ].map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={pocket} fill={pocketColor} />
      ))}

      {/* ── Middle pockets ───────────────────────────────────── */}
      {[
        [cx, feltY - cushion * 0.2],
        [cx, feltY + feltH + cushion * 0.2],
      ].map(([px, py], i) => (
        <ellipse
          key={i}
          cx={px}
          cy={py}
          rx={pocket * 0.85}
          ry={pocket * 0.7}
          fill={pocketColor}
        />
      ))}

      {/* ── Table name on felt ───────────────────────────────── */}
      <text
        x={cx}
        y={cy + (occupied ? 0 : 0)}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(255,255,255,0.5)"
        fontSize={Math.max(7, w * 0.055)}
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.5"
      >
        {tableName}
      </text>

      {/* ── Occupied indicator ───────────────────────────────── */}
      {occupied && (
        <>
          {/* Glowing dot top-right */}
          <circle
            cx={feltX + feltW - 6}
            cy={feltY + 6}
            r={3.5}
            fill="#ef4444"
            opacity="0.9"
          />
          <circle
            cx={feltX + feltW - 6}
            cy={feltY + 6}
            r={3.5}
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            opacity="0.4"
          >
            <animate
              attributeName="r"
              values="3.5;7;3.5"
              dur="1.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.4;0;0.4"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        </>
      )}
    </svg>
  );
}
