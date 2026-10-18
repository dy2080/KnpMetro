import React, { useState } from "react";
import { planRoute } from "../utils/api";

export default function RoutePlanner({ stations, onRoute }) {
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const line1 = stations.filter((s) => s.line === 1);
  const line2 = stations.filter((s) => s.line === 2);

  async function handlePlan() {
    if (!fromId || !toId) { setError("Please select both stations"); return; }
    if (fromId === toId) { setError("Source and destination are the same"); return; }
    setError("");
    setLoading(true);
    try {
      const data = await planRoute(fromId, toId);
      setResult(data);
      onRoute(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setResult(null);
    setFromId("");
    setToId("");
    setError("");
    onRoute(null);
  }

  return (
    <div>
      <div style={{
        padding: "12px 16px 8px",
        borderBottom: "1px solid var(--border)",
      }}>
        <span style={{ fontSize: "11px", fontFamily: "var(--font-display)", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
          ROUTE PLANNER
        </span>
      </div>

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* From station */}
        <StationSelect
          label="FROM"
          value={fromId}
          onChange={setFromId}
          line1={line1}
          line2={line2}
          exclude={toId}
        />

        {/* Swap button */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => { const t = fromId; setFromId(toId); setToId(t); setResult(null); onRoute(null); }}
            style={{
              background: "var(--bg-secondary)", border: "1px solid var(--border)",
              borderRadius: "8px", padding: "4px 12px", cursor: "pointer",
              color: "var(--text-secondary)", fontSize: "16px",
              transition: "all 0.2s",
            }}
          >⇅</button>
        </div>

        {/* To station */}
        <StationSelect
          label="TO"
          value={toId}
          onChange={setToId}
          line1={line1}
          line2={line2}
          exclude={fromId}
        />

        {error && (
          <div style={{ fontSize: "11px", color: "var(--red)", background: "var(--red-dim)", padding: "6px 10px", borderRadius: "6px" }}>
            {error}
          </div>
        )}

        <button
          onClick={handlePlan}
          disabled={loading}
          style={{
            background: "linear-gradient(135deg, #ef4444, #3b82f6)",
            border: "none", borderRadius: "8px",
            color: "white", fontWeight: "600", fontSize: "12px",
            padding: "10px", cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1, transition: "all 0.2s",
            fontFamily: "var(--font-display)", letterSpacing: "0.05em",
          }}
        >
          {loading ? "CALCULATING..." : "FIND ROUTE"}
        </button>
      </div>

      {/* Result card */}
      {result && (
        <div style={{
          margin: "0 12px 12px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-accent)",
          borderRadius: "var(--radius-sm)",
          overflow: "hidden",
        }}>
          {/* Route header */}
          <div style={{
            padding: "10px 12px",
            background: result.requiresInterchange ? "var(--amber-dim)" : "var(--green-dim)",
            borderBottom: "1px solid var(--border)",
          }}>
            <div style={{ fontSize: "11px", fontWeight: "700", marginBottom: "2px" }}>
              {result.from.name} → {result.to.name}
            </div>
            {result.requiresInterchange && (
              <div style={{ fontSize: "10px", color: "var(--amber)" }}>
                🔄 Change at {result.interchangeStation?.name}
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            gap: "1px", background: "var(--border)",
          }}>
            <StatCell icon="📏" label="Distance" value={`${result.totalDistance} km`} />
            <StatCell icon="⏱" label="Time" value={`${result.travelTime} min`} />
            <StatCell icon="🎫" label="Fare" value={`₹${result.fare}`} highlight />
          </div>

          {/* Stops */}
          <div style={{ padding: "8px 12px" }}>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "6px" }}>
              {result.stationCount} STOPS
            </div>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: "4px",
            }}>
              {result.routeStations.map((s, i) => (
                <span key={s.id} style={{
                  fontSize: "10px",
                  color: i === 0 || i === result.routeStations.length - 1
                    ? "var(--text-primary)" : "var(--text-secondary)",
                  fontWeight: i === 0 || i === result.routeStations.length - 1 ? "600" : "400",
                }}>
                  {i > 0 && <span style={{ color: "var(--text-muted)", margin: "0 2px" }}>›</span>}
                  {s.name}
                </span>
              ))}
            </div>
          </div>

          <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border)" }}>
            <button
              onClick={handleClear}
              style={{
                background: "transparent", border: "1px solid var(--border)",
                borderRadius: "6px", padding: "4px 10px", cursor: "pointer",
                color: "var(--text-muted)", fontSize: "10px",
                fontFamily: "var(--font-display)",
              }}
            >CLEAR ROUTE</button>
          </div>
        </div>
      )}
    </div>
  );
}

function StationSelect({ label, value, onChange, line1, line2, exclude }) {
  return (
    <div>
      <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px", fontFamily: "var(--font-display)", letterSpacing: "0.06em" }}>
        {label}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", padding: "8px 10px", borderRadius: "8px",
          border: "1px solid var(--border-accent)",
          background: "var(--bg-secondary)", color: "var(--text-primary)",
          fontSize: "12px", outline: "none", cursor: "pointer",
          fontFamily: "var(--font-body)",
        }}
      >
        <option value="">Select station...</option>
        <optgroup label="🔴 Red Line">
          {line1.filter(s => s.id !== exclude).map((s) => (
            <option key={s.id} value={s.id}>{s.name}{s.interchange ? " 🔄" : ""}</option>
          ))}
        </optgroup>
        <optgroup label="🔵 Blue Line">
          {line2.filter(s => s.id !== exclude).map((s) => (
            <option key={s.id} value={s.id}>{s.name}{s.interchange ? " 🔄" : ""}</option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}

function StatCell({ icon, label, value, highlight }) {
  return (
    <div style={{
      padding: "10px 8px", background: "var(--bg-card)",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "14px", marginBottom: "2px" }}>{icon}</div>
      <div style={{ fontSize: "9px", color: "var(--text-muted)", marginBottom: "2px" }}>{label}</div>
      <div style={{
        fontSize: "13px", fontWeight: "700",
        color: highlight ? "var(--green)" : "var(--text-primary)",
        fontFamily: "var(--font-display)",
      }}>{value}</div>
    </div>
  );
}