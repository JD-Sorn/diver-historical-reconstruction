import { useState } from "react";

// DIVER.BAS — ID=21 bar behaviour experiment
// Shows the ID=21 bar as drawn by GOSUB 6600 / GOSUB 7000 (line 7200)
// VA = (AD - INT(AD)) * 10 — fractional part of AD scaled 0–9
// Adjust AD slider to observe bar behaviour.
// Position is approximate — placed in lower DM area per emulator observation
// (emulator row 27, well below text rows at row 6).
// Purpose of ID=21 is NOT confirmed — shown here for investigation only.

const W = 512, H = 400;

// Inherited geometry
const SURF_Y = 100;
const TAXIS_Y = 295;
const LR_X = 120;
const RR_X = 471;
const RULE_TOP = 103;
const RULE_BOT = 292;
const DM_X = 427;
const DM_W = 77;
const DM_H = 84;
const DM_Y = SURF_Y - DM_H;
const DM_COLS = 12;
const DM_CW = DM_W / DM_COLS;
const DM_CH = DM_H / 6;

const dY = m => SURF_Y + (m / 50) * (TAXIS_Y - SURF_Y);
const DEPTHS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
const TICK_N = 8;
const TICK_START = 26;
const TICK_END = 447;

const C = {
  blue:   "#0033AA",
  cyan:   "#00C8B8",
  white:  "#DDDDDD",
  black:  "#050505",
  dmBox:  "#050A1E",
  green:  "#00CC00",
  red:    "#CC0000",
  dark:   "#080818",
};

// Text row (NOSTOP + depth) — upper DM
const TEXT_X  = DM_X + DM_CW * 3;
const ROW1_Y  = DM_Y + DM_CH * 1.2;
const NOSTOP  = "NOSTOP";

// ID=21 bar geometry — below NOSTOP row, 2 text rows gap, same x as NOSTOP
// 10 blocks tall per BASIC FOR I=1 TO 10 at line 7200
const BAR21_X      = DM_X + DM_CW * 3;    // same x as NOSTOP start
const BAR21_W      = DM_CW * 3 - 1;       // 3 cols wide
const BAR21_TOTAL  = 10;
const BAR21_TOP    = ROW1_Y + DM_CH * 2.5;  // 35px gap — fits 2 large-char rows
const BAR21_H      = DM_CH * 2.5;         // enough height for 10 blocks
const BAR21_BLOCK  = BAR21_H / BAR21_TOTAL;

export default function DiverExperiment_ID21() {
  // AD as a float 0.0–49.9 in 0.1 steps (actual depth, metres)
  // Range confirmed: WD validated >0 and <50 at line 1281
  const [adTenths, setAdTenths] = useState(0);
  const AD = adTenths / 10;

  // GOSUB 6600 calculations
  const va21 = Math.round((AD - Math.floor(AD)) * 10);  // fractional part × 10
  const tensVal = Math.floor(Math.floor(AD) / 10);
  const tensChr = tensVal === 0 ? " " : String(tensVal);  // leading zero suppressed
  const unitsChr = String(Math.floor(AD) % 10);

  return (
    <div style={{
      fontFamily: "monospace",
      maxWidth: "900px",
      margin: "0 auto",
      padding: "10px",
      background: "#06060F",
      minHeight: "100vh",
      color: "#CCC",
    }}>

      {/* AD slider control */}
      <div style={{
        display: "flex", gap: "12px", alignItems: "center",
        margin: "0 0 8px",
        color: C.cyan, fontSize: "11px",
      }}>
        <span>AD (depth):</span>
        <input
          type="range" min={0} max={499} step={1}
          value={adTenths}
          onChange={e => setAdTenths(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span style={{ minWidth: "40px" }}>{AD.toFixed(1)}m</span>
        <span style={{ color: "#666" }}>
          VA={va21} ({va21}/10 blocks filled)
        </span>
      </div>

      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{
          display: "block",
          border: "3px solid #333",
          borderRadius: "6px",
          background: "#0D0D0D",
        }}
      >
        {/* Inherited screen state */}
        <rect x={0} y={0} width={W} height={H} fill={C.blue} />
        <rect x={0} y={0} width={W} height={SURF_Y} fill={C.cyan} />
        <rect x={LR_X} y={RULE_TOP} width={8} height={RULE_BOT - RULE_TOP} fill={C.white} />
        <rect x={RR_X} y={RULE_TOP} width={8} height={RULE_BOT - RULE_TOP} fill={C.white} />
        <rect x={DM_X} y={DM_Y} width={DM_W} height={DM_H} fill={C.dmBox} />
        {"5 METRE UNITS".split("").map((ch, i) => (
          <text key={i} x={14} y={SURF_Y + 20 + i * 9}
            fill={C.cyan} fontSize={9} fontFamily="monospace" textAnchor="start">{ch}</text>
        ))}
        {DEPTHS.map(m => (
          <rect key={m} x={0} y={dY(m) - 2} width={7} height={4} fill={C.cyan} />
        ))}
        <rect x={0} y={0} width={195} height={16} fill={C.cyan} />
        {"WORKING DEPTH 40".split("").map((ch, i) => (
          <text key={i} x={3 + i * 6} y={12}
            fill={C.black} fontSize={9} fontFamily="monospace">{ch}</text>
        ))}
        {Array.from({ length: TICK_N }, (_, k) => {
          const x = TICK_START + k * ((TICK_END - TICK_START) / (TICK_N - 1));
          return <rect key={k} x={x - 2} y={TAXIS_Y + 8} width={4} height={7} fill={C.cyan} />;
        })}
        {"TIME AT 10 MINUTE INTERVALS".split("").map((ch, i) => (
          <text key={i} x={216 + i * 6} y={TAXIS_Y + 30}
            fill={C.cyan} fontSize={9} fontFamily="monospace">{ch}</text>
        ))}

        {/* DM content */}

        {/* NOSTOP string — green, top row */}
        {NOSTOP.split("").map((ch, i) => (
          <text key={i}
            x={TEXT_X + i * DM_CW} y={ROW1_Y}
            fill={C.green} fontSize={8} fontFamily="monospace" fontWeight="bold">
            {ch}
          </text>
        ))}

        {/* Row 2 placeholder — IDs 7–12 (decompression content, TBC) */}
        {"ROW2TEXT".split("").map((ch, i) => (
          <text key={i}
            x={TEXT_X + i * DM_CW} y={ROW1_Y + DM_CH}
            fill="#446644" fontSize={8} fontFamily="monospace" fontWeight="bold">
            {ch}
          </text>
        ))}

        {/* Row 3 placeholder — IDs 13–18 (decompression content, TBC) */}
        {"ROW3TEXT".split("").map((ch, i) => (
          <text key={i}
            x={TEXT_X + i * DM_CW} y={ROW1_Y + DM_CH * 2}
            fill="#446644" fontSize={8} fontFamily="monospace" fontWeight="bold">
            {ch}
          </text>
        ))}

        {/* Depth digits — red, IDs 19–20 */}
        <text x={DM_X + DM_CW * 10} y={ROW1_Y}
          fill={C.red} fontSize={8} fontFamily="monospace" fontWeight="bold">
          {tensChr}
        </text>
        <text x={DM_X + DM_CW * 11} y={ROW1_Y}
          fill={C.red} fontSize={8} fontFamily="monospace" fontWeight="bold">
          {unitsChr}
        </text>

        {/* ID=21 bar — below NOSTOP, 2 text rows gap, 10 blocks tall
            Cleared blocks (dark), then red filled from top.
            Purpose unconfirmed — shown for investigation only */}
        {Array.from({ length: BAR21_TOTAL }, (_, i) => (
          <rect
            key={i}
            x={BAR21_X}
            y={BAR21_TOP + i * BAR21_BLOCK}
            width={BAR21_W}
            height={BAR21_BLOCK - 1}
            fill={C.dark}
          />
        ))}
        {Array.from({ length: va21 }, (_, i) => (
          <rect
            key={i}
            x={BAR21_X}
            y={BAR21_TOP + i * BAR21_BLOCK}
            width={BAR21_W}
            height={BAR21_BLOCK - 1}
            fill={C.red}
          />
        ))}

        {/* Label — purpose unconfirmed */}
        <text
          x={DM_X + DM_W + 4} y={BAR21_TOP + BAR21_H / 2}
          fill="#444" fontSize={8} fontFamily="monospace"
        >
          ID=21 (purpose TBC)
        </text>

      </svg>

      {/* Info panel */}
      <div style={{
        background: "#08081A", border: "1px solid #1E1E3A",
        borderRadius: "6px", padding: "10px", marginTop: "8px",
        fontSize: "11px", color: "#AAAAAA", lineHeight: "1.75",
      }}>
        <div style={{ color: "#CCCC00", fontWeight: "bold", marginBottom: "6px" }}>
          GOSUB 6600 state at AD={AD.toFixed(1)}m
        </div>
        <div>ID=19: VA={tensVal===0?32:tensVal+48} → '{tensChr}' (tens digit{tensVal===0?' — leading zero suppressed':''})</div>
        <div>ID=20: VA={Math.floor(AD)%10+48} → '{unitsChr}' (units digit) — red</div>
        <div>ID=21: VA={(AD - Math.floor(AD)).toFixed(1)}×10 = {va21} → {va21} blocks filled of 10 — red</div>
        <div style={{ marginTop: "6px", color: "#666" }}>
          Purpose of ID=21 bar not confirmed from photographic evidence.
          Shown here for investigation only.
        </div>
      </div>
    </div>
  );
}
