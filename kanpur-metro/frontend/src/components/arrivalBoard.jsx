import React, { useState } from "react";
import { formatEta } from "../utils/api";

export default function ArrivalBoard({ stations, arrivalBoard, onStationSelect }) {
  const [selectedLine, setSelectedLine] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = stations.filter((s) => {
    const lineMatch = selectedLine === "all" || String(s.line) === selectedLine;
    const searchMatch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    return lineMatch && searchMatch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px 10px",
        borderBottom: "1px solid var(--border)",
        display: "flex", flexDirection: "column", gap: "8px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontFamily: "var(--font-display)", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
            ARRIVAL BOARD
          </span>
          <span style={{
            fontSize: "9px", padding: "2px 6px", borderRadius: "8px",
            background: "var(--blue-dim)", color: "var(--blue)",
            fontFamily: "var(--font-display)",
          }}>LIVE</span>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "6px" }}>
          {["all", "1", "2"].map((v) => (
            <button key={v}
              onClick={() => setSelectedLine(v)}
              style={{
                flex: 1, padding: "4px", borderRadius: "6px", cursor: "pointer",
                border: "1px solid var(--border)",
                background: selectedLine === v ? (v === "1" ? "var(--red-dim)" : v === "2" ? "var(--blue-dim)" : "var(--bg-secondary)") : "transparent",
                color: selectedLine === v ? (v === "1" ? "var(--red)" : v === "2" ? "var(--blue)" : "var(--text-primary)") : "var(--text-muted)",
                fontSize: "10px", fontWeight: "600",
                transition: "all 0.2s",
              }}
            >
              {v === "all" ? "All" : v === "1" ? "🔴 Red" : "🔵 Blue"}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search station..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "6px 10px", borderRadius: "6px",
            border: "1px solid var(--border)",
            background: "var(--bg-secondary)", color: "var(--text-primary)",
            fontSize: "11px", outline: "none", width: "100%",
          }}
        />
      </div>

      {/* Station list */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {filtered.map((station) => {
          const arrivals = arrivalBoard[station.id] || [];
          return (
            <StationRow
              key={station.id}
              station={station}
              arrivals={arrivals}
              onClick={() => onStationSelect && onStationSelect(station)}
            />
          );
        })}
      </div>
    </div>
  );
}

function StationRow({ station, arrivals, onClick }) {
  const next = arrivals[0];
  const second = arrivals[1];

  return (
    <div
      onClick={onClick}
      style={{
        padding: "10px 16px",
        borderBottom: "1px solid var(--border)",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-card-hover)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {/* Station name */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <div style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: station.lineColor, flexShrink: 0,
            }} />
            <span style={{ fontSize: "12px", fontWeight: "600" }}>{station.name}</span>
            {station.interchange && (
              <span style={{ fontSize: "9px", padding: "1px 4px", borderRadius: "4px", background: "var(--amber-dim)", color: "var(--amber)" }}>
                TRANSFER
              </span>
            )}
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", marginLeft: "12px" }}>
            Zone {station.zone} · {station.lineName}
          </div>
        </div>

        {/* Arrivals */}
        <div style={{ textAlign: "right", minWidth: "80px" }}>
          {next ? (
            <>
              <div style={{
                fontSize: "14px", fontWeight: "700",
                fontFamily: "var(--font-display)",
                color: next.etaSeconds < 60 ? "var(--green)" : "var(--text-primary)",
              }}>
                {next.etaSeconds < 10 ? "Now" : formatEta(next.etaSeconds)}
              </div>
              <div style={{ fontSize: "9px", color: next.color, marginTop: "1px" }}>
                {next.trainName} · {next.direction === "Forward" ? "↑" : "↓"}
              </div>
              {second && (
                <div style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: "3px" }}>
                  Then {formatEta(second.etaSeconds)}
                </div>
              )}
            </>
          ) : (
            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>No service</div>
          )}
        </div>
      </div>
    </div>
  );
}