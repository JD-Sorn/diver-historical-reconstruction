// DIVER SIMULATION MODEL
// BBC BASIC original by Dr George Mallen, BBC Micro, ~1979-1985
// As work carried out in collaboration with Dagfinn Aksnes for Dagfinn's
// Master's project. 
// I provided the need based on diving experience and discussions with the 
// RNPL AMTE in Portsmouth. Then I provided sketches of how the instrument 
// and tge graphic user interface would look and behave in discussion with George.
//
// React port against verified DIVER.bas source
//
// Key corrections from source:
//  - the primary change from the BASIC is that the 1/4 and 1/2 symbols are < and > respectively, 
//    both may or may not be followed by =
//  - GOSUB 6300 SUB COLOURED BANDS: draws DT table as accumulating coloured
//    graphic, one rectangle per frame — NOT colouring the profile line
//  - DT row 1 col2=431, row 17 col6=24
//  - WD validation: <=0 OR >=50 (line 1281)
//  - TK: REAL=1/32, ACCELERATED=0.25 (lines 1308/1309)
//  - XS: wd<17→0.5, wd>20→2.0, else 1 (lines 1330/1340)
//  - Line 5560: IF PA<=1 THEN 5590 (handwritten)
//  - Line 6190: workDepth<=20 AND L<1
//  - Line 6191: DX<>0
//  - Line 6320: PLOT...GOTO 6599 (solid rect then return, not per-pixel loop)
//
// Review fixes applied (2025):
//  FIX-1: WE persistent variable added (line 1349: WE=0, line 6185: WE=AL(AL,7))
//          subTestDecompBound now receives and updates WE via ref so J-bracket
//          search starts from correct work-end time on repeated work segments.
//  FIX-2: ASCEND loop getDTbracket now uses bt (frozen at work-end) not cl.
//          Matches BASIC line 6333: XX=(X3-10)/XS-TK which tracks BT not CL.
//  FIX-3: subStretchesWork J===-1 (out-of-range) now returns outOfRange:true
//          sentinel instead of silently falling back to J=0. Matches BASIC
//          line 5931: STOP REM ERROR O.R.
//  FIX-4: O(n²) path memory: path array stored once; DiveCanvas receives
//          pathPoints + pathLen instead of per-frame path copy.
//  FIX-5: Two-canvas split — background canvas (bands, gauge, labels) drawn
//          once on buildFrames; foreground canvas redrawn per frame tick only.
//  FIX-6: tX() XS parameter removed — it was accepted but silently discarded.
//          BBC coordinate mapping now consistent with drawBands mX() function.
//  FIX-7: DT row 1 col 7 annotated as 999.999 in source (line 300) — comment added.
//  FIX-8: executeDecoStops bt parameter documented as intentionally frozen.

import { useState, useEffect, useRef, useCallback } from "react";

// Share Tech Mono via Google Fonts — close match to BBC Micro character set
const BBCFONT = (size, bold=false) =>
  `${bold?"bold ":""}${size}px "Bedstead", "Bedstead", "Share Tech Mono", monospace`;

const ACTIVITIES = ["DESCEND","ASCEND","WORK","DECOMPRESS","REST"];

// BBC Micro colour palette — C(1..7) from line 150
// C(1)=20=blue, C(2)=23=white, C(3)=18=green, C(4)=22=cyan,
// C(5)=19=yellow, C(6)=17=red, C(7)=16=black
const BBC_PAL = {
  16:"#000000", 17:"#ff0000", 18:"#00ff00", 19:"#ffff00",
  20:"#0000cc", 21:"#ff00ff", 22:"#00ffff", 23:"#ffffff",
};
const C = [null,20,23,18,22,19,17,16]; // 1-indexed
function bandCol(idx){ return BBC_PAL[C[idx]] || "#888888"; }

// DT(1..21, 1..7) from lines 300-700. 999=out of range.
// Note: line 300 source reads "999,999,999,999.999" — last value is 999.999 ---- fixed
// but any value >=999 is treated as out-of-range so this is functionally identical.
const DT = [
  null,
  [232,431,999,999,999,999,999], //  1: 10m
  [137,140,159,179,201,229,270], //  2: 12m
  [ 96, 98,106,116,125,134,144], //  3: 14m
  [ 72, 73, 81, 88, 94, 99,105], //  4: 16m
  [ 57, 59, 66, 71, 76, 80, 84], //  5: 18m
  [ 46, 49, 55, 60, 63, 67, 70], //  6: 20m
  [ 38, 42, 47, 51, 55, 58,999], //  7: 22m
  [ 32, 37, 41, 45, 48, 51,999], //  8: 24m
  [ 27, 32, 37, 40, 43, 45,999], //  9: 26m
  [ 23, 29, 33, 36, 39, 41,999], // 10: 28m
  [ 20, 25, 30, 33, 35, 37,999], // 11: 30m
  [ 18, 23, 27, 30, 32, 34,999], // 12: 32m
  [ 16, 21, 25, 28, 30, 31,999], // 13: 34m
  [ 14, 20, 23, 26, 27, 29,999], // 14: 36m
  [ 12, 18, 21, 24, 26, 27,999], // 15: 38m
  [ 11, 17, 20, 22, 24, 25,999], // 16: 40m
  [ 10, 16, 19, 21, 22, 24,999], // 17: 42m — col6=24
  [  9, 15, 18, 20, 21,999,999], // 18: 44m
  [  8, 14, 17, 18, 20,999,999], // 19: 46m
  [  8, 13, 16, 17,999,999,999], // 20: 48m
  [  7, 12, 15, 17,999,999,999], // 21: 50m
];

function getDTrow(depth){
	
	// FIXED — matches BASIC INT((depth-8)/2), maps 10m→1, 12m→2, ... 40m→16:
	const i = Math.max(1, Math.min(21, Math.floor((depth - 8) / 2)));
	// Fixed — matches BASIC INT((depth-8)/2):
	// const i = Math.max(1, Math.min(21, Math.floor((depth - 8) / 2)));
	// const i = Math.max(1, Math.min(21, Math.round((depth - 7) / 2)));
	
  return { i, row: DT[i] };
}

// ---------------------------------------------------------------------------
// Given a bottom time and depth, return which DT column bracket (0-indexed)
// the diver is currently in. Returns -1 if out of range.
// Used by GOSUB 6300 to choose the band colour.
// First argument is bt (bottom time), NOT cl (clock time) — see FIX-2.
// ---------------------------------------------------------------------------
function getDTbracket(bt, depth){
  if(depth < 10) return 0;
  const { row } = getDTrow(depth);
  if(!row) return -1;
  // No band before the first column boundary — matches BASIC GOSUB 6300:
  // the graphic only starts painting when XX reaches DT(row,1).
  // e.g. at 40m DT[16][0]=11, so no colour until bt>=11 min.
  if(bt < row[0]) return -1;
  for(let j = 0; j < 7; j++){
    if(row[j] === 999) return -1;
    if(bt < row[j]) return j;
  }
  return -1; // exceeded all brackets
}

// ---------------------------------------------------------------------------
// SUB 5900 — STRETCHES WORK (lines 5900-5999)
// Returns { stops, pa, outOfRange }
// outOfRange:true maps to BASIC line 5931: STOP REM ERROR O.R. (FIX-3)
// ---------------------------------------------------------------------------
function subStretchesWork(cl, tt, workDepth, dx){
  if(workDepth < 10) return { stops:[], pa:0, outOfRange:false };
  const { row } = getDTrow(workDepth);
  if(!row) return { stops:[], pa:0, outOfRange:false };

  let J = -1;
  for(let j = 0; j < 7; j++){
    if(row[j] === 999) break;
    if(cl <= row[j]){ J = j; break; }     // line 5926: <=
  }
  // J===-1: cl exceeds all valid brackets — BASIC says STOP (line 5931). FIX-3.
  if(J === -1) return { stops:[], pa:0, outOfRange:true };

  const clAfter = cl + tt;
  let K = -1;
  for(let k = 0; k < 7; k++){
    if(row[k] === 999){ K = -1; break; }
    if(clAfter <= row[k]){ K = k; break; } // line 5950: <=
    if(k === 6) K = -1;
  }
  // K===-1: clAfter exceeds all valid brackets — BASIC sets PA=-1 (line 5970).
  if(K === -1){
    let lastValid = 0;
    for(let k = 0; k < 7; k++){
      if(row[k] === 999) break;
      lastValid = k;
    }
    K = lastValid;
  }

  if(J === K) return { stops:[], pa:1, outOfRange:false };   // line 5974: no new stops

  const numCrossed = K - J;
  const PA = numCrossed + 1;
  if(PA <= 1) return { stops:[], pa:PA, outOfRange:false };  // line 5560: handwritten <=

  const firstDepth = workDepth >= 20 ? 10 : 5;
  const firstDur = (firstDepth === 10) ? 5 : (clAfter - row[K > 0 ? K-1 : 0]);
  const lastDur  = row[J] - cl;

  const stops = [];
  if(numCrossed === 1){
    stops.push({ depth:firstDepth, duration:Math.max(1, Math.round(firstDur)) });
  } else {
    stops.push({ depth:firstDepth, duration:Math.max(1, Math.round(firstDur)) });
    for(let L = J+1; L <= K-1; L++)
      stops.push({ depth:5, duration:Math.max(1, Math.round(row[L] - row[L-1])) });
    stops.push({ depth:5, duration:Math.max(1, Math.round(lastDur)) });
  }
  return { stops, pa:PA, outOfRange:false };
}

// ---------------------------------------------------------------------------
// SUB 6100 — TESTS DECOMP BOUND (lines 6100-6199)
//
// FIX-1: weRef is a { current: number } ref tracking WE (line 1349: WE=0).
//   Line 6145 uses WE (not startClock) for the J search.
//   Line 6185: WE = AL(AL,7) = endClock — updated here before return.
// ---------------------------------------------------------------------------
function subTestDecompBound(weRef, endClock, workDepth){
  if(workDepth < 10) return { ht:0, dx:0, d5:0, stops:[], outOfRange:false };
  const { row } = getDTrow(workDepth);
  if(!row) return { ht:0, dx:0, d5:0, stops:[], outOfRange:false };

  const WE = weRef.current; // line 6145 uses WE, not startClock

  let J = -1;
  for(let j = 0; j < 7; j++){
    if(row[j] === 999) break;
    if(WE <= row[j]){ J = j; break; } // line 6145: <=  (uses WE)
  }
  if(J === -1) J = 6;

  let L = -1;
  for(let l = 0; l < 7; l++){
    if(row[l] === 999) break;
    if(endClock <= row[l]){ L = l; break; } // line 6175: <=
  }
  if(L === -1) L = 6;

  // Line 6185: WE = AL(AL,7) — update persistent WE to current work-end time
  weRef.current = endClock;

  let dx = 0, ht = 0;
  if(workDepth >= 20 && L > 1) dx = 5;  // line 6190: depth>=20 AND L>1 (BASIC 1-idx: L>1 means ≥2nd bracket)
  if(dx !== 0) ht = 10;                  // line 6191: DX<>0

  if(J === L) return { ht:0, dx:0, d5:0, stops:[], outOfRange:false };

  const d5 = (L - J) * 5;               // line 6194
  if(dx === 0) ht = 5;                   // line 6195

  const result = subStretchesWork(WE, endClock - WE, workDepth);
  if(result.outOfRange) return { ht, dx, d5, stops:[], outOfRange:true };
  return { ht, dx, d5, stops:result.stops, outOfRange:false };
}

// ---------------------------------------------------------------------------
// Execute decompression stops during ascent.
// bt is intentionally NOT advanced here — it is frozen at work-end time,
// which is correct per the BASIC (BT only accumulates during WORK). (FIX-8)
// ---------------------------------------------------------------------------
function executeDecoStops(stops, cl, ad, bt, ht, dx, d5, e5, ex, TK, pathPoints, pathLen, frames, XS){
  const AR = 15;
  const sorted = [...stops].sort((a,b) => b.depth - a.depth);
  for(const stop of sorted){
    if(ad > stop.depth){
      const n = Math.max(1, Math.round(((ad - stop.depth) / AR) / TK));
      for(let s = 0; s < n; s++){
        cl += TK; ad = Math.max(stop.depth, ad - AR * TK);
        // bt frozen at work-end; bracket reflects deco status at stop depth
        const bracket = getDTbracket(bt, stop.depth);
        pathPoints[pathLen] = { t:cl, d:ad, bt, bracket, phase:"ASCEND" };
        pathLen++;
        frames.push({ cl, ad, bt, ht, dx, d5, e5, ex, stops:sorted,
                      phase:"ASCEND", decoPhase:false, pathLen, XS });
      }
      ad = stop.depth;
    }
    // GOSUB 6800 lines 6815/6820: countdown D5 or DX each tick
    // IF HT=10 THEN DX=DX-TK ELSE D5=D5-TK
    // liveD5 and liveDX track the live remaining obligation for display
    let liveD5 = d5;
    let liveDX = dx;
    let liveHt = ht; // tracks current stop depth for display (line 7549: HT=HT-5)
    const n = Math.max(1, Math.round(stop.duration / TK));
    for(let s = 0; s < n; s++){
      cl += TK;
      // Line 6815/6820: decrement the appropriate counter
      if(liveHt === 10){ liveDX = Math.max(0, liveDX - TK); }
      else              { liveD5 = Math.max(0, liveD5 - TK); }
      // Line 7549: HT=HT-5 — when 10m stop obligation reaches zero,
      // transition display to show STOP 5 for the next stop
      if(liveHt === 10 && liveDX <= 0) liveHt = 5;
      const bracket = getDTbracket(bt, ad);
      pathPoints[pathLen] = { t:cl, d:ad, bt, bracket, phase:"DECOMPRESS" };
      pathLen++;
      frames.push({ cl, ad, bt, liveHt,
                    ht, dx, d5,
                    e5, ex,
                    liveD5, liveDX,
                    peakHt:liveHt, peakD5:e5, peakDX:ex,
                    peakStops:[...sorted],
                    stops:sorted,
                    phase:"DECOMPRESS", decoPhase:true, pathLen, XS });
    }
    // After this stop, update d5/dx/ht to the live values for next stop
    d5 = liveD5; dx = liveDX; ht = liveHt;
  }
  return { cl, ad, pathLen };
}

// ---------------------------------------------------------------------------
// Build animation frames from dive profile.
//
// FIX-4: path is now a single shared array (pathPoints). Each frame stores
//   only pathLen (an integer index) rather than a full [...path] copy.
//   DiveCanvas slices pathPoints[0..pathLen] per render — O(n) total memory
//   instead of O(n²).
//
// FIX-1: weRef tracks WE (line 1349 init, line 6185 update) across work segs.
// ---------------------------------------------------------------------------
function buildFrames(profile, timeMode, wd){
  const TK = timeMode === "REAL" ? 1/32 : 0.25; // lines 1308/1309
  const DR = 30, AR = 15;
  let XS = 1;
  if(wd < 17) XS = 0.5;  // line 1330
  if(wd > 20) XS = 2.0;  // line 1340

  const frames = [];
  let cl=0, ad=0, bt=0, ht=0, dx=0, d5=0;
  let e5=0, ex=0; // BASIC line 1695: E5=D5, EX=DX — snapshot at work-end, never zeroed
  let pendingStops=[], workDepth=0, clAtWorkStart=0;
  let peakHt=0, peakD5=0, peakDX=0, peakStops=[];

  // FIX-1: WE persistent variable (line 1349: WE=0)
  const weRef = { current: 0 };

  // FIX-4: single shared path array — frames reference by index only
  const pathPoints = [{ t:0, d:0, bt:0, bracket:0, phase:"READY" }];
  let pathLen = 1;

  const push = (phase, decoPhase) => {
    if(ht>0) peakHt=Math.max(peakHt,ht);
    if(d5>0) peakD5=Math.max(peakD5,d5);
    if(dx>0) peakDX=Math.max(peakDX,dx);
    if(pendingStops.length>0) peakStops=[...pendingStops];
    frames.push({ cl, ad, bt, ht, dx, d5,
                  e5, ex,
                  liveHt:ht,
                  liveD5:d5, liveDX:dx,
                  peakHt, peakD5, peakDX, peakStops:[...peakStops],
                  stops:[...pendingStops], phase, decoPhase,
                  pathLen, XS });
  };

  for(const step of profile){

    if(step.act === "DESCEND"){
      const target = step.depth;
      const n = Math.max(1, Math.round((Math.abs(target - ad) / DR) / TK));
      if(frames.length === 0){
        pathPoints[pathLen] = { t:0, d:0, bt:0, bracket:0, phase:"DESCEND" };
        pathLen++;
        push("DESCEND", false);
      }
      for(let s = 0; s < n; s++){
        cl += TK; ad = Math.min(target, ad + DR * TK);
        const bracket = getDTbracket(bt, ad); // bt=0 during descent, correct
        pathPoints[pathLen] = { t:cl, d:ad, bt, bracket, phase:"DESCEND" };
        pathLen++;
        push("DESCEND", false);
      }
      ad = target;

    } else if(step.act === "WORK"){
      workDepth = ad; clAtWorkStart = cl;
      const n = Math.max(1, Math.round(step.mins / TK));
      for(let s = 0; s < n; s++){
        cl += TK; bt += TK;
        const bracket = getDTbracket(bt, workDepth);
        pathPoints[pathLen] = { t:cl, d:ad, bt, bracket, phase:"WORK" };
        pathLen++;
        push("WORK", false);
      }
      // BASIC line 1692: GOSUB 6100 called ONCE at work-end, not per-tick.
      // Per-tick calls advanced WE each tick, collapsing J→L so D5 was wrong.
      const dc = subTestDecompBound(weRef, bt, workDepth);
      if(!dc.outOfRange && (dc.ht > 0 || dc.d5 > 0 || dc.dx > 0)){
        ht=dc.ht; dx=dc.dx; d5=dc.d5; pendingStops=dc.stops;
      }
      // BASIC line 1695: E5=D5: EX=DX — frozen here, never overwritten after
      e5=d5; ex=dx;

    } else if(step.act === "ASCEND"){
      if(pendingStops.length > 0){
        const r = executeDecoStops(
          pendingStops, cl, ad, bt, ht, dx, d5, e5, ex, TK,
          pathPoints, pathLen, frames, XS
        );
        cl=r.cl; ad=r.ad; pathLen=r.pathLen;
        pendingStops=[]; ht=0; dx=0; d5=0;
      }
      if(ad > 0){
        const n = Math.max(1, Math.round((ad / AR) / TK));
        for(let s = 0; s < n; s++){
          cl += TK; ad = Math.max(0, ad - AR * TK);
          // FIX-2: use bt (frozen at work-end), not cl, for bracket colour
          const bracket = getDTbracket(bt, ad);
          pathPoints[pathLen] = { t:cl, d:ad, bt, bracket, phase:"ASCEND" };
          pathLen++;
          push("ASCEND", false);
        }
        ad = 0; // snap — avoids floating-point residual
        if(pathLen>0) pathPoints[pathLen-1].d = 0;
        if(frames.length>0) frames[frames.length-1].ad = 0;
      }

    } else if(step.act === "DECOMPRESS"){
      if(pendingStops.length === 0 && workDepth > 0){
        const r = subStretchesWork(clAtWorkStart, bt - clAtWorkStart, workDepth);
        if(!r.outOfRange && r.pa > 1 && r.stops.length > 0){
          pendingStops=r.stops; ht=r.stops[0].depth;
          d5=r.stops.reduce((s,x) => s+x.duration, 0); dx=workDepth>=20?5:0;
          e5=d5; ex=dx; // snapshot if DECOMPRESS step used instead of ASCEND
        }
      }
      if(pendingStops.length > 0){
        const r = executeDecoStops(
          pendingStops, cl, ad, bt, ht, dx, d5, e5, ex, TK,
          pathPoints, pathLen, frames, XS
        );
        cl=r.cl; ad=r.ad; pathLen=r.pathLen;
        pendingStops=[]; ht=0; dx=0; d5=0;
      }

    } else if(step.act === "REST"){
      const n = Math.max(1, Math.round(step.mins / TK));
      for(let s = 0; s < n; s++){
        cl += TK;
        const bracket = getDTbracket(bt, workDepth || ad);
        pathPoints[pathLen] = { t:cl, d:ad, bt, bracket, phase:"REST" };
        pathLen++;
        push("REST", false);
      }
    }
  }

  if(frames.length === 0)
    frames.push({ cl:0, ad:0, bt:0, ht:0, dx:0, d5:0, stops:[], phase:"READY",
                  decoPhase:false, pathLen:1, XS });

  // Return pathPoints alongside frames so DiveCanvas can reference it
  return { frames, pathPoints };
}

// ---------------------------------------------------------------------------
// Canvas constants
// ---------------------------------------------------------------------------
const CW=700, CH=510;
const CYAN_H=120;
const CYAN_Y=0;
const BX=CW-130, BY=4, BW=124, BH=CYAN_H-8;
const GX=20, PX=72, PW=604;
const PT=CYAN_H+36;
const PB=PT+290;
const PDEPTH=PB-PT;

function dY(d){ return PT + (d/50)*PDEPTH; }

// tX: BBC coordinate system, consistent with mX() in drawBands.
// Both use: screenX = PX + min(1, t*XS/150) * PW
// Screen spans 150/XS real minutes (e.g. XS=2 → 75min, XS=0.5 → 300min).
// Profile line and DT graphic now share the same coordinate system.
function tX(t, XS){ return PX + Math.min(1, t * (XS||1) / 150) * PW; }

// ---------------------------------------------------------------------------
// GOSUB 6300 — SUB COLOURED BANDS (lines 6300-6599)
//
// FIX-9: Accumulates DT graphic one time-column per path point.
// FIX-10: Colour determined per depth-row independently — NOT from diver depth.
//
// For each path step (time slice x1..x2), for each depth row up to diverDepth:
//   determine which DT bracket column applies at (t, thisDepthRow)
//   and paint that cell with the corresponding colour.
//
// This is what the BASIC does in lines 6345-6570:
//   Y2=140 (surface), C=1 (start colour=blue/background)
//   Loop J=1..7: find deepest DT row where DT(I,J)>=XX (line 6370)
//   Paint from Y1 (that depth boundary) up to Y2 (previous boundary)
//   Y2=Y1-1, C=C+1 (next colour), repeat
//   Result: each depth row gets the colour of the bracket it sits in at time XX.
//
// mX: BBC coord — screenX = PX + min(1, t*XS/150)*PW  (line 6310)
// ---------------------------------------------------------------------------
function drawBands(ctx, XS, pathPoints, pathLen){
  if(!pathPoints || pathLen < 2) return;
  const mX = t => PX + Math.min(1, t * XS / 150) * PW;

  function bbc2jsx(Y_bbc){ return Math.round(PT + (140-Y_bbc)/100 * PDEPTH); }

  function rowToY1bbc(I){
    let Y1 = Math.floor(140-(2*I+8)*2)+2;
    if(Y1===42) Y1=40;
    if(Y1<40)   Y1=40;
    return Y1;
  }

  ctx.globalAlpha = 0.9;

  for(let k = 1; k < pathLen; k++){
    const pt   = pathPoints[k];
    const prev = pathPoints[k - 1];
    if(!pt || !prev) continue;
    if(pt.phase !== "WORK") continue;

    const x0 = Math.round(mX(prev.t));
    const x1 = Math.round(mX(pt.t));
    const w  = Math.max(1, x1 - x0);

    // XX = bottom time. Use <= so exact column boundary values correctly
    // trigger the next colour (table column headers are exact BT values).
    const XX = pt.bt ?? 0;

    let Y2_bbc = 140;
    let jsy_top = PT;
    let L = 1;
    let seenBlue = false;

    for(let J = 1; J <= 7; J++){
      let I = L;
      for(; I <= 21; I++){
        if(!DT[I] || DT[I][J-1] === 999 || DT[I][J-1] <= XX) break;
      }
      const Y1_bbc = rowToY1bbc(I);
      const jsy_bot = (Y1_bbc <= 40) ? PB : bbc2jsx(Y1_bbc);

      if(J === 1){
        jsy_top = jsy_bot;
        seenBlue = true;
      } else if(J >= 2 && J <= 6 && seenBlue && jsy_bot > jsy_top){
        ctx.fillStyle = bandCol(J);
        ctx.fillRect(x0, jsy_top, w, jsy_bot - jsy_top);
        jsy_top = jsy_bot;
      }

      if(Y1_bbc <= 40 || J === 7) break;
      if(DT[I] && DT[I][J-1] === 999) break;
      Y2_bbc = Y1_bbc - 1;
      L = I;
    }
  }

  ctx.globalAlpha = 1.0;
}


// ---------------------------------------------------------------------------
// Draw static background (non-text elements only) — called once per run.
// Text strings are drawn separately via typewriterOnCanvas() for the BBC
// character-by-character typing effect (see below).
//
// Renders: blue field, cyan band, title bar rectangle, depth gauge ticks,
// time tick lines and number labels, surface line.
// Does NOT render: title text, underline, "5 METRE UNITS", "TIME AT…" label.
// ---------------------------------------------------------------------------
function drawBackgroundStatic(ctx, XS){
  // Full blue background
  ctx.fillStyle = "#0000aa";
  ctx.fillRect(0, 0, CW, CH);

  // Cyan input band (BASIC PLOT 6,48 — teal/cyan zone at top)
  ctx.fillStyle = "#008888";
  ctx.fillRect(0, CYAN_Y, CW, CYAN_H);

  // Title bar rectangle (text drawn separately via typewriter)
  ctx.fillStyle = "#0000aa";
  ctx.fillRect(0, CYAN_H, CW, 34);

  // Tick marks and text drawn separately via animated step loop in buildBackground.
}

// ---------------------------------------------------------------------------
// BBC typewriter effect — draws characters one-by-one onto ctx with ~90ms
// between each character, simulating the BBC Micro VDU driver speed.
//
// items: array of { text, x, y, color, font, rotated? }
//   rotated: if true, text is drawn rotated -90° around (x,y) — used for
//            the "5 METRE UNITS" depth label which is ctx.rotate()'d in BASIC.
// onChar: called after each character is painted (triggers bg re-blit).
// Returns a Promise that resolves when all characters are drawn.
//
// Character delay: 90ms ≈ BBC Micro VDU character rate at 1200 baud display.
// The underline row uses the same delay — each "-" is one character tick.
// ---------------------------------------------------------------------------
const CHAR_DELAY_MS = 70;

// Build the text item list for a given background.
// Underline colour matches title (#00ffff) — same BBC cyan, not yellow.
function bgTextItems(XS){
  return [
    // Title: "DIVER SIMULATION MODEL." — BASIC line 1265, cyan
    { text:"DIVER SIMULATION MODEL.",
      x: PX+150, y: CYAN_H+14,
      color:"#00ffff", font: BBCFONT(10, true) },
    // Underline: "-----------------------" — BASIC line 1266, same cyan as title
    { text:"-----------------------",
      x: PX+150, y: CYAN_H+26,
      color:"#00ffff", font: BBCFONT(10, true) },
    // "5 METRE UNITS" — depth axis label, drawn vertically right of tick marks.
    // Each character printed upright at increasing y — no rotation, fully readable.
    // x=GX+16 puts it just right of the 12px ticks (GX=34, so x≈50).
    { text:"5 METRE UNITS",
      x: GX+18, y: PT + PDEPTH/2 - 6*15,
      color:"#ffffff", font: BBCFONT(10, false), vertical: true },
    // "TIME AT 10 MINUTE INTERVALS" — BASIC line 1361, cyan
    { text:"TIME AT 10 MINUTE INTERVALS",
      x: PX+120, y: PB+28,
      color:"#ffffff", font: BBCFONT(10, false) },
  ];
}

// Tick mark paint operations in BBC top-left → bottom-right draw order.
// Depth ticks first (top of canvas downward), then time ticks (left → right).
// Each op is { draw(ctx) } — called one per CHAR_DELAY_MS in buildBackground.
//
// Depth axis: all ticks white, uniform 12px wide × 2px tall (every 5m).
// Time axis: faint vertical grid line + 4×4 yellow square at bottom every 10min.
function bgTickOps(XS){
  const ops = [];

  // Depth ticks — top to bottom, every 5m, all same width (BASIC gauge style)
  for(let d = 0; d <= 50; d += 5){
    const y = dY(d);
    ops.push({ draw(ctx){
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, y - 1, 12, 2);
    }});
  }

  // Time ticks — evenly spread across PX..PX+PW, matching BASIC line 1346:
  //   FOR I=1 TO 150 STEP XS*10 → nTicks = floor(149/(XS*10)) + 1
  // Spread evenly so last tick always lands at PX+PW (right edge of plot area).
  const nTicks = Math.floor(149 / ((XS||1) * 10)) + 1;
  for(let i = 0; i < nTicks; i++){
    const x = PX + Math.round(i / Math.max(1, nTicks - 1) * PW);
    ops.push({ draw(ctx){
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.fillRect(x, PT, 1, PB - PT);
      ctx.fillStyle = "#ffff00";
      ctx.fillRect(x - 2, PB, 4, 4);
    }});
  }

  return ops;
}
//   bgRef  = background canvas, drawn once per simulation run.
//   fgRef  = foreground canvas, redrawn per frame (profile line, info box).
//   pathPoints = shared path array from buildFrames (FIX-4).
//   bgVersion  = incremented by typewriter after each character, triggering
//                the background canvas ref-callback to re-blit.
// ---------------------------------------------------------------------------
function DiveCanvas({ frame, bgImageRef, pathPoints, wdInput, bgVersion, inputLine }){
  const fgRef = useRef(null);
  const [flashTick, setFlashTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFlashTick(t => t+1), 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const cv = fgRef.current; if(!cv) return;
    const ctx = cv.getContext("2d");
    const XS = frame?.XS || 1;

    ctx.clearRect(0, 0, CW, CH);

    // ── Accumulated DT graphic — GOSUB 6300, drawn up to current frame (FIX-9)
    if(pathPoints && frame?.pathLen){
      drawBands(ctx, XS, pathPoints, frame.pathLen);
    }

    // ── BBC DIVER MONITOR — exact character grid replica ────────────────────
    //
    // The physical BBC monitor box has a fixed grid of character cells driven
    // by GOSUB 7000 with ID 1..22.  Layout from BASIC PLOT 3 positions:
    //
    //   MEMORY label  : PLOT 3,69,1  → BBC row 1  (top of box)
    //   IDs  1– 6     : PLOT 3,68+ID,4 → BBC row 4  (ROW_A)
    //   IDs  7–12     : PLOT 3,62+ID,7 → BBC row 7  (ROW_B)
    //   IDs 13–18     : PLOT 3,56+ID,9 → BBC row 9  (ROW_C)
    //   IDs 19–20     : PLOT 3,57+ID,4 → depth digits, same row as ROW_A
    //   ID  21        : depth bar graphic (line 7200)
    //   ID  22        : air bar graphic   (line 7300)
    //
    // All 6 character columns (IDs x+1 .. x+6) are equally spaced inside the
    // text area (right of air bar).  CO=1→white/cyan, CO=0→yellow; FL=1→flash.
    //
    // BBC rows 1,4,7,9 out of 32 total.  We map BBC row r → canvas y linearly
    // within the monitor box height.
    //
    // Colour rules from BASIC:
    //   CO=1 (cyan/white label)  → #00ffff
    //   CO=0, FL=0 (yellow data) → #ffff00
    //   CO=0, FL=1 (flashing)    → #ffff00 / transparent alternating
    //   MEMORY banner PRINT      → #ffffff on #000000

    const surfaced = frame && frame.ad===0 && frame.cl>0;
    const preDive  = !frame || frame.cl===0;

    // ── Monitor box geometry ─────────────────────────────────────────────────
    // MEMORY label strip sits above the dark data box.
    const LABEL_H  = 14;
    const boxTopY  = BY + LABEL_H;
    const boxH     = BH - LABEL_H;

    // ── Air bar (ID=22) + Depth bar (ID=21) — BASIC lines 7200–7342 ─────────
    // Both bars share the same left strip. In BBC screen coords:
    //   Air bar   y=133..169  (18 slots × 2px, drawn at x=250, y=134)
    //   Depth bar y=152..166  (10 slots × 2px, drawn at x=250, y=155)
    // They overlap — depth bar occupies the bottom portion of the strip.
    // Visual result (photo): yellow×3 top, green×N air, blue×2 depth at bottom.
    //
    // Air bar colours: PLOT 6,2+FL → colour 2=green (bright), colour 3=yellow flash
    //   Slots 16-18 (top 3): yellow (colour 5, line 7305)
    //   Slots  1-13: colour 2 (bright green #00ff00) if VA_raw>=slot, else dark
    // Depth bar: PLOT 6,1+FL → colour 1=blue, overlaid at bottom of same strip
    //   Bottom 2 visible slots always blue (fixed reserve shown in photo)
    const AIR_W   = 7;
    const AIR_X   = BX + 2;
    const TOTAL_S = 18;
    const slotH   = Math.floor((boxH - 4) / TOTAL_S);
    const AIR_TOP = boxTopY + 2;

    const VA_raw  = preDive ? 13
      : Math.max(0, Math.min(13, Math.round(13 - (frame?.cl||0) * XS / 10)));

    // ── Text area geometry ────────────────────────────────────────────────────
    // Text sits left of air bar.
    // Three rows evenly spaced from photo: 25%, 52%, 78% of boxH
    const MEM_Y    = BY + LABEL_H - 3;
    const ROW_A_Y  = boxTopY + Math.round(boxH * 0.25);
    const ROW_B_Y  = boxTopY + Math.round(boxH * 0.52);
    const ROW_C_Y  = boxTopY + Math.round(boxH * 0.78);

    // Text starts immediately right of the left air bar, shifted one char right
    const TX_MAX   = BX + BW - 2;
    ctx.font = BBCFONT(10, true);
    const CHAR_W   = ctx.measureText("0").width;
    const TX0      = AIR_X + AIR_W + 2 + CHAR_W;   // +CHAR_W = one character right
    const cellX    = c => TX0 + (c - 1) * CHAR_W;
    // Data cols (4-6) shifted right by 1 extra char for label/number separation
    const dataX    = c => TX0 + (c - 1 + 1) * CHAR_W;

    const CYAN_COL   = "#00ffff";
    const YELLOW_COL = "#ffff00";
    const WHITE_COL  = "#ffffff";
    const flashOn    = flashTick % 2 === 0;

    const putStr = (col, y, str, colour) => {
      if(!str) return;
      ctx.fillStyle = colour;
      ctx.fillText(str, cellX(col), y);
    };

    // putData: like putStr but uses dataX (shifted right 1 char) for number columns
    const putData = (col, y, str, colour) => {
      if(!str) return;
      ctx.fillStyle = colour;
      ctx.fillText(str, dataX(col), y);
    };

    const putCell = (col, y, ch, colour) => {
      if(!ch || ch === " ") return;
      ctx.fillStyle = colour;
      ctx.fillText(ch, cellX(col), y);
    };

    const bbcD2 = n => {
      const v = Math.max(0, Math.floor(Math.abs(n)));
      return (Math.floor(v/10) === 0 ? " " : String(Math.floor(v/10))) + String(v % 10);
    };

    // ── Dark background box ───────────────────────────────────────────────────
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(BX, boxTopY, BW, boxH);
    ctx.strokeStyle = "#224444"; ctx.lineWidth = 1;
    ctx.strokeRect(BX, boxTopY, BW, boxH);

    // ── Air bar (ID=22) drawn AFTER black box so it is not erased ────────────
    for(let slot = 1; slot <= TOTAL_S; slot++){
      const sy = AIR_TOP + (TOTAL_S - slot) * slotH;
      let colour;
      if(slot >= 15){
        colour = "#000000";   // top 4 rows: black (empty)
      } else if(slot <= 2){
        colour = "#0055ff";
      } else if(slot >= 14){
        colour = "#001800";
      } else {
        colour = VA_raw >= slot ? "#00ff00" : "#001800";
      }
      ctx.fillStyle = colour;
      ctx.fillRect(AIR_X, sy, AIR_W, slotH - 1);
    }

    // ── MEMORY label strip (BBC line 8006: PLOT 3,69,1; PRINT "MEMORY") ──────
    if(surfaced){
      ctx.font = BBCFONT(10, true);
      const memW = ctx.measureText("MEMORY").width;
      ctx.fillStyle = "#000000";
      ctx.fillRect(TX0 - 1, BY, memW + 2, LABEL_H);
      ctx.fillStyle = WHITE_COL;
      ctx.fillText("MEMORY", TX0, MEM_Y);
      ctx.font = BBCFONT(10, true);
    }

    // ── GOSUB 6600 — depth gauge (IDs 19-20) — shown when STOP label not active ─
    // BBC: PLOT 3,57+ID,4 → columns 76-77, row 4. In our compact box these
    // columns overlap the STOP label area, so only draw when STOP is not shown.
    const peakHtForDepth = (!preDive && frame) ? (frame.peakHt || frame.ht || 0) : 0;
    if(frame && !preDive && peakHtForDepth === 0){
      const adVal = Math.round(frame.ad);
      const tens  = Math.floor(adVal / 10);
      const units = adVal % 10;
      const depthStr = (tens === 0 ? " " : String(tens)) + String(units);
      ctx.font      = BBCFONT(10, true);
      ctx.fillStyle = WHITE_COL;
      ctx.fillText(depthStr, cellX(5), ROW_A_Y);
    }
    //
    // The BASIC calls these subroutines every display tick:
    //   GOSUB 6600 → depth gauge (IDs 19-21, separate, always)
    //   GOSUB 6700 → air bar    (ID 22, drawn above)
    //   GOSUB 6750 → NOSTOP / time-to-next-bound (IDs 13-18, during DESCEND/WORK)
    //   GOSUB 6950 → STOP HT   (IDs 1-6,  set once at work-end, shown until surface)
    //   GOSUB 6800 → T countdown (IDs 7-12, during DECOMPRESS activity)
    //   GOSUB 6900 → decomp requirements summary (IDs 7-12, shown pre-ascent)
    //   GOSUB 8000 → MEMORY display at end (IDs 1-18 all rewritten)
    //
    // After work-end, GOSUB 6950 fires (line 1693) writing STOP row to IDs 1-6.
    // GOSUB 6850 (line 1694) writes T-total to IDs 7-12 and initialises NOSTOP
    // to IDs 13-18 for the deco segment.
    // During DECOMPRESS, GOSUB 6800 counts down IDs 7-12 each tick.
    // GOSUB 7500 (finished decomp) writes "ASCEND" or adjusts HT at each stop done.

    if(surfaced){
      // ── GOSUB 8000 — MEMORY ─────────────────────────────────────────────
      // Line 8074 branch: NS<0 means deco was required → show BT / 10M / 5M
      // Line 8063: NS>=0 and NS=0 means no-stop → show NOSTOP (line 8064/8100)
      const dxInt = Math.round(frame.ex ?? 0);
      const d5Int = Math.round(frame.e5 ?? 0);

      if(dxInt === 0 && d5Int === 0){
        // No deco required — line 8064: blank IDs 7-12, show NS remaining
        // For simplicity, show NOSTOP in ROW_B (IDs 7-12 area)
        putStr(1, ROW_B_Y, "NOSTOP", CYAN_COL);
      } else {
        // Line 8020-8060: IDs 1-6 = BT as HHH:SS (up to 3 digits mins + :ss)
        // BT printed as: ID1=hundreds, ID2=tens, ID3=units, ID4=':', ID5=tens-sec, ID6=units-sec
        const btFull  = frame.bt;
        const btM     = Math.floor(btFull);
        const btSec   = Math.round((btFull - btM) * 60);
        const btH     = Math.floor(btM / 100);
        const btMr    = btM % 100;
        // IDs 1-6: BT as "mm:ss" — leading zeros suppressed, CO=1 cyan
        // BBC: hundreds digit suppressed if 0, tens digit suppressed if 0 and hundreds=0
        const ch1 = btH  === 0 ? " " : String(btH);
        const ch2 = (Math.floor(btMr/10) === 0 && btH === 0) ? " " : String(Math.floor(btMr/10));
        const btStr = ch1 + ch2 + String(btMr%10) + ":" +
                      String(Math.floor(btSec/10)) + String(btSec%10);
        putStr(1, ROW_A_Y, btStr, CYAN_COL);

        // IDs 7-9: "10M" cyan; IDs 10-12: DX as m:ss yellow (line 8075-8078)
        // DX is in minutes (may be fractional) — display as m:ss
        putStr(1, ROW_B_Y, "10M", CYAN_COL);
        const dxM = Math.floor(dxInt), dxS = Math.round((dxInt - dxM) * 60);
        const dxStr = bbcD2(dxM) + ":" + String(Math.floor(dxS/10)) + String(dxS%10);
        putData(4, ROW_B_Y, dxStr, YELLOW_COL);

        // IDs 13-15: "5M " cyan; IDs 16-18: D5 as m:ss yellow (line 8080-8090)
        putStr(1, ROW_C_Y, "5M", CYAN_COL);
        const d5M = Math.floor(d5Int), d5S = Math.round((d5Int - d5M) * 60);
        const d5Str = bbcD2(d5M) + ":" + String(Math.floor(d5S/10)) + String(d5S%10);
        putData(4, ROW_C_Y, d5Str, YELLOW_COL);
      }

    } else if(!preDive && frame){
      const dxInt  = Math.round(frame.ex  ?? 0);
      const d5Int  = Math.round(frame.e5  ?? 0);
      const peakHt = frame.peakHt || frame.ht || 0;

      if(peakHt > 0 || dxInt > 0 || d5Int > 0){
        // ── GOSUB 6950 — STOP HT (IDs 1-6) — CO=0 → WHITE ───────────────────
        const dispHt  = frame.liveHt !== undefined ? frame.liveHt : peakHt;
        const htStr   = dispHt === 10 ? "STOP 10" : "STOP 5";
        putStr(1, ROW_A_Y, htStr, WHITE_COL);

        // ── GOSUB 6800 — T countdown (IDs 7-12) — CO=0 → WHITE ──────────────
        const liveTotal = (frame.liveD5 || 0) + (frame.liveDX || 0);
        const totalDisp = liveTotal > 0 ? liveTotal : (dxInt + d5Int);
        if(totalDisp > 0){
          const dm  = Math.floor(totalDisp);
          const ds  = Math.round((totalDisp - dm) * 60);
          const mStr = bbcD2(dm);
          const sStr = String(Math.floor(ds/10)) + String(ds%10);
          const inDeco = frame.phase === "DECOMPRESS";
          // "T" and ":" always steady; digit pairs flash during DECOMPRESS (FL=1 IDs 8-9, 11-12)
          const showDigits = !inDeco || flashOn;
          putStr(1, ROW_B_Y, "T", WHITE_COL);
          if(showDigits){
            putStr(3, ROW_B_Y, mStr, WHITE_COL);
            putStr(5, ROW_B_Y, ":",  WHITE_COL);
            putStr(6, ROW_B_Y, sStr, WHITE_COL);
          } else {
            putStr(5, ROW_B_Y, ":", WHITE_COL);
          }
        }

        // ── GOSUB 6750 — time remaining in current DT bracket — CO=0 → WHITE ─
        if(frame.phase === "DESCEND" || frame.phase === "WORK"){
          const wd40  = Number(wdInput) || 40;
          const J     = Math.max(1, Math.min(21, Math.round((wd40 - 7) / 2)));
          const nsRow = DT[J];
          if(nsRow){
            const NS = nsRow[0] - frame.cl;
            if(NS >= 0){
              const nm = Math.floor(NS), ns = Math.round((NS - nm) * 60);
              const nmH = Math.floor(nm/100), nmR = nm % 100;
              const c1 = nmH === 0 ? " " : String(nmH);
              const c2 = (Math.floor(nmR/10) === 0 && nmH === 0) ? " " : String(Math.floor(nmR/10));
              putStr(1, ROW_C_Y,
                c1 + c2 + String(nmR%10) + ":" + String(Math.floor(ns/10)) + String(ns%10),
                WHITE_COL);
            } else {
              let nextBound = -1;
              for(let i2 = 1; i2 < 7; i2++){
                if(nsRow[i2] !== 999 && nsRow[i2] > frame.cl){ nextBound = nsRow[i2]; break; }
              }
              if(nextBound >= 0){
                const NN = nextBound - frame.cl;
                const nm = Math.floor(NN), ns = Math.round((NN - nm) * 60);
                const nmH = Math.floor(nm/100), nmR = nm % 100;
                const c1 = nmH === 0 ? " " : String(nmH);
                const c2 = (Math.floor(nmR/10) === 0 && nmH === 0) ? " " : String(Math.floor(nmR/10));
                putStr(1, ROW_C_Y,
                  c1 + c2 + String(nmR%10) + ":" + String(Math.floor(ns/10)) + String(ns%10),
                  WHITE_COL);
              }
            }
          }
        }

      } else {
        // GOSUB 6750 with NS>=0 and no deco: "NOSTOP" — CO=0 → WHITE
        putStr(1, ROW_B_Y, "NOSTOP", WHITE_COL);
      }

    } else {
      putStr(1, ROW_B_Y, "NOSTOP", WHITE_COL);
    }

    // ── Dive profile line (black+white) — drawn from shared pathPoints ──────
    // FIX-4: slice pathPoints[0..pathLen] instead of reading frame.path
    if(frame?.pathLen > 1 && pathPoints){
      const len = frame.pathLen;
      // Profile line: solid black everywhere EXCEPT during WORK phase when
      // the path point is inside a coloured DT band (bracket > 0).
      // Condition: phase === "WORK" && pathPoint.bracket > 0
      // pathPoints[k].bracket = getDTbracket(bt, workDepth) stored at build time.
      // DESCEND, ASCEND, DECOMPRESS, REST are always solid.
      ctx.strokeStyle = "#000000"; ctx.lineWidth = 2;

      // Draw full path as solid first
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(tX(pathPoints[0].t, XS), dY(pathPoints[0].d));
      for(let k = 1; k < len; k++)
        ctx.lineTo(tX(pathPoints[k].t, XS), dY(pathPoints[k].d));
      ctx.stroke();

      // Overdraw in background blue with dash pattern only where:
      //   phase === "WORK" AND bracket > 0 (inside a coloured DT band)
      ctx.strokeStyle = "#0000aa"; ctx.lineWidth = 4;
      ctx.setLineDash([3, 4]);
      let inDash = false;
      for(let k = 1; k < len; k++){
        const pt = pathPoints[k];
        const isDash = pt.phase === "WORK" && pt.bracket > 0;
        if(isDash !== inDash){
          if(inDash) ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(tX(pathPoints[k-1].t, XS), dY(pathPoints[k-1].d));
          inDash = isDash;
        }
        if(inDash) ctx.lineTo(tX(pt.t, XS), dY(pt.d));
      }
      if(inDash) ctx.stroke();
      ctx.setLineDash([]);
    }

    // Decompression stop dashed lines removed — not in original BBC display

    // ── BBC cyan band input line — drawn on canvas so font matches exactly ───
    // Erase the left portion of the cyan band (leave monitor box area)
    // then draw prompt + typed text + flashing cursor at PLOT 3,0,0 position.
    if(inputLine){
      // Clear left 75% of cyan band
      ctx.fillStyle = "#008888";
      ctx.fillRect(0, CYAN_Y, Math.round(CW * 0.75), CYAN_H);
      ctx.font = BBCFONT(10, true);
      ctx.fillStyle = "#ffffff";
      const lineY = CYAN_Y + 18;   // ~BBC row 0, one line down from top
      ctx.fillText(inputLine.prompt, 4, lineY);
      // Typed value follows immediately after prompt (prompt already has trailing space)
      const promptW = ctx.measureText(inputLine.prompt).width;
      ctx.fillText(inputLine.value, 4 + promptW, lineY);
      // Flashing block cursor after typed value
      if(inputLine.cursorOn){
        const totalW = ctx.measureText(inputLine.prompt + inputLine.value).width;
        const ch = 12;   // BBC block cursor height in canvas pixels
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(4 + totalW, lineY - ch + 2, 8, ch);
      }
      // Error line below prompt
      if(inputLine.error){
        ctx.fillStyle = "#ff0000";
        ctx.fillText("? " + inputLine.error, 4, lineY + 16);
      }
    }

  }, [frame, pathPoints, flashTick, inputLine]);

  return (
    <div style={{ position:"relative", width:"100%" }}>
      {/* Background canvas — in-flow, sets container height */}
      <canvas
        ref={c => {
          if(c && bgImageRef.current){
            const ctx = c.getContext("2d");
            ctx.drawImage(bgImageRef.current, 0, 0);
          }
        }}
        key={bgVersion}
        width={CW} height={CH}
        style={{ width:"100%", imageRendering:"pixelated",
                 border:"2px solid #003333", display:"block",
                 position:"relative" }}
      />
      {/* Foreground canvas — absolute overlay, transparent */}
      <canvas ref={fgRef} width={CW} height={CH}
        style={{ width:"100%", imageRendering:"pixelated",
                 display:"block", position:"absolute", top:0, left:0,
                 background:"transparent" }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const defaultProfile = [
  { act:"DESCEND", depth:30 },
  { act:"WORK",    mins:25  },
  { act:"ASCEND"           },
];

export default function DiverSim(){
  const [profile,   setProfile]   = useState([]);
  const [timeMode,  setTimeMode]  = useState("ACCELERATED");
  const [frames,    setFrames]    = useState([]);
  const [pathPoints,setPathPoints]= useState(null); // FIX-4
  const [frameIdx,  setFrameIdx]  = useState(0);
  const [playing,   setPlaying]   = useState(false);
  const [speed,     setSpeed]     = useState(16);
  const [built,     setBuilt]     = useState(false);
  const [wdInput,   setWdInput]   = useState(30);
  const [wdError,   setWdError]   = useState("");
  const [newAct,    setNewAct]    = useState("DESCEND");
  const [newDepth,  setNewDepth]  = useState(30);
  const [newMins,   setNewMins]   = useState(25);
  const [showDebug, setShowDebug] = useState(false);

  // ── BBC cyan-band interaction state ────────────────────────────────────────
  // inputStep: which prompt is active
  //   null | "WORKING_DEPTH" | "TIME_MODE" | "ACTIVITY" | "DESCEND_DEPTH"
  //   | "WORK_BOTTOM_TIME" | "REST_DURATION" | "WORK_CONFIRM"
  const [inputStep,   setInputStep]   = useState("WORKING_DEPTH");
  const [inputValue,  setInputValue]  = useState("");
  const [inputError,  setInputError]  = useState("");
  const [displayVals, setDisplayVals] = useState({});
  const [pendingActivity, setPendingActivity] = useState(null);
  const [lastActivity,   setLastActivity]    = useState(null); // for default suggestion
  const inputRef = useRef(null);
  const intervalRef  = useRef(null);
  const bgImageRef   = useRef(null); // FIX-5: off-screen background canvas
  const timeModeRef  = useRef(timeMode);
  const wdRef        = useRef(wdInput);
  const [fontReady,  setFontReady]  = useState(false);
  // bgVersion increments after each typewriter character, forcing the
  // background canvas ref-callback to re-blit the updated offscreen canvas.
  const [bgVersion,  setBgVersion]  = useState(0);
  // typewriterAbortRef: set to true to cancel an in-progress typewriter sequence.
  const typewriterAbortRef = useRef(false);

  // buildBareBackground: draws only blue field + cyan band.
  // Called on mount so the canvas shows before any input is submitted.
  // Axes, ticks, labels and typewriter text are only drawn by buildBackground,
  // which is called from triggerRun when the sim actually starts.
  const buildBareBackground = useCallback(() => {
    typewriterAbortRef.current = true;
    setTimeout(() => {
      typewriterAbortRef.current = false;
      const offscreen = document.createElement("canvas");
      offscreen.width = CW; offscreen.height = CH;
      const ctx = offscreen.getContext("2d");
      // Blue field
      ctx.fillStyle = "#0000aa";
      ctx.fillRect(0, 0, CW, CH);
      // Cyan input band
      ctx.fillStyle = "#008888";
      ctx.fillRect(0, CYAN_Y, CW, CYAN_H);
      // Title bar stripe
      ctx.fillStyle = "#0000aa";
      ctx.fillRect(0, CYAN_H, CW, 34);
      bgImageRef.current = offscreen;
      setBgVersion(v => v + 1);
    }, 0);
  }, []);

  // buildBackground: draws static elements instantly, then types the text
  // strings character-by-character onto the same offscreen canvas.
  // Each character paint calls setBgVersion to trigger a re-blit of the
  // background canvas in DiveCanvas.
  const buildBackground = useCallback((XS, onComplete) => {
    typewriterAbortRef.current = true;  // abort any prior sequence
    setTimeout(() => {                  // yield so prior timeouts see abort flag
      typewriterAbortRef.current = false;
      const offscreen = document.createElement("canvas");
      offscreen.width = CW; offscreen.height = CH;
      const ctx = offscreen.getContext("2d");
      drawBackgroundStatic(ctx, XS);
      bgImageRef.current = offscreen;
      setBgVersion(v => v + 1);         // blit static elements immediately

      const items = bgTextItems(XS);
      const itemOffsets = items.map(item => {
        if(item.vertical) return null;
        ctx.font = item.font;
        const offsets = [0];
        for(let i = 0; i < item.text.length - 1; i++)
          offsets.push(offsets[i] + ctx.measureText(item.text[i]).width);
        return offsets;
      });

      // Build a fully sequential op list in BBC draw order:
      // 1. "DIVER SIMULATION MODEL." char by char
      // 2. "---..." underline char by char
      // 3. depth ticks top→bottom, one per step
      // 4. "5 METRE UNITS" char by char (vertical)
      // 5. time ticks left→right, one per step
      // 6. "TIME AT 10 MINUTE INTERVALS" char by char
      const [titleItem, underlineItem, vertItem, timeTextItem] = items;
      const depthTickOps = bgTickOps(XS).filter((_,i) => i < 11); // first 11 = depth ticks (0..50 step 5)
      const timeTickOps  = bgTickOps(XS).filter((_,i) => i >= 11);

      const ops = [];

      // 1+2: title and underline char by char
      [titleItem, underlineItem].forEach((item, iIdx) => {
        for(let ci = 0; ci < item.text.length; ci++)
          ops.push({ type:"char", item, iIdx, ci, char: item.text[ci] });
      });

      // 3: depth ticks
      depthTickOps.forEach(op => ops.push({ type:"tick", op }));

      // 4: "5 METRE UNITS" vertical, char by char
      for(let ci = 0; ci < vertItem.text.length; ci++)
        ops.push({ type:"char", item: vertItem, iIdx: 2, ci, char: vertItem.text[ci] });

      // 5: time ticks
      timeTickOps.forEach(op => ops.push({ type:"tick", op }));

      // 6: "TIME AT 10 MINUTE INTERVALS"
      for(let ci = 0; ci < timeTextItem.text.length; ci++)
        ops.push({ type:"char", item: timeTextItem, iIdx: 3, ci, char: timeTextItem.text[ci] });

      let opIdx = 0;
      const step = () => {
        if(typewriterAbortRef.current) return;
        if(opIdx >= ops.length) return;
        const entry = ops[opIdx];

        if(entry.type === "tick"){
          entry.op.draw(ctx);
        } else {
          // type === "char"
          const { item, iIdx, ci, char } = entry;
          ctx.font      = item.font;
          ctx.fillStyle = item.color;

          if(item.vertical){
            // Vertical label: each character drawn upright at the same x,
            // stepping down by one line-height per character.
            const lineH = Math.ceil(parseInt(item.font) * 1.5);
            ctx.fillText(char, item.x, item.y + ci * lineH);
          } else {
            const xOff = itemOffsets[iIdx]?.[ci] ?? 0;
            ctx.fillText(char, item.x + xOff, item.y);
          }
        }

        setBgVersion(v => v + 1);
        opIdx++;
        if(opIdx >= ops.length){
          if(onComplete) onComplete();
          return;
        }
        setTimeout(step, CHAR_DELAY_MS);
      };
      setTimeout(step, CHAR_DELAY_MS);
    }, 0);
  }, []);

  // Load Bedstead (authentic BBC Micro bitmap lookalike), then draw bare background.
  // Axes and ticks are NOT drawn until triggerRun fires (sim starts).
  useEffect(() => {
    // Bedstead by Ben Harris — pixel-perfect BBC Micro Mode 7 lookalike
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.cdnfonts.com/css/bedstead";
    document.head.appendChild(link);

    // Also load Share Tech Mono as fallback
    const link2 = document.createElement("link");
    link2.rel  = "stylesheet";
    link2.href = "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap";
    document.head.appendChild(link2);

    const init = () => {
      setFontReady(true);
      // Draw bare canvas (blue + cyan band) — NO axes or ticks until sim runs
      buildBareBackground();
    };

    Promise.race([
      document.fonts.ready,
      new Promise(r => setTimeout(r, 2000))
    ]).then(init).catch(init);

    return () => {
      typewriterAbortRef.current = true;
      try{ document.head.removeChild(link); }catch(e){}
      try{ document.head.removeChild(link2); }catch(e){}
    };
  }, []);

  // Line 1281: IF WD<=0 OR WD>=50 THEN 1279
  const validateWD = (v) => {
    const n = Number(v);
    if(n <= 0 || n >= 50) return "Depth must be 1–49m (line 1281: <=0 or >=50 rejected)";
    return "";
  };

  // ── BBC cyan-band prompt definitions ────────────────────────────────────────
  // BASIC line 3031: PRINT "WHICH ACTIVITY REQUIRED (";A$(AL(AL,5));") "
  const defaultActivity = lastActivity === "DECOMPRESS" ? "ASCEND"
                        : lastActivity === "WORK"       ? "WORK"
                        : lastActivity || "DESCEND";
  const CYAN_PROMPTS = {
    WORKING_DEPTH:    { label:"WORKING DEPTH ?",                             type:"number" },
    TIME_MODE:        { label:"TIME MODE (REAL OR ACCELERATED) ?",           type:"text"   },
    ACTIVITY:         { label:`WHICH ACTIVITY REQUIRED (${defaultActivity}) ?`, type:"text" },
    WORK_BOTTOM_TIME: { label:"BOTTOM TIME ?",                               type:"number" },
    REST_DURATION:    { label:"FOR HOW LONG ?",                              type:"number" },
  };

  // CHR$(7) bell — 800Hz sine, ~100ms, matches BBC Micro speaker tone
  const playBell = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "square";          // BBC used square wave buzzer
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    } catch(e){ /* no audio context */ }
  }, []);

  const validateCyanInput = (step, val) => {
    const v = val.trim();
    if(!v) return "Please enter a value";
    if(step === "WORKING_DEPTH"){
      const n = Number(v);
      if(isNaN(n) || n <= 0 || n >= 50) return "Must be 1-49m";
    }
    // TIME_MODE: any input accepted — REAL → real time, anything else → accelerated
    if(step === "ACTIVITY"){
      if(!["DESCEND","ASCEND","WORK","DECOMPRESS","REST"].includes(v.toUpperCase()))
        return "Type: DESCEND / ASCEND / WORK / DECOMPRESS / REST";
    }
    if(step === "WORK_BOTTOM_TIME" || step === "REST_DURATION"){
      const n = Number(v);
      if(isNaN(n) || n <= 0) return "Must be > 0";
    }
    return "";
  };

  // Fire bell on mount — BASIC line 1278: PRINT CHR$(7) before WORKING DEPTH
  useEffect(() => { playBell(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const commitCyanInput = () => {
    const err = validateCyanInput(inputStep, inputValue);
    if(err){ playBell(); setInputError(err); return; }
    setInputError("");
    const val = inputValue.trim();
    setInputValue("");

    if(inputStep === "WORKING_DEPTH"){
      setWdInput(Number(val));
      wdRef.current = Number(val);
      playBell();                      // line 1303: CHR$(7) before TIME MODE
      setInputStep("TIME_MODE");

    } else if(inputStep === "TIME_MODE"){
      const m = val.toUpperCase();
      const tm = (m === "REAL") ? "REAL" : "ACCELERATED";
      setTimeMode(tm);
      timeModeRef.current = tm;
      playBell();                      // line 3025: CHR$(7) before WHICH ACTIVITY
      setInputStep("ACTIVITY");

    } else if(inputStep === "ACTIVITY"){
      const act = val.toUpperCase();
      const valid = ["DESCEND","ASCEND","WORK","DECOMPRESS","REST"];
      if(!valid.includes(act)){
        playBell();
        setInputError("Type: DESCEND / ASCEND / WORK / DECOMPRESS / REST");
        return;
      }
      setPendingActivity(act);
      setLastActivity(act);
      if(act === "WORK"){
        playBell();                    // line 5509: CHR$(7) before BOTTOM TIME
        setInputStep("WORK_BOTTOM_TIME");
      } else if(act === "REST"){
        playBell();                    // line 5705: CHR$(7) before FOR HOW LONG
        setInputStep("REST_DURATION");
      } else {
        setProfile(p => {
          const step = act === "DESCEND"
            ? { act:"DESCEND", depth: Number(wdRef.current) }
            : { act };
          const next = [...p, step];
          if(act === "ASCEND") triggerRun(next);
          return next;
        });
        if(act !== "ASCEND"){
          playBell();                  // line 3025: CHR$(7) before next WHICH ACTIVITY
          setInputStep("ACTIVITY");
        }
      }

    } else if(inputStep === "WORK_BOTTOM_TIME"){
      const mins = Number(val);
      setProfile(p => [...p, { act:"WORK", mins }]);
      setPendingActivity(null);
      setLastActivity("WORK");
      playBell();                      // line 3025: CHR$(7) before next WHICH ACTIVITY
      setInputStep("ACTIVITY");

    } else if(inputStep === "REST_DURATION"){
      const mins = Number(val);
      setProfile(p => [...p, { act:"REST", mins }]);
      setPendingActivity(null);
      setLastActivity("REST");
      playBell();                      // line 3025: CHR$(7) before next WHICH ACTIVITY
      setInputStep("ACTIVITY");
    }
  };

  // Called when ASCEND is entered — fires the simulation immediately
  // using refs to avoid stale closure over state values.
  const triggerRun = useCallback((completedProfile) => {
    setProfile(completedProfile);
    setInputStep(null);
    const wd = Number(wdRef.current);
    if(validateWD(wd)) return;
    const tm = timeModeRef.current;
    const { frames: f, pathPoints: pp } = buildFrames(completedProfile, tm, wd);
    const XS = f[0]?.XS || 1;
    setFrames(f);
    setPathPoints(pp);
    setFrameIdx(0);
    setBuilt(true);
    setPlaying(false);
    // Draw axes/ticks/labels first; only start animation when typewriter completes
    buildBackground(XS, () => {
      setPlaying(true);
    });
  }, [buildBackground]);

  const handleCyanKey = (e) => {
    if(e.key === "Enter") commitCyanInput();
  };

  // Auto-focus the input whenever the step changes, and on mount
  useEffect(() => {
    if(inputStep && inputRef.current) inputRef.current.focus();
  }, [inputStep]);

  useEffect(() => {
    if(inputRef.current) inputRef.current.focus();
  }, []);

  // BBC block cursor blink — 500ms
  const [cursorTick, setCursorTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCursorTick(t => t+1), 500);
    return () => clearInterval(id);
  }, []);


  const runSim = useCallback((overrideProfile) => {
    const wd  = Number(wdInput);
    const err = validateWD(wd);
    if(err){ setWdError(err); return; }
    setWdError("");

    const prof = overrideProfile || profile;
    const { frames: f, pathPoints: pp } = buildFrames(prof, timeMode, wd);

    const XS = f[0]?.XS || 1;
    buildBackground(XS);

    setFrames(f);
    setPathPoints(pp);
    setFrameIdx(0);
    setPlaying(true);
    setBuilt(true);
  }, [profile, timeMode, wdInput, buildBackground]);

  // Playback ticker
  useEffect(() => {
    if(playing){
      // TK = minutes per frame.
      // REAL mode: TK=1/32 min = 1875ms per frame at 1x speed.
      // ACCELERATED: TK=0.25 min but we use 10x as the baseline so
      //   1875ms / 10 = 187ms per frame at 1x speed.
      // Speed slider multiplies the rate (higher = faster).
      // We always advance 1 frame at a time and adjust the interval duration.
      const TK = timeMode === "REAL" ? 1/32 : 0.25;
      const msPerFrame = timeMode === "REAL"
        ? (TK * 60 * 1000) / speed          // REAL: true wall-clock ÷ speed
        : (TK * 60 * 1000) / (speed * 10);  // ACCEL: 10× faster baseline ÷ speed
      const interval = Math.max(16, Math.round(msPerFrame)); // min ~1 frame at 60fps

      intervalRef.current = setInterval(() => {
        setFrameIdx(i => {
          if(i >= frames.length - 1){ setPlaying(false); return frames.length - 1; }
          return i + 1; // always advance 1 frame; rate controlled by interval
        });
      }, interval);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, frames, speed, timeMode]);

  const currentFrame = frames[frameIdx] || null;

  const dbg = currentFrame ? {
    wd:       Number(wdInput),
    XS:       currentFrame.XS,
    TK:       timeMode==="REAL"?"1/32":"0.25",
    phase:    currentFrame.phase,
    cl:       currentFrame.cl.toFixed(2),
    ad:       currentFrame.ad.toFixed(1),
    bt:       currentFrame.bt.toFixed(2),
    ht:       currentFrame.ht,
    d5:       currentFrame.d5,
    stops:    currentFrame.stops.length,
    bracket:  pathPoints?.[currentFrame.pathLen-1]?.bracket ?? "?", // FIX-4
    frames:   frames.length,
    frameIdx,
  } : null;

  const prompt = inputStep ? CYAN_PROMPTS[inputStep] : null;

  // inputLine passed to DiveCanvas — drawn on canvas at BBCFONT(10,true)
  const inputLine = {
    prompt:   prompt ? prompt.label + " " : "INPUT COMPLETE",
    value:    prompt ? inputValue : "",
    cursorOn: prompt ? (cursorTick % 2 === 0) : false,
    error:    inputError || "",
  };

  return (
    <div style={{ fontFamily:'"Bedstead", "Share Tech Mono", monospace',
                  background:"#111", color:"#0f0", minHeight:"100vh", padding:"0.75rem" }}
         onClick={() => inputRef.current && inputRef.current.focus()}>

      {/* Hidden input captures keystrokes for the BBC-style cyan band */}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={e => { setInputValue(e.target.value.toUpperCase()); setInputError(""); }}
        onKeyDown={handleCyanKey}
        style={{ position:"fixed", opacity:0, width:1, height:1, pointerEvents:"none" }}
      />

      {/* Canvas — input text drawn on it directly at matching font size */}
      {built
        ? <DiveCanvas frame={currentFrame} bgImageRef={bgImageRef}
            pathPoints={pathPoints} wdInput={wdInput}
            bgVersion={bgVersion} inputLine={inputLine} />
        : <DiveCanvas frame={null} bgImageRef={bgImageRef}
            pathPoints={null} wdInput={wdInput}
            bgVersion={bgVersion} inputLine={inputLine} />
      }
    </div>
  );
}
