const express = require("express");
const router = express.Router();
const { STATIONS } = require("../data/stations");
const {
  haversineDistance,
  calculateFare,
  routeDistance,
  estimateTravelTime,
} = require("../utils");

// ─── GET /api/stations ────────────────────────────────────────────────────────
// Returns all station data
router.get("/stations", (req, res) => {
  res.json({
    success: true,
    count: STATIONS.length,
    data: STATIONS,
  });
});

// ─── GET /api/trains ─────────────────────────────────────────────────────────
// Returns current train positions (also emitted via WebSocket every second)
router.get("/trains", (req, res) => {
  const simulator = req.app.get("simulator");
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data: simulator.getTrainPositions(),
  });
});

// ─── GET /api/arrivals ───────────────────────────────────────────────────────
// Returns arrival board data for all stations
router.get("/arrivals", (req, res) => {
  const simulator = req.app.get("simulator");
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data: simulator.getArrivalBoard(),
  });
});

// ─── POST /api/route ─────────────────────────────────────────────────────────
// Route planner: calculate path, distance, time, and fare
// Body: { fromId: "ST01", toId: "ST06" }
router.post("/route", (req, res) => {
  const { fromId, toId } = req.body;

  if (!fromId || !toId) {
    return res.status(400).json({ success: false, error: "fromId and toId are required" });
  }

  const fromStation = STATIONS.find((s) => s.id === fromId);
  const toStation = STATIONS.find((s) => s.id === toId);

  if (!fromStation || !toStation) {
    return res.status(404).json({ success: false, error: "Station not found" });
  }

  if (fromId === toId) {
    return res.status(400).json({ success: false, error: "Source and destination are the same" });
  }

  // ─── Build route ────────────────────────────────────────────────────────
  let routeStations = [];
  let requiresInterchange = false;
  let interchangeStation = null;

  if (fromStation.line === toStation.line) {
    // ── Same line: direct route ──────────────────────────────────────────
    const lineStations = STATIONS.filter((s) => s.line === fromStation.line).sort(
      (a, b) => a.sequence - b.sequence
    );
    const fromIdx = lineStations.findIndex((s) => s.id === fromId);
    const toIdx = lineStations.findIndex((s) => s.id === toId);
    const [start, end] = fromIdx < toIdx ? [fromIdx, toIdx] : [toIdx, fromIdx];
    routeStations = lineStations.slice(start, end + 1);
    if (fromIdx > toIdx) routeStations.reverse();
  } else {
    // ── Different lines: find interchange station ────────────────────────
    requiresInterchange = true;

    // Find interchange stations on both lines
    const line1Stations = STATIONS.filter((s) => s.line === fromStation.line).sort(
      (a, b) => a.sequence - b.sequence
    );
    const line2Stations = STATIONS.filter((s) => s.line === toStation.line).sort(
      (a, b) => a.sequence - b.sequence
    );

    // Find common interchange (stations with same name on both lines = interchange)
    let bestInterchange = null;
    let bestDistance = Infinity;

    for (const s1 of line1Stations) {
      for (const s2 of line2Stations) {
        // Interchange stations have the same name and interchange: true
        if (s1.name === s2.name && s1.interchange && s2.interchange) {
          const d = haversineDistance(fromStation.lat, fromStation.lng, s1.lat, s1.lng) +
                    haversineDistance(s2.lat, s2.lng, toStation.lat, toStation.lng);
          if (d < bestDistance) {
            bestDistance = d;
            bestInterchange = { line1: s1, line2: s2 };
          }
        }
      }
    }

    if (!bestInterchange) {
      // No interchange found — compute direct distance as fallback
      const dist = haversineDistance(
        fromStation.lat, fromStation.lng, toStation.lat, toStation.lng
      );
      const fare = calculateFare(dist);
      return res.json({
        success: true,
        data: {
          from: fromStation,
          to: toStation,
          routeStations: [fromStation, toStation],
          totalDistance: parseFloat(dist.toFixed(2)),
          travelTime: estimateTravelTime(dist, 2),
          fare,
          requiresInterchange: false,
          interchangeStation: null,
        },
      });
    }

    interchangeStation = bestInterchange.line1;

    // Segment 1: fromStation → interchange (on from's line)
    const fromIdx1 = line1Stations.findIndex((s) => s.id === fromId);
    const intIdx1 = line1Stations.findIndex((s) => s.id === bestInterchange.line1.id);
    const [s1, e1] = fromIdx1 <= intIdx1 ? [fromIdx1, intIdx1] : [intIdx1, fromIdx1];
    let seg1 = line1Stations.slice(s1, e1 + 1);
    if (fromIdx1 > intIdx1) seg1.reverse();

    // Segment 2: interchange → toStation (on to's line)
    const intIdx2 = line2Stations.findIndex((s) => s.id === bestInterchange.line2.id);
    const toIdx2 = line2Stations.findIndex((s) => s.id === toId);
    const [s2, e2] = intIdx2 <= toIdx2 ? [intIdx2, toIdx2] : [toIdx2, intIdx2];
    let seg2 = line2Stations.slice(s2, e2 + 1);
    if (intIdx2 > toIdx2) seg2.reverse();

    // Combine — avoid duplicating interchange station
    routeStations = [...seg1, ...seg2.slice(1)];
  }

  // ─── Calculations ────────────────────────────────────────────────────────
  const totalDistance = routeDistance(routeStations);
  const travelTime = estimateTravelTime(totalDistance, routeStations.length);
  const fare = calculateFare(totalDistance);

  res.json({
    success: true,
    data: {
      from: fromStation,
      to: toStation,
      routeStations,
      totalDistance: parseFloat(totalDistance.toFixed(2)),
      travelTime,
      fare,
      requiresInterchange,
      interchangeStation,
      stationCount: routeStations.length,
    },
  });
});

module.exports = router;