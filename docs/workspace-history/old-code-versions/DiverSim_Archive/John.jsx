import { useState, useEffect, useRef } from "react";

export default function App() {

  // declarations
  // initialisations
  
  // lines 1 - 100
  //1 REM DIVER, 100 CLEAR 20
  
  // lines 1461 - 2200
  function mainLoop() {
    console.log("Dummy function called");
  }

  useEffect(() => {
    const timer = setInterval(mainLoop, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <h1>Done</h1>
  );
}