export default function SandboxSwitcher({ mode, setMode, sandboxNames }) {
  return (
    <div style={{
      padding: "8px",
      background: "#222",
      color: "white"
    }}>
      <label>
        Sandbox:
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          style={{ marginLeft: "8px" }}
        >
          <option value="MAIN">MAIN</option>

          {sandboxNames.map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}