import React from "react";

export default function Header({ connected, lastUpdate, theme, onToggleTheme }) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour12: false });

  return (
    <header style={{
      background: "var(--bg-card)",
      borderBottom: "1px solid var(--border-accent)",
      padding: "0 20px",
      height: "56px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",
      flexShrink: 0,
      zIndex: 100,
    }}>
      {/* Left: Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "8px",
          background: "linear-gradient(135deg, #ef4444, #3b82f6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "18px", fontWeight: "bold",
          fontFamily: "var(--font-display)",
        }}>M</div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: "700", letterSpacing: "0.05em" }}>
            KANPUR METRO
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em" }}>
            LIVE CONTROL DASHBOARD
          </div>
        </div>
      </div>

      {/* Center: Status indicators */}
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <StatusPill
          label="KMRCL"
          value="Operational"
          color="var(--green)"
        />
        <StatusPill
          label="Red Line"
          value="Active"
          color="#ef4444"
        />
        <StatusPill
          label="Blue Line"
          value="Active"
          color="#3b82f6"
        />
      </div>

      {/* Right: Connection + time + theme */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Connection status */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: connected ? "var(--green)" : "#ef4444",
            boxShadow: connected ? "0 0 8px var(--green)" : "0 0 8px #ef4444",
            animation: connected ? "pulse 2s infinite" : "none",
          }} />
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-display)" }}>
            {connected ? "LIVE" : "OFFLINE"}
          </span>
        </div>

        {/* Clock */}
        <div style={{
          fontFamily: "var(--font-display)", fontSize: "13px",
          color: "var(--text-secondary)", minWidth: "60px",
        }}>
          {timeStr}
        </div>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "6px 10px",
            cursor: "pointer",
            color: "var(--text-secondary)",
            fontSize: "14px",
            transition: "all 0.2s",
          }}
          title="Toggle dark/light mode"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </header>
  );
}

function StatusPill({ label, value, color }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "6px",
      background: "var(--bg-secondary)",
      border: "1px solid var(--border)",
      borderRadius: "20px",
      padding: "4px 10px",
      fontSize: "11px",
    }}>
      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: color }} />
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{value}</span>
    </div>
  );
}