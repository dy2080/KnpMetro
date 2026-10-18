const { FARE_SLABS, TRAIN_SPEED_KMH } = require("./data/stations");

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function interpolatePosition(lat1, lng1, lat2, lng2, t) {
  return {
    lat: lat1 + (lat2 - lat1) * t,
    lng: lng1 + (lng2 - lng1) * t,
  };
}

function calculateFare(distanceKm) {
  for (const slab of FARE_SLABS) {
    if (distanceKm <= slab.maxKm) {
      return slab.fare;
    }
  }
  return FARE_SLABS[FARE_SLABS.length - 1].fare;
}

function routeDistance(stations) {
  let total = 0;
  for (let i = 0; i < stations.length - 1; i++) {
    total += haversineDistance(
      stations[i].lat,
      stations[i].lng,
      stations[i + 1].lat,
      stations[i + 1].lng
    );
  }
  return total;
}

function estimateTravelTime(distanceKm, numStops) {
  const travelMinutes = (distanceKm / TRAIN_SPEED_KMH) * 60;
  const haltMinutes = (numStops - 1) * 0.25;
  return Math.ceil(travelMinutes + haltMinutes);
}

module.exports = {
  haversineDistance,
  interpolatePosition,
  calculateFare,
  routeDistance,
  estimateTravelTime,
};