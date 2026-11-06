import { useState } from "react";

import MainApplication from "./App/MainApplication";
import { SANDBOX } from "./sandbox/registry";
import SandboxSwitcher from "./sandbox/SandboxSwitcher";

export default function App() {

  const [mode, setMode] = useState(
  localStorage.getItem("sandboxMode") || "MAIN"
);

  const SandboxComponent = SANDBOX[mode];

function changeMode(newMode) {
  localStorage.setItem("sandboxMode", newMode);
  setMode(newMode);
}

  return (
    <>
		<SandboxSwitcher
		  mode={mode}
		  setMode={changeMode}
		  sandboxNames={Object.keys(SANDBOX)}
		/>

      {SandboxComponent
        ? <SandboxComponent />
        : <MainApplication />
      }
    </>
  );
}