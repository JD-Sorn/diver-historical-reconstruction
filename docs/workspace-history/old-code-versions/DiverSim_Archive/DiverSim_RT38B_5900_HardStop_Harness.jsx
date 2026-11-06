import React from "react";

/*
RT-38B isolated GOSUB 5900 hard-stop harness
DIVER.BAS lines 5900-5999
Controlled state deliberately bypasses the main-loop GOSUB 6750 protection
so that source line 5931 itself can be exercised.

Test state:
  AD = 40
  CL = 30
  PA(1,1)=WORK(3)
  PA(1,2)=1
  PA(1,3)=40
  PA(1,4)=40
  PA(1,5)=2

At 40m, I=(40-7 INT first)/2 = 16.5, array row truncates to 16.
DT row 16 = 11,17,20,22,24,25,999.
CL=30 is already beyond every usable entry, so the J search must reach
999 and execute source line 5931 STOP.
*/

const DT = [
  null,
  [null,232,431,999,999,999,999,999],
  [null,137,140,159,179,201,229,270],
  [null,96,98,106,116,125,134,144],
  [null,72,73,81,88,94,99,105],
  [null,57,59,66,71,76,80,84],
  [null,46,49,55,60,63,67,70],
  [null,38,42,47,51,55,58,999],
  [null,32,37,41,45,48,51,999],
  [null,27,32,37,40,43,45,999],
  [null,23,29,33,36,39,41,999],
  [null,20,25,30,33,35,37,999],
  [null,18,23,27,30,32,34,999],
  [null,16,21,25,28,30,31,999],
  [null,14,20,23,26,27,29,999],
  [null,12,18,21,24,26,27,999],
  [null,11,17,20,22,24,25,999],
  [null,10,16,19,21,22,24,999],
  [null,9,15,18,20,21,999,999],
  [null,8,14,17,18,20,999,999],
  [null,8,13,16,17,999,999,999],
  [null,7,12,15,17,999,999,999],
];

function run5900HardStopTest() {
  const AD = 40;
  const CL = 30;
  const PA = Array.from({ length: 9 }, () => Array(6).fill(0));
  let PA_scalar = 1;

  PA[1][1] = 3;
  PA[1][2] = 1;
  PA[1][3] = 40;
  PA[1][4] = 40;
  PA[1][5] = 2;

  if (AD < 10) {
    return { status: "bypass", AD, CL, PA_scalar };
  }

  const TT = PA[1][2];
  let I = Math.floor(PA[1][3] - 7) / 2;
  if (I > 21) I = 21;
  const row = Math.trunc(I);

  let J = null;
  for (let j = 1; j <= 7; j++) {
    const v = DT[row]?.[j];
    if (v === 999 || v === undefined) {
      return {
        status: "hard-stop",
        sourceExit: "5931 STOP",
        AD, CL, TT, I, row, J: j, K: null, PA_scalar,
        rowValues: DT[row].slice(1),
        reason: `CL=${CL} is beyond every usable DT row-${row} boundary; J-search reached sentinel 999 at column ${j}.`
      };
    }
    if (CL <= v) {
      J = j;
      break;
    }
  }

  if (J === null) {
    return {
      status: "hard-stop",
      sourceExit: "5931 STOP",
      AD, CL, TT, I, row, J: null, K: null, PA_scalar,
      rowValues: DT[row].slice(1),
      reason: "J-search exhausted without a qualifying boundary."
    };
  }

  return {
    status: "UNEXPECTED-NOT-HARD-STOP",
    AD, CL, TT, I, row, J, PA_scalar,
    rowValues: DT[row].slice(1)
  };
}

export default function DiverSim_RT38B_5900_HardStop_Harness() {
  const result = run5900HardStopTest();
  const pass = result.status === "hard-stop" && result.sourceExit === "5931 STOP";

  return (
    <div style={{
      background: "#050505",
      color: "#f2f2f2",
      minHeight: "100vh",
      padding: 24,
      fontFamily: "monospace",
      lineHeight: 1.55
    }}>
      <h2>RT-38B — isolated GOSUB 5900 line 5931 test</h2>
      <div style={{ fontSize: 22, marginBottom: 18 }}>
        RESULT: <strong>{pass ? "PASS" : "FAIL"}</strong>
      </div>
      <pre style={{ whiteSpace: "pre-wrap", fontSize: 16 }}>
{`status=${result.status}
sourceExit=${result.sourceExit ?? "-"}
AD=${result.AD}
CL=${result.CL}
TT=${result.TT}
I=${result.I}
row=${result.row}
J=${result.J}
K=${result.K}
PA_scalar=${result.PA_scalar}
DT row=${result.rowValues?.join(",")}
reason=${result.reason ?? "-"}`}
      </pre>
      <p>
        Expected PASS signature: <b>status=hard-stop</b>, <b>sourceExit=5931 STOP</b>,
        row 16, sentinel reached at J=7.
      </p>
      <p>
        This harness intentionally does not run the main-loop GOSUB 6750 path.
        In the full simulation that earlier protection can halt the dive before
        GOSUB 5900 is naturally reached with CL already beyond the same table row.
      </p>
    </div>
  );
}
