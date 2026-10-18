import React from "react";

export default function StatsBar({ trains, stations, connected }) {
  const movingTrains = trains.filter((t) => !t.isHalted).length;
  const avgOccupancy = trains.length
    ? Math.round(trains.reduce((s, t) => s + t.occupancyPercent, 0) / trains.length)
    : 0;
  const avgSpeed = trains.length
    ? Math.round(trains.filter(t => !t.isHalted).reduce((s, t) => s + t.speed, 0) / (movingTrains || 1))
    : 0;

  return (
    <div style={{
      background: "var(--bg-card)",
      borderTop: "1px solid var(--border)",
      padding: "8px 20px",
      display: "flex",
      gap: "24px",
      alignItems: "center",
      flexShrink: 0,
      overflowX: "auto",
    }}>
      <Stat label="Stations" value={stations.length} />
      <Divider />
      <Stat label="Active Trains" value={trains.length} color="var(--green)" />
      <Stat label="Moving" value={movingTrains} color="var(--blue)" />
      <Stat label="Halted" value={trains.length - movingTrains} color="var(--amber)" />
      <Divider />
      <Stat label="Avg Speed" value={`${avgSpeed} km/h`} />
      <Stat label="Avg Load" value={`${avgOccupancy}%`} color={avgOccupancy > 70 ? "var(--red)" : "var(--text-primary)"} />
      <Divider />
      <Stat label="Red Line" value="Operational" color="#ef4444" />
      <Stat label="Blue Line" value="Operational" color="#3b82f6" />
      <div style={{ marginLeft: "auto", fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-display)", whiteSpace: "nowrap" }}>
        KMRCL © 2024
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: "9px", color: "var(--text-muted)", marginBottom: "2px", letterSpacing: "0.06em" }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: "13px", fontWeight: "600", color: color || "var(--text-primary)", fontFamily: "var(--font-display)" }}>
        {value}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: "1px", height: "28px", background: "var(--border)", flexShrink: 0 }} />;
}