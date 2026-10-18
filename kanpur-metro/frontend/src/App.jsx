import React, { useState, useEffect } from "react";
import MetroMap from "./components/MetroMap";
import Header from "./components/Header";
import TrainPanel from "./components/TrainPanel";
import ArrivalBoard from "./components/arrivalBoard";
import RoutePlanner from "./components/RoutePlanner";
import StatsBar from "./components/StatsBar";
import { useMetroSocket } from "./hooks/useMetroSocket";
import { fetchStations } from "./utils/api";

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [stations, setStations] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [activeTab, setActiveTab] = useState("arrivals");
  const { trains, arrivalBoard, connected, lastUpdate } = useMetroSocket();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    fetchStations().then(setStations).catch(console.error);
  }, []);

  const sidebarStyle = {
    width: "320px",
    flexShrink: 0,
    background: "var(--bg-card)",
    borderLeft: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const tabStyle = (active) => ({
    flex: 1,
    padding: "10px 4px",
    border: "none",
    cursor: "pointer",
    background: "transparent",
    fontSize: "10px",
    fontFamily: "var(--font-display)",
    letterSpacing: "0.06em",
    color: active ? "var(--text-primary)" : "var(--text-muted)",
    borderBottom: active ? "2px solid var(--blue)" : "2px solid transparent",
    transition: "all 0.2s",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Header
        connected={connected}
        lastUpdate={lastUpdate}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left Sidebar */}
        <div style={{ ...sidebarStyle, borderLeft: "none", borderRight: "1px solid var(--border)" }}>
          <TrainPanel trains={trains} />
          <div style={{ borderTop: "1px solid var(--border)", flex: 1, overflowY: "auto" }}>
            <RoutePlanner stations={stations} onRoute={setSelectedRoute} />
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: "relative" }}>
          <MetroMap
            stations={stations}
            trains={trains}
            selectedRoute={selectedRoute}
            theme={theme}
          />
        </div>

        {/* Right Sidebar */}
        <div style={sidebarStyle}>
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            <button style={tabStyle(activeTab === "arrivals")} onClick={() => setActiveTab("arrivals")}>ARRIVALS</button>
            <button style={tabStyle(activeTab === "stations")} onClick={() => setActiveTab("stations")}>STATIONS</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <ArrivalBoard stations={stations} arrivalBoard={arrivalBoard} />
          </div>
        </div>
      </div>

      <StatsBar trains={trains} stations={stations} connected={connected} />
    </div>
  );
}