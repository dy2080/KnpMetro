const BASE = "http://localhost:4000/api";

export async function fetchStations() {
  const res = await fetch(`${BASE}/stations`);
  const json = await res.json();
  return json.data;
}

export async function planRoute(fromId, toId) {
  const res = await fetch(`${BASE}/route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fromId, toId }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export function formatEta(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function occupancyColor(pct) {
  if (pct < 50) return "#10b981";
  if (pct < 80) return "#f59e0b";
  return "#ef4444";
}