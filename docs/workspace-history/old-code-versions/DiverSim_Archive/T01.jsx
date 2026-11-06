// DiverSim.jsx
// DIVER.BAS JSX port — verified to line 1010
// See TestPlan.md T01, CoordinateSystem.md

import { useState } from "react";

// ── Screen constants ──────────────────────────────────────────
const W = 512;
const H = 400;

// ── Colours (CCI byte sources in CoordinateSystem.md) ────────
const BLUE = "#0033AA";   // CCI background colour, byte 39

// ── Component ─────────────────────────────────────────────────
export default function DiverSim() {
  return (
    <svg width={W} height={H} style={{ display: "block" }}>

      {/* Line 1010 — PLOT 6,39,12 */}
      <rect x={0} y={0} width={W} height={H} fill={BLUE} />

    </svg>
  );
}