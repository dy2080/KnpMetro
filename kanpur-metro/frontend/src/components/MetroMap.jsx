import React, { useEffect, useRef } from "react";
import L from "leaflet";

// Fix default icon paths broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Custom SVG Icons ──────────────────────────────────────────────────────────

function trainIcon(color, name, direction) {
  const arrow = direction === 1 ? "▲" : "▼";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="52" height="32" viewBox="0 0 52 32">
      <rect x="2" y="4" width="48" height="24" rx="6" fill="${color}" stroke="white" stroke-width="1.5"/>
      <text x="26" y="14" text-anchor="middle" fill="white" font-size="7" font-weight="bold" font-family="monospace">${name}</text>
      <text x="26" y="25" text-anchor="middle" fill="white" font-size="9">${arrow}</text>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [52, 32],
    iconAnchor: [26, 16],
  });
}

function stationIcon(color, isInterchange, isSelected) {
  const size = isInterchange ? 14 : 10;
  const borderW = isSelected ? 3 : 2;
  const borderColor = isSelected ? "#ffffff" : "rgba(255,255,255,0.7)";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size + 8}" height="${size + 8}" viewBox="0 0 ${size + 8} ${size + 8}">
      <circle cx="${(size + 8) / 2}" cy="${(size + 8) / 2}" r="${size / 2}" 
        fill="${color}" stroke="${borderColor}" stroke-width="${borderW}"/>
      ${isInterchange ? `<circle cx="${(size + 8) / 2}" cy="${(size + 8) / 2}" r="${size / 2 - 4}" fill="white" opacity="0.4"/>` : ""}
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size + 8, size + 8],
    iconAnchor: [(size + 8) / 2, (size + 8) / 2],
  });
}

export default function MetroMap({
  stations,
  trains,
  selectedRoute,
  onStationClick,
  theme,
}) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const trainMarkersRef = useRef({});
  const stationMarkersRef = useRef({});
  const routeLayerRef = useRef(null);
  const lineLayersRef = useRef([]);

  // ── Initialize map ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: [26.4685, 80.2985],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    // Tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 18,
    }).addTo(map);

    // Custom zoom control (top-right)
    L.control.zoom({ position: "topright" }).addTo(map);

    leafletMap.current = map;
    return () => { map.remove(); leafletMap.current = null; };
  }, []);

  // ── Draw metro lines ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!leafletMap.current || !stations.length) return;

    // Clear old lines
    lineLayersRef.current.forEach((l) => l.remove());
    lineLayersRef.current = [];

    const lineGroups = {};
    for (const s of stations) {
      if (!lineGroups[s.line]) lineGroups[s.line] = [];
      lineGroups[s.line].push(s);
    }

    for (const [line, stns] of Object.entries(lineGroups)) {
      const sorted = [...stns].sort((a, b) => a.sequence - b.sequence);
      const coords = sorted.map((s) => [s.lat, s.lng]);
      const color = sorted[0].lineColor;

      // Shadow/glow effect (thick dim line under)
      const glow = L.polyline(coords, {
        color: color,
        weight: 8,
        opacity: 0.15,
        smoothFactor: 1,
      }).addTo(leafletMap.current);

      const line_ = L.polyline(coords, {
        color: color,
        weight: 3.5,
        opacity: 0.85,
        smoothFactor: 1,
      }).addTo(leafletMap.current);

      lineLayersRef.current.push(glow, line_);
    }
  }, [stations]);

  // ── Draw/update station markers ────────────────────────────────────────────
  useEffect(() => {
    if (!leafletMap.current || !stations.length) return;

    const routeIds = new Set(selectedRoute?.routeStations?.map((s) => s.id) || []);

    for (const station of stations) {
      const isSelected = routeIds.has(station.id);
      const icon = stationIcon(station.lineColor, station.interchange, isSelected);

      if (stationMarkersRef.current[station.id]) {
        stationMarkersRef.current[station.id].setIcon(icon);
      } else {
        const marker = L.marker([station.lat, station.lng], { icon, zIndexOffset: 100 });
        marker.bindTooltip(
          `<div style="font-family:monospace;font-size:12px;font-weight:bold">
            ${station.name}
            <br/><span style="color:${station.lineColor}">${station.lineName}</span>
            ${station.interchange ? "<br/>🔄 Interchange" : ""}
          </div>`,
          { permanent: false, direction: "top", offset: [0, -8] }
        );
        marker.on("click", () => onStationClick && onStationClick(station));
        marker.addTo(leafletMap.current);
        stationMarkersRef.current[station.id] = marker;
      }
    }
  }, [stations, selectedRoute, onStationClick]);

  // ── Draw selected route highlight ──────────────────────────────────────────
  useEffect(() => {
    if (!leafletMap.current) return;

    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    if (selectedRoute?.routeStations?.length > 1) {
      const coords = selectedRoute.routeStations.map((s) => [s.lat, s.lng]);

      const routeLine = L.polyline(coords, {
        color: "#ffffff",
        weight: 5,
        opacity: 0.9,
        dashArray: "10, 6",
        lineCap: "round",
      }).addTo(leafletMap.current);

      routeLayerRef.current = routeLine;

      // Fit map to route
      leafletMap.current.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
    }
  }, [selectedRoute]);

  // ── Update train markers ───────────────────────────────────────────────────
  useEffect(() => {
    if (!leafletMap.current || !trains.length) return;

    for (const train of trains) {
      const icon = trainIcon(train.color, train.name, train.direction);

      if (trainMarkersRef.current[train.id]) {
        // Smooth position update using Leaflet's setLatLng (animated by CSS)
        trainMarkersRef.current[train.id].setLatLng([train.lat, train.lng]);
        trainMarkersRef.current[train.id].setIcon(icon);
        // Update tooltip
        trainMarkersRef.current[train.id].setTooltipContent(trainTooltip(train));
      } else {
        const marker = L.marker([train.lat, train.lng], {
          icon,
          zIndexOffset: 500,
        });
        marker.bindTooltip(trainTooltip(train), {
          permanent: false,
          direction: "top",
          offset: [0, -18],
        });
        marker.addTo(leafletMap.current);
        trainMarkersRef.current[train.id] = marker;
      }
    }

    // Remove markers for trains no longer in list
    const currentIds = new Set(trains.map((t) => t.id));
    for (const id in trainMarkersRef.current) {
      if (!currentIds.has(id)) {
        trainMarkersRef.current[id].remove();
        delete trainMarkersRef.current[id];
      }
    }
  }, [trains]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%", borderRadius: "0" }}
    />
  );
}

function trainTooltip(train) {
  return `
    <div style="font-family:monospace;font-size:11px;line-height:1.6">
      <b style="color:${train.color}">${train.name}</b> · ${train.lineName}<br/>
      📍 ${train.currentStation || "En Route"}<br/>
      ⏭ ${train.nextStation || "—"}<br/>
      🚄 ${train.speed} km/h · ${train.status}<br/>
      👥 ${train.occupancy}/${train.capacity} (${train.occupancyPercent}%)
    </div>`;
}