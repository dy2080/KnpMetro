import React from "react";
import { occupancyColor } from "../utils/api";

export default function TrainPanel({ trains }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      <div style={{
        padding: "12px 16px 8px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: "8px",
      }}>
        <span style={{ fontSize: "11px", fontFamily: "var(--font-display)", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
          ACTIVE TRAINS
        </span>
        <span style={{
          background: "var(--green-dim)", color: "var(--green)",
          fontSize: "10px", fontWeight: "600", padding: "2px 6px",
          borderRadius: "10px",
        }}>{trains.length}</span>
      </div>

      <div style={{ overflowY: "auto", maxHeight: "280px" }}>
        {trains.map((train) => (
          <TrainCard key={train.id} train={train} />
        ))}
      </div>
    </div>
  );
}

function TrainCard({ train }) {
  const occColor = occupancyColor(train.occupancyPercent);

  return (
    <div style={{
      padding: "10px 16px",
      borderBottom: "1px solid var(--border)",
      transition: "background 0.15s",
      cursor: "default",
    }}
    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-card-hover)"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      {/* Train name + line */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: train.color,
            boxShadow: `0 0 6px ${train.color}`,
          }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: "700" }}>
            {train.name}
          </span>
        </div>
        <StatusBadge status={train.status} />
      </div>

      {/* Station info */}
      <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: "8px" }}>
        {train.status === "At Station" ? (
          <span>🚉 {train.currentStation}</span>
        ) : (
          <span>→ {train.nextStation || "—"}</span>
        )}
      </div>

      {/* Speed + occupancy */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <div style={{
          fontSize: "10px", color: "var(--text-muted)",
          fontFamily: "var(--font-display)",
        }}>
          {train.speed} km/h
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            height: "3px", borderRadius: "2px",
            background: "var(--border-accent)",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${train.occupancyPercent}%`,
              background: occColor,
              borderRadius: "2px",
              transition: "width 1s ease",
            }} />
          </div>
        </div>
        <div style={{ fontSize: "10px", color: occColor, minWidth: "30px" }}>
          {train.occupancyPercent}%
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const isAtStation = status === "At Station";
  return (
    <span style={{
      fontSize: "9px",
      fontFamily: "var(--font-display)",
      letterSpacing: "0.06em",
      padding: "2px 6px",
      borderRadius: "6px",
      background: isAtStation ? "var(--amber-dim)" : "var(--green-dim)",
      color: isAtStation ? "var(--amber)" : "var(--green)",
    }}>
      {isAtStation ? "HALTED" : "MOVING"}
    </span>
  );
}