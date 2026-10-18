const { STATIONS, HALT_TIME_MS, TRAIN_SPEED_KMH } = require("./data/stations");
const { haversineDistance, interpolatePosition } = require("./utils");

const TRAIN_CONFIGS = [
  { id: "T1", name: "KNP-101", line: 1, direction: 1, startStationIndex: 0, color: "#EF4444", lineName: "Red Line", capacity: 1200, occupancy: 450 },
  { id: "T2", name: "KNP-102", line: 1, direction: -1, startStationIndex: 11, color: "#EF4444", lineName: "Red Line", capacity: 1200, occupancy: 320 },
  { id: "T3", name: "KNP-201", line: 2, direction: 1, startStationIndex: 0, color: "#3B82F6", lineName: "Blue Line", capacity: 1000, occupancy: 280 },
  { id: "T4", name: "KNP-202", line: 2, direction: -1, startStationIndex: 5, color: "#3B82F6", lineName: "Blue Line", capacity: 1000, occupancy: 190 },
  { id: "T5", name: "KNP-103", line: 1, direction: 1, startStationIndex: 5, color: "#EF4444", lineName: "Red Line", capacity: 1200, occupancy: 550 },
];

class TrainSimulator {
  constructor() {
    this.trains = [];
    this.lineStations = this._buildLineStations();
    this._initTrains();
  }

  _buildLineStations() {
    const lines = {};
    for (const s of STATIONS) {
      if (!lines[s.line]) lines[s.line] = [];
      lines[s.line].push(s);
    }
    for (const line in lines) {
      lines[line].sort((a, b) => a.sequence - b.sequence);
    }
    return lines;
  }

  _initTrains() {
    this.trains = TRAIN_CONFIGS.map((config) => {
      const lineStations = this.lineStations[config.line];
      const station = lineStations[config.startStationIndex];
      return {
        ...config,
        lat: station.lat,
        lng: station.lng,
        currentStationIndex: config.startStationIndex,
        nextStationIndex: config.startStationIndex + config.direction,
        segmentProgress: 0,
        isHalted: true,
        haltStartTime: Date.now() - Math.random() * HALT_TIME_MS,
        haltDuration: HALT_TIME_MS,
        speed: 0,
        status: "At Station",
        currentStation: station.name,
        nextStation: this._getNextStationName(config.line, config.startStationIndex, config.direction),
      };
    });
  }

  _getNextStationName(line, currentIdx, direction) {
    const stations = this.lineStations[line];
    const nextIdx = currentIdx + direction;
    if (nextIdx >= 0 && nextIdx < stations.length) return stations[nextIdx].name;
    return null;
  }

  tick() {
    const now = Date.now();
    for (const train of this.trains) {
      const lineStations = this.lineStations[train.line];

      if (train.isHalted) {
        const elapsed = now - train.haltStartTime;
        if (elapsed >= train.haltDuration) {
          const nextIdx = train.currentStationIndex + train.direction;
          if (nextIdx < 0 || nextIdx >= lineStations.length) {
            train.direction *= -1;
          }
          train.nextStationIndex = train.currentStationIndex + train.direction;
          train.isHalted = false;
          train.segmentProgress = 0;
          train.speed = TRAIN_SPEED_KMH;
          train.status = "En Route";
          train.nextStation = lineStations[train.nextStationIndex]?.name || null;
        }
        continue;
      }

      const currentStation = lineStations[train.currentStationIndex];
      const nextStation = lineStations[train.nextStationIndex];
      if (!currentStation || !nextStation) continue;

      const segmentDistKm = haversineDistance(
        currentStation.lat, currentStation.lng,
        nextStation.lat, nextStation.lng
      );

      const progressPerSecond = TRAIN_SPEED_KMH / 3600 / segmentDistKm;
      train.segmentProgress += progressPerSecond;
      train.speed = TRAIN_SPEED_KMH + (Math.random() - 0.5) * 4;

      if (train.segmentProgress >= 1) {
        train.segmentProgress = 0;
        train.currentStationIndex = train.nextStationIndex;
        train.lat = nextStation.lat;
        train.lng = nextStation.lng;
        train.isHalted = true;
        train.haltStartTime = now;
        train.haltDuration = 10000 + Math.random() * 10000;
        train.speed = 0;
        train.status = "At Station";
        train.currentStation = nextStation.name;
        train.nextStation = this._getNextStationName(train.line, train.currentStationIndex, train.direction);
        const change = Math.floor(Math.random() * 80) - 40;
        train.occupancy = Math.max(0, Math.min(train.capacity, train.occupancy + change));
      } else {
        const pos = interpolatePosition(
          currentStation.lat, currentStation.lng,
          nextStation.lat, nextStation.lng,
          train.segmentProgress
        );
        train.lat = pos.lat;
        train.lng = pos.lng;
        train.currentStation = currentStation.name;
      }
    }
  }

  getTrainPositions() {
    return this.trains.map((t) => ({
      id: t.id,
      name: t.name,
      line: t.line,
      lineName: t.lineName,
      color: t.color,
      lat: t.lat,
      lng: t.lng,
      direction: t.direction,
      speed: Math.round(t.speed),
      status: t.status,
      currentStation: t.currentStation,
      nextStation: t.nextStation,
      isHalted: t.isHalted,
      occupancy: t.occupancy,
      capacity: t.capacity,
      occupancyPercent: Math.round((t.occupancy / t.capacity) * 100),
      segmentProgress: t.segmentProgress,
      currentStationIndex: t.currentStationIndex,
    }));
  }

  getArrivalBoard() {
    const board = {};
    for (const stationId of STATIONS.map((s) => s.id)) {
      board[stationId] = [];
    }

    for (const train of this.trains) {
      const lineStations = this.lineStations[train.line];
      let searchIdx = train.currentStationIndex;
      let etaSeconds = 0;

      if (!train.isHalted && train.nextStationIndex !== undefined) {
        const remaining = 1 - train.segmentProgress;
        const cur = lineStations[train.currentStationIndex];
        const nxt = lineStations[train.nextStationIndex];
        if (cur && nxt) {
          const distKm = haversineDistance(cur.lat, cur.lng, nxt.lat, nxt.lng);
          etaSeconds += (remaining * distKm * 3600) / TRAIN_SPEED_KMH;
        }
        searchIdx = train.nextStationIndex;
      } else {
        const elapsed = Date.now() - train.haltStartTime;
        etaSeconds += Math.max(0, (train.haltDuration - elapsed) / 1000);
      }

      let dir = train.direction;
      let idx = searchIdx;

      for (let step = 0; step < 6; step++) {
        if (idx < 0 || idx >= lineStations.length) break;
        const station = lineStations[idx];
        const stationData = STATIONS.find((s) => s.name === station.name && s.line === train.line);
        if (stationData) {
          board[stationData.id].push({
            trainId: train.id,
            trainName: train.name,
            line: train.line,
            lineName: train.lineName,
            color: train.color,
            etaSeconds: Math.round(etaSeconds),
            etaMinutes: (etaSeconds / 60).toFixed(1),
            direction: dir === 1 ? "Forward" : "Reverse",
          });
        }

        const nextIdx = idx + dir;
        if (nextIdx >= 0 && nextIdx < lineStations.length) {
          const distKm = haversineDistance(
            station.lat, station.lng,
            lineStations[nextIdx].lat, lineStations[nextIdx].lng
          );
          etaSeconds += (distKm / TRAIN_SPEED_KMH) * 3600 + HALT_TIME_MS / 1000;
        }
        idx += dir;
      }
    }

    for (const id in board) {
      board[id].sort((a, b) => a.etaSeconds - b.etaSeconds);
    }
    return board;
  }
}

module.exports = TrainSimulator;