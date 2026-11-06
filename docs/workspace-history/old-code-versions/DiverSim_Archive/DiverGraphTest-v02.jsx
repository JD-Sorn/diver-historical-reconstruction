// DiverGraphTest-v02.jsx
// Isolated architectural test for DEF-027. This file rasterises the non-WORK
// profile vectors from DIVER.BAS [6310–6320] onto the Compucolor 160×192 plot
// grid. It does not use the rectangle approximation or any handoff
// compensation from DiverSim.

import { useState } from "react";

const W = 480;
const H = 400;
const PLOT_COLS = 160;
const PLOT_ROWS = 192;
const PLOT_CELL_W = W / PLOT_COLS;
const PLOT_CELL_H = H / PLOT_ROWS;

const plotCellX = value => value * PLOT_CELL_W;
const plotCellY = value => H - (value + 1) * PLOT_CELL_H;
const plotCentreX = value => plotCellX(value) + PLOT_CELL_W / 2;
const plotCentreY = value => plotCellY(value) + PLOT_CELL_H / 2;

const ACTIVITY = {
  DESCEND: 1,
  ASCEND: 2,
};

const PRESETS = {
  descend30: {
    label: "DESCEND 0 m → 30 m",
    activities: [
      { type: ACTIVITY.DESCEND, name: "DESCEND", targetDepth: 30, rate: 30 },
    ],
  },
  ascend30: {
    label: "ASCEND 30 m → 0 m",
    startDepth: 30,
    activities: [
      { type: ACTIVITY.ASCEND, name: "ASCEND", targetDepth: 0, rate: 15 },
    ],
  },
  downUp30: {
    label: "DESCEND 0 m → 30 m → ASCEND 0 m",
    activities: [
      { type: ACTIVITY.DESCEND, name: "DESCEND", targetDepth: 30, rate: 30 },
      { type: ACTIVITY.ASCEND, name: "ASCEND", targetDepth: 0, rate: 15 },
    ],
  },
  descend16: {
    label: "DESCEND 0 m → 16 m",
    activities: [
      { type: ACTIVITY.DESCEND, name: "DESCEND", targetDepth: 16, rate: 30 },
    ],
  },
};

function runSourceProfile(preset, { tk, xs, ys }) {
  let BASIC_CL = 0;
  let BASIC_AD = preset.startDepth ?? 0;
  let BASIC_LM = -Infinity;
  const vectors = [];
  const activities = [];

  preset.activities.forEach((activity, activityIndex) => {
    const startVectorIndex = vectors.length;
    const startTime = BASIC_CL;
    const startDepth = BASIC_AD;
    let guard = 0;

    do {
      if (guard++ > 2000) throw new Error("Profile test exceeded its tick guard.");

      // [1465] AA=CL:BB=AD — save the pre-tick position.
      const BASIC_AA = BASIC_CL;
      const BASIC_BB = BASIC_AD;

      // This laboratory advances one source interval before GOSUB 6300.
      BASIC_CL += tk;

      if (activity.type === ACTIVITY.DESCEND) {
        BASIC_AD = Math.min(BASIC_AD + activity.rate * tk, activity.targetDepth);
      } else {
        BASIC_AD = Math.max(BASIC_AD - activity.rate * tk, activity.targetDepth);
      }

      // [6310] LP=INT(AA*XS)+10:LQ=INT(CL*XS)+10
      const BASIC_LP = Math.floor(BASIC_AA * xs) + 10;
      const BASIC_LQ = Math.floor(BASIC_CL * xs) + 10;

      // [6313] MP=140-INT(BB*YS):MQ=140-INT(AD*YS)
      const BASIC_MP = 140 - Math.floor(BASIC_BB * ys);
      const BASIC_MQ = 140 - Math.floor(BASIC_AD * ys);

      // [6314–6317] Preserve LM and direction gating before [6320].
      const movesRight = BASIC_LQ >= BASIC_LM;
      if (movesRight) BASIC_LM = BASIC_LQ;
      const wrongDirection =
        (activity.type === ACTIVITY.DESCEND && BASIC_MQ > BASIC_MP) ||
        (activity.type === ACTIVITY.ASCEND && BASIC_MP > BASIC_MQ);

      if (movesRight && !wrongDirection) {
        // [6320] PLOT 6,32,29,2,253,LP,MP,242,LQ,MQ,255
        vectors.push({
          activityIndex,
          activityName: activity.name,
          tick: guard,
          LP: BASIC_LP,
          MP: BASIC_MP,
          LQ: BASIC_LQ,
          MQ: BASIC_MQ,
        });
      }
    } while (Math.abs(BASIC_AD - activity.targetDepth) > 1e-9);

    activities.push({
      name: activity.name,
      startTime,
      endTime: BASIC_CL,
      startDepth,
      endDepth: BASIC_AD,
      firstVector: startVectorIndex,
      vectorCount: vectors.length - startVectorIndex,
    });
  });

  return { vectors, activities };
}

// Rasterise the terminal's best-straight-line fit as inclusive plot blocks.
// Including both endpoints preserves the shared block between successive
// [6320] calls; full-sized blocks physically meet on the 160×192 raster.
function rasteriseVector(vector) {
  let x = vector.LP;
  let y = vector.MP;
  const targetX = vector.LQ;
  const targetY = vector.MQ;
  const dx = Math.abs(targetX - x);
  const sx = x < targetX ? 1 : -1;
  const dy = -Math.abs(targetY - y);
  const sy = y < targetY ? 1 : -1;
  let error = dx + dy;
  const cells = [];

  while (true) {
    cells.push({ x, y });
    if (x === targetX && y === targetY) break;
    const twiceError = 2 * error;
    if (twiceError >= dy) {
      error += dy;
      x += sx;
    }
    if (twiceError <= dx) {
      error += dx;
      y += sy;
    }
  }

  return cells;
}

function EndpointMarker({ x, y, colour, label }) {
  return (
    <g>
      <circle cx={plotCentreX(x)} cy={plotCentreY(y)} r={4} fill={colour} />
      <text x={plotCentreX(x) + 6} y={plotCentreY(y) - 6} fill={colour} fontSize={11}>
        {label} ({x},{y})
      </text>
    </g>
  );
}

export default function DiverGraphTestV02() {
  const [presetKey, setPresetKey] = useState("downUp30");
  const [tk, setTk] = useState(0.25);
  const [xs, setXs] = useState(2);
  const [ys, setYs] = useState(2);
  const [showMarkers, setShowMarkers] = useState(false);

  const preset = PRESETS[presetKey];
  const result = runSourceProfile(preset, { tk, xs, ys });
  const rasterVectors = result.vectors.map(vector => ({
    ...vector,
    cells: rasteriseVector(vector),
  }));
  const first = result.vectors[0];
  const last = result.vectors[result.vectors.length - 1];

  return (
    <main style={{ background: "#111", color: "#ddd", minHeight: "100vh", padding: 18, fontFamily: "sans-serif" }}>
      <h1 style={{ marginTop: 0, fontSize: 22 }}>DIVER graph test v02 — DEF-027</h1>
      <p style={{ maxWidth: 850 }}>
        BASIC [6310–6320] vectors rasterised as inclusive Compucolor plot
        blocks. No remembered columns, partial-ASCEND adjustment or added joins.
      </p>

      <section style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
        <label>
          Sequence{" "}
          <select value={presetKey} onChange={event => setPresetKey(event.target.value)}>
            {Object.entries(PRESETS).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
        </label>
        <label>TK <input type="number" step="0.25" min="0.25" value={tk} onChange={event => Number(event.target.value) > 0 && setTk(Number(event.target.value))} /></label>
        <label>XS <input type="number" step="0.5" min="0.5" value={xs} onChange={event => Number(event.target.value) > 0 && setXs(Number(event.target.value))} /></label>
        <label>YS <input type="number" step="0.25" min="0.25" value={ys} onChange={event => Number(event.target.value) > 0 && setYs(Number(event.target.value))} /></label>
        <label><input type="checkbox" checked={showMarkers} onChange={event => setShowMarkers(event.target.checked)} /> Show endpoint markers</label>
      </section>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", maxWidth: 960, background: "#00c8b8" }} shapeRendering="crispEdges">
        {Array.from({ length: 17 }, (_, i) => i * 10).map(x => (
          <line key={`gx-${x}`} x1={plotCellX(x)} y1={0} x2={plotCellX(x)} y2={H} stroke="#44d8cd" strokeWidth={0.5} />
        ))}
        {Array.from({ length: 13 }, (_, i) => 40 + i * 10).map(y => (
          <line key={`gy-${y}`} x1={0} y1={plotCellY(y)} x2={W} y2={plotCellY(y)} stroke="#44d8cd" strokeWidth={0.5} />
        ))}

        {/* [6320] Each source vector is an inclusive chain of raster blocks. */}
        {rasterVectors.flatMap((vector, vectorIndex) =>
          vector.cells.map((cell, cellIndex) => (
            <rect
              key={`${vectorIndex}-${cellIndex}`}
              x={plotCellX(cell.x)}
              y={plotCellY(cell.y)}
              width={PLOT_CELL_W}
              height={PLOT_CELL_H}
              fill="#050505"
            />
          ))
        )}

        {showMarkers && first && <EndpointMarker x={first.LP} y={first.MP} colour="#fff" label="start" />}
        {showMarkers && last && <EndpointMarker x={last.LQ} y={last.MQ} colour="#f33" label="finish" />}
        {showMarkers && result.activities.slice(0, -1).map((activity, index) => {
          const vector = result.vectors[activity.firstVector + activity.vectorCount - 1];
          return vector ? <EndpointMarker key={index} x={vector.LQ} y={vector.MQ} colour="#ff0" label={`${activity.name} end`} /> : null;
        })}
      </svg>

      <h2 style={{ fontSize: 17 }}>Source-coordinate summary</h2>
      <table style={{ borderCollapse: "collapse" }}>
        <thead><tr><th>Activity</th><th>Time</th><th>Depth</th><th>Vectors</th><th>Raster blocks</th><th>First LP,MP</th><th>Last LQ,MQ</th></tr></thead>
        <tbody>
          {result.activities.map((activity, index) => {
            const activityVectors = result.vectors.slice(activity.firstVector, activity.firstVector + activity.vectorCount);
            const activityRasterVectors = rasterVectors.slice(activity.firstVector, activity.firstVector + activity.vectorCount);
            const activityFirst = activityVectors[0];
            const activityLast = activityVectors[activityVectors.length - 1];
            return (
              <tr key={index}>
                <td>{activity.name}</td>
                <td>{activity.startTime.toFixed(2)} → {activity.endTime.toFixed(2)}</td>
                <td>{activity.startDepth.toFixed(2)} → {activity.endDepth.toFixed(2)}</td>
                <td>{activity.vectorCount}</td>
                <td>{activityRasterVectors.reduce((total, vector) => total + vector.cells.length, 0)}</td>
                <td>{activityFirst ? `${activityFirst.LP},${activityFirst.MP}` : "—"}</td>
                <td>{activityLast ? `${activityLast.LQ},${activityLast.MQ}` : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <style>{`
        th, td { border: 1px solid #666; padding: 5px 8px; text-align: left; }
        input { width: 68px; }
      `}</style>
    </main>
  );
}
