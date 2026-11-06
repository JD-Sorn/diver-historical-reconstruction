// DiverGraphTest-v12.jsx
// Complete-vertical-stroke experiment for DEF-027. Every non-WORK movement
// retains its source-derived vertical length, but the complete stroke occupies
// one display column; LP→LQ time progress is never drawn through its body.

import { useState } from "react";

const W = 480;
const H = 400;
const PLOT_COLS = 160;
const PLOT_ROWS = 192;
const PLOT_CELL_W = W / PLOT_COLS;
const PLOT_CELL_H = H / PLOT_ROWS;
// A Compucolor plot block occupies its complete raster cell. Any visible
// profile separation must therefore come from the vector raster itself, not
// from an artificial inset applied to every rendered block.
const STROKE_W = PLOT_CELL_W;

const plotCellX = value => value * PLOT_CELL_W;
const plotCellY = value => H - (value + 1) * PLOT_CELL_H;
const plotCentreX = value => plotCellX(value) + PLOT_CELL_W / 2;
const plotCentreY = value => plotCellY(value) + PLOT_CELL_H / 2;

const ACTIVITY = {
  DESCEND: 1,
  ASCEND: 2,
  WORK: 3,
  DECOMPRESS: 4,
  REST: 5,
};

const CCI = {
  16: "#050505", 17: "#ff3333", 18: "#00cc00", 19: "#cccc00",
  20: "#0033aa", 21: "#cc00cc", 22: "#00c8b8", 23: "#dddddd",
};

// [140–700] Source palette and decompression table, retained as 1-based data.
const BASIC_C = [null, 20, 23, 18, 22, 19, 17, 16];
const BASIC_DT = [
  null,
  [null,232,431,999,999,999,999,999], [null,137,140,159,179,201,229,270],
  [null,96,98,106,116,125,134,144], [null,72,73,81,88,94,99,105],
  [null,57,59,66,71,76,80,84], [null,46,49,55,60,63,67,70],
  [null,38,42,47,51,55,58,999], [null,32,37,41,45,48,51,999],
  [null,27,32,37,40,43,45,999], [null,23,29,33,36,39,41,999],
  [null,20,25,30,33,35,37,999], [null,18,23,27,30,32,34,999],
  [null,16,21,25,28,30,31,999], [null,14,20,23,26,27,29,999],
  [null,12,18,21,24,26,27,999], [null,11,17,20,22,24,25,999],
  [null,10,16,19,21,22,24,999], [null,9,15,18,20,21,999,999],
  [null,8,14,17,18,20,999,999], [null,8,13,16,17,999,999,999],
  [null,7,12,15,17,999,999,999],
];

const PRESETS = {
  photo40Work20: {
    label: "DESCEND 40 m → WORK BT20 → ASCEND 0 m",
    activities: [
      { type: ACTIVITY.DESCEND, name: "DESCEND", targetDepth: 40, rate: 30 },
      { type: ACTIVITY.WORK, name: "WORK", duration: 20 },
      { type: ACTIVITY.ASCEND, name: "ASCEND", targetDepth: 0, rate: 15 },
    ],
  },
  photo40Work20Decompress: {
    label: "DESCEND 40 m → WORK BT20 → ASCEND 5 m → DECOMPRESS 5 min",
    activities: [
      { type: ACTIVITY.DESCEND, name: "DESCEND", targetDepth: 40, rate: 30 },
      { type: ACTIVITY.WORK, name: "WORK", duration: 20 },
      { type: ACTIVITY.ASCEND, name: "ASCEND", targetDepth: 5, rate: 15 },
      { type: ACTIVITY.DECOMPRESS, name: "DECOMPRESS", duration: 5 },
    ],
  },
  ascendRest: {
    label: "ASCEND 30 m → 0 m → REST 2 min",
    startDepth: 30,
    activities: [
      { type: ACTIVITY.ASCEND, name: "ASCEND", targetDepth: 0, rate: 15 },
      { type: ACTIVITY.REST, name: "REST", duration: 2 },
    ],
  },
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
  downUp40: {
    label: "DESCEND 0 m → 40 m → ASCEND 0 m",
    activities: [
      { type: ACTIVITY.DESCEND, name: "DESCEND", targetDepth: 40, rate: 30 },
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

function buildWorkColumn(BASIC_X3, BASIC_Y3, { tk, xs, ys }) {
  const BASIC_XX = (BASIC_X3 - 10) / xs - tk; // [6333]
  let BASIC_Y2 = 140;
  let BASIC_C_scalar = 1;
  let BASIC_L = 1;
  let BASIC_CO = 1;
  const bands = [];

  // [6350–6570] Locate and draw the seven possible DT band boundaries.
  for (let BASIC_J = 1; BASIC_J <= 7; BASIC_J++) {
    let BASIC_I = BASIC_L;
    for (; BASIC_I <= 21; BASIC_I++) {
      if (BASIC_DT[BASIC_I][BASIC_J] === 999 || BASIC_DT[BASIC_I][BASIC_J] < BASIC_XX) break;
    }
    if (BASIC_I > 21) BASIC_I = 21;

    let BASIC_Y1 = Math.floor(140 - (2 * BASIC_I + 8) * ys) + 2;
    if (BASIC_Y1 === 42) BASIC_Y1 = 40;
    if (BASIC_Y1 < 40) BASIC_Y1 = 40;

    if (!(BASIC_Y3 < BASIC_Y1 || BASIC_Y3 > BASIC_Y2)) BASIC_CO = BASIC_C_scalar;

    if (BASIC_C_scalar !== 1) {
      bands.push({
        x: BASIC_X3,
        y1: BASIC_Y1,
        y2: BASIC_Y2,
        colour: CCI[BASIC_C[BASIC_C_scalar]],
        band: BASIC_C_scalar,
      });
    }

    if (BASIC_Y1 === 40 || BASIC_C_scalar === 7 || BASIC_DT[BASIC_I][BASIC_J] === 999) break;
    BASIC_Y2 = BASIC_Y1 - 1;
    BASIC_C_scalar += 1;
    BASIC_L = BASIC_I;
  }

  return { x: BASIC_X3, y: BASIC_Y3, xx: BASIC_XX, inBand: BASIC_CO > 1, bands };
}

function runSourceProfile(preset, { tk, xs, ys }) {
  let BASIC_CL = 0;
  let BASIC_AD = preset.startDepth ?? 0;
  let BASIC_LM = -Infinity;
  const vectors = [];
  const workColumns = [];
  const activities = [];

  preset.activities.forEach((activity, activityIndex) => {
    const startVectorIndex = vectors.length;
    const startTime = BASIC_CL;
    const startDepth = BASIC_AD;
    let guard = 0;

    if (activity.type === ACTIVITY.WORK) {
      const startWorkColumnIndex = workColumns.length;
      const endTime = startTime + activity.duration;

      while (BASIC_CL < endTime - 1e-9) {
        if (guard++ > 2000) throw new Error("WORK test exceeded its tick guard.");
        const BASIC_AA = BASIC_CL;
        const BASIC_BB = BASIC_AD;
        BASIC_CL = Math.min(BASIC_CL + tk, endTime);
        const BASIC_LP = Math.floor(BASIC_AA * xs) + 10;
        const BASIC_LQ = Math.floor(BASIC_CL * xs) + 10;
        const BASIC_Y3 = Math.floor(140 - BASIC_BB * ys); // [6330]

        // [6331–6593] Only newly reached columns survive X3<=LM.
        for (let BASIC_X3 = BASIC_LP; BASIC_X3 <= BASIC_LQ; BASIC_X3++) {
          if (BASIC_X3 <= BASIC_LM) continue;
          BASIC_LM = BASIC_X3;
          workColumns.push(buildWorkColumn(BASIC_X3, BASIC_Y3, { tk, xs, ys }));
        }
      }

      activities.push({
        name: activity.name,
        startTime,
        endTime: BASIC_CL,
        startDepth,
        endDepth: BASIC_AD,
        firstVector: startVectorIndex,
        vectorCount: 0,
        firstWorkColumn: startWorkColumnIndex,
        workColumnCount: workColumns.length - startWorkColumnIndex,
      });
      return;
    }

    const isHold = activity.type === ACTIVITY.DECOMPRESS || activity.type === ACTIVITY.REST;
    const holdEndTime = isHold ? startTime + activity.duration : null;

    do {
      if (guard++ > 2000) throw new Error("Profile test exceeded its tick guard.");

      // [1465] AA=CL:BB=AD — save the pre-tick position.
      const BASIC_AA = BASIC_CL;
      const BASIC_BB = BASIC_AD;

      // This laboratory advances one source interval before GOSUB 6300.
      BASIC_CL += tk;

      if (activity.type === ACTIVITY.DESCEND) {
        BASIC_AD = Math.min(BASIC_AD + activity.rate * tk, activity.targetDepth);
      } else if (activity.type === ACTIVITY.ASCEND) {
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
    } while (isHold
      ? BASIC_CL < holdEndTime - 1e-9
      : Math.abs(BASIC_AD - activity.targetDepth) > 1e-9);

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

  return { vectors, workColumns, activities };
}

// Render the complete movement as one vertical stroke. Flat DECOMPRESS/REST
// calls contribute one point in each newly reached LQ column, producing their
// horizontal continuation without a synthetic line or corner.
function rasteriseSourceVector(vector, column) {
  const dy = vector.MQ - vector.MP;
  const intervals = Math.abs(dy);
  if (intervals === 0) return [{ x: column, y: vector.MQ }];

  const yStep = Math.sign(dy);
  return Array.from({ length: intervals }, (_, step) => {
    const sourceY = vector.MP + yStep * step;
    return { x: column, y: Math.min(sourceY, sourceY + yStep) };
  });
}

function rasteriseVerticalTick(vector, column) {
  const startY = Math.min(vector.MP, vector.MQ);
  const endY = Math.max(vector.MP, vector.MQ);
  if (startY === endY) return [{ x: column, y: startY }];
  return Array.from({ length: endY - startY }, (_, offset) => ({
    x: column,
    y: startY + offset,
  }));
}

function columnGroups(vectors, columnForVector) {
  const groups = new Map();
  vectors.forEach((vector, index) => {
    const column = columnForVector(vector, index);
    const tickName = `${activityCode(vector.activityName)}${vector.tick}`;
    if (!groups.has(column)) groups.set(column, []);
    groups.get(column).push(tickName);
  });
  return [...groups.entries()].map(([column, ticks]) => `${column}: ${ticks.join("+")}`).join("   ");
}

function activityCode(name) {
  return ({ DESCEND: "D", ASCEND: "A", DECOMPRESS: "DC", REST: "R" })[name] ?? name[0];
}

function rasterColumnGroups(rasterVectors) {
  const groups = new Map();
  rasterVectors.forEach(vector => {
    const tickName = `${activityCode(vector.activityName)}${vector.tick}`;
    new Set(vector.cells.map(cell => cell.x)).forEach(column => {
      if (!groups.has(column)) groups.set(column, []);
      groups.get(column).push(tickName);
    });
  });
  return [...groups.entries()].map(([column, names]) => `${column}: ${names.join("+")}`).join("  ");
}

// Established complete-stroke placement: DESCEND and flat activities occupy
// LQ; ASCEND uses the accepted next-column grouping. A genuinely shortened
// final ASCEND remains with its preceding stroke group.
function sourceStrokeColumns(vectors) {
  const columns = vectors.map(vector =>
    vector.activityName === "ASCEND" ? vector.LP + 1 : vector.LQ
  );

  const ascendIndices = vectors
    .map((vector, index) => vector.activityName === "ASCEND" ? index : -1)
    .filter(index => index >= 0);

  if (ascendIndices.length >= 2) {
    const finalIndex = ascendIndices[ascendIndices.length - 1];
    const precedingIndex = ascendIndices[ascendIndices.length - 2];
    const finalLength = Math.abs(vectors[finalIndex].MQ - vectors[finalIndex].MP);
    const precedingLength = Math.abs(vectors[precedingIndex].MQ - vectors[precedingIndex].MP);
    if (finalLength < precedingLength) columns[finalIndex] = columns[precedingIndex];
  }

  return columns;
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

function ProfilePanel({ title, columnForVector, vectors, workColumns, activities, showMarkers, sourceRaster = false }) {
  const sourceColumns = sourceStrokeColumns(vectors);
  const displayedColumn = (vector, index) =>
    sourceRaster ? sourceColumns[index] : columnForVector(vector, index);
  const rasterVectors = vectors.map((vector, index) => ({
    ...vector,
    cells: sourceRaster
      ? rasteriseSourceVector(vector, sourceColumns[index])
      : rasteriseVerticalTick(vector, columnForVector(vector, index)),
  }));
  const first = vectors[0];
  const last = vectors[vectors.length - 1];

  return (
    <section style={{ flex: "1 1 460px", maxWidth: 700 }}>
      <h2 style={{ fontSize: 17, margin: "4px 0 6px" }}>{title}</h2>
      <div style={{ fontFamily: "monospace", minHeight: 34, marginBottom: 5 }}>
        {sourceRaster ? rasterColumnGroups(rasterVectors) : columnGroups(vectors, columnForVector)}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", background: "#00c8b8" }} shapeRendering="crispEdges">
        {Array.from({ length: 17 }, (_, i) => i * 10).map(x => (
          <line key={`gx-${x}`} x1={plotCellX(x)} y1={0} x2={plotCellX(x)} y2={H} stroke="#44d8cd" strokeWidth={0.5} />
        ))}
        {Array.from({ length: 13 }, (_, i) => 40 + i * 10).map(y => (
          <line key={`gy-${y}`} x1={0} y1={plotCellY(y)} x2={W} y2={plotCellY(y)} stroke="#44d8cd" strokeWidth={0.5} />
        ))}

        {/* [6330–6570] Source-derived WORK coloured-band columns. */}
        {workColumns.flatMap((column, columnIndex) =>
          column.bands.map((band, bandIndex) => (
            <rect
              key={`band-${columnIndex}-${bandIndex}`}
              x={plotCellX(band.x)}
              y={plotCellY(Math.max(band.y1, band.y2))}
              width={PLOT_CELL_W}
              height={(Math.abs(band.y2 - band.y1) + 1) * PLOT_CELL_H}
              fill={band.colour}
            />
          ))
        )}

        {rasterVectors.flatMap((vector, vectorIndex) =>
          vector.cells.map((cell, cellIndex) => (
            <rect
              key={`${vectorIndex}-${cellIndex}`}
              x={plotCellX(cell.x)}
              y={plotCellY(cell.y)}
              width={STROKE_W}
              height={PLOT_CELL_H}
              fill="#050505"
            />
          ))
        )}

        {/* [6591] One black WORK-position point in every newly reached column. */}
        {workColumns.map((column, index) => (
          <rect
            key={`work-dot-${index}`}
            x={plotCellX(column.x)}
            y={plotCellY(column.y)}
            width={PLOT_CELL_W}
            height={PLOT_CELL_H}
            fill="#050505"
          />
        ))}

        {showMarkers && first && <EndpointMarker x={displayedColumn(first, 0)} y={first.MP} colour="#fff" label="start" />}
        {showMarkers && last && <EndpointMarker x={displayedColumn(last, vectors.length - 1)} y={last.MQ} colour="#f33" label="finish" />}
        {showMarkers && activities.slice(0, -1).filter(activity => activity.vectorCount > 0).map((activity, index) => {
          const vector = vectors[activity.firstVector + activity.vectorCount - 1];
          const vectorIndex = activity.firstVector + activity.vectorCount - 1;
          return vector ? <EndpointMarker key={index} x={displayedColumn(vector, vectorIndex)} y={vector.MQ} colour="#ff0" label={`${activity.name} end`} /> : null;
        })}
      </svg>
    </section>
  );
}

export default function DiverGraphTestV12() {
  const [presetKey, setPresetKey] = useState("photo40Work20Decompress");
  const [tk, setTk] = useState(0.25);
  const [xs, setXs] = useState(2);
  const [ys, setYs] = useState(2);
  const [showMarkers, setShowMarkers] = useState(false);

  const preset = PRESETS[presetKey];
  const result = runSourceProfile(preset, { tk, xs, ys });

  return (
    <main style={{ background: "#111", color: "#ddd", minHeight: "100vh", padding: 18, fontFamily: "sans-serif" }}>
      <h1 style={{ marginTop: 0, fontSize: 22 }}>DIVER graph test v12 — complete vertical strokes</h1>
      <p style={{ maxWidth: 850 }}>
        Every movement is drawn as one complete vertical stroke with its exact
        source-derived depth length. Time progression selects its display
        column but is not drawn diagonally through the stroke.
        The DECOMPRESS and REST durations are join tests, not claims about the
        exact activity schedule represented by the surviving photograph.
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

      <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
        <ProfilePanel title="v12: complete vertical strokes" columnForVector={vector => vector.LQ} vectors={result.vectors} workColumns={result.workColumns} activities={result.activities} showMarkers={showMarkers} sourceRaster />
        <ProfilePanel title="Control: put every vector wholly at LP" columnForVector={vector => vector.LP} vectors={result.vectors} workColumns={result.workColumns} activities={result.activities} showMarkers={showMarkers} />
        <ProfilePanel title="Control: put every vector wholly at LQ" columnForVector={vector => vector.LQ} vectors={result.vectors} workColumns={result.workColumns} activities={result.activities} showMarkers={showMarkers} />
      </div>

      <h2 style={{ fontSize: 17 }}>Source-coordinate summary</h2>
      <table style={{ borderCollapse: "collapse" }}>
        <thead><tr><th>Activity</th><th>Time</th><th>Depth</th><th>Vectors</th><th>WORK columns</th><th>Raster blocks</th><th>First LP,MP</th><th>Last LQ,MQ</th></tr></thead>
        <tbody>
          {result.activities.map((activity, index) => {
            const activityVectors = result.vectors.slice(activity.firstVector, activity.firstVector + activity.vectorCount);
            const activityFirst = activityVectors[0];
            const activityLast = activityVectors[activityVectors.length - 1];
            return (
              <tr key={index}>
                <td>{activity.name}</td>
                <td>{activity.startTime.toFixed(2)} → {activity.endTime.toFixed(2)}</td>
                <td>{activity.startDepth.toFixed(2)} → {activity.endDepth.toFixed(2)}</td>
                <td>{activity.vectorCount}</td>
                <td>{activity.workColumnCount ?? 0}</td>
                <td>{activityVectors.reduce((total, vector) => total + Math.max(1, Math.abs(vector.MQ - vector.MP)), 0)}</td>
                <td>{activityFirst ? `${activityFirst.LP},${activityFirst.MP}` : "—"}</td>
                <td>{activityLast ? `${activityLast.LQ},${activityLast.MQ}` : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2 style={{ fontSize: 17 }}>WORK-column summary</h2>
      <p style={{ fontFamily: "monospace" }}>
        {result.workColumns.length > 0
          ? `X3 ${result.workColumns[0].x}→${result.workColumns[result.workColumns.length - 1].x}; XX ${result.workColumns[0].xx.toFixed(2)}→${result.workColumns[result.workColumns.length - 1].xx.toFixed(2)}; ${result.workColumns.reduce((total, column) => total + column.bands.length, 0)} coloured bars.`
          : "No WORK columns in this sequence."}
      </p>

      <h2 style={{ fontSize: 17 }}>Tick-by-tick source coordinates</h2>
      <table style={{ borderCollapse: "collapse" }}>
        <thead><tr><th>Activity tick</th><th>LP</th><th>LQ</th><th>Raster columns</th><th>MP</th><th>MQ</th><th>Depth blocks</th></tr></thead>
        <tbody>
          {result.vectors.map((vector, index) => (
            <tr key={index}>
              <td>{vector.activityName} {vector.tick}</td>
              <td>{vector.LP}</td><td>{vector.LQ}</td><td>{sourceStrokeColumns(result.vectors)[index]}</td><td>{vector.MP}</td><td>{vector.MQ}</td>
              <td>{Math.max(1, Math.abs(vector.MQ - vector.MP))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <style>{`
        th, td { border: 1px solid #666; padding: 5px 8px; text-align: left; }
        input { width: 68px; }
      `}</style>
    </main>
  );
}
