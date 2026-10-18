const STATIONS = [
  // ─── RED LINE / ORANGE LINE (IIT Kanpur to Naubasta) ───────────────────────
  { id: "ST01", name: "IIT Kanpur",          line: 1, lineColor: "#ef9f44", lineName: "Red Line", sequence: 1,  lat: 26.5090342, lng: 80.2485707, interchange: false, zone: 1, facilities: ["Parking", "ATM", "Lift"] },
  { id: "ST02", name: "Kalyanpur",           line: 1, lineColor: "#ef9f44", lineName: "Red Line", sequence: 2,  lat: 26.5036991, lng: 80.2525046, interchange: false, zone: 1, facilities: ["Parking", "ATM"] },
  { id: "ST03", name: "SPM Hospital",        line: 1, lineColor: "#ef9f44", lineName: "Red Line", sequence: 3,  lat: 26.4991030, lng: 80.2588930, interchange: false, zone: 1, facilities: ["ATM", "Lift"] },
  { id: "ST04", name: "CSJM Vishwavidyalaya",line: 1, lineColor: "#ef9f44", lineName: "Red Line", sequence: 4,  lat: 26.4968940, lng: 80.2672500, interchange: false, zone: 1, facilities: ["ATM", "Lift"] },
  { id: "ST05", name: "Gurudev Chauraha",    line: 1, lineColor: "#ef9f44", lineName: "Red Line", sequence: 5,  lat: 26.4915450, lng: 80.2849060, interchange: false, zone: 1, facilities: ["ATM", "Lift"] },
  { id: "ST06", name: "Geeta Nagar",         line: 1, lineColor: "#ef9f44", lineName: "Red Line", sequence: 6,  lat: 26.4871360, lng: 80.2917070, interchange: false, zone: 1, facilities: ["ATM", "Lift"] },
  { id: "ST07", name: "Rawatpur",            line: 1, lineColor: "#ef9f44", lineName: "Red Line", sequence: 7,  lat: 26.4829840, lng: 80.3002840, interchange: true,  zone: 1, facilities: ["Parking", "ATM", "Lift", "Food Court"] },
  { id: "ST08", name: "LLR Hospital",        line: 1, lineColor: "#ef9f44", lineName: "Red Line", sequence: 8,  lat: 26.4792579, lng: 80.3116227, interchange: false, zone: 2, facilities: ["ATM"] },
  { id: "ST09", name: "Motijheel",           line: 1, lineColor: "#ef9f44", lineName: "Red Line", sequence: 9,  lat: 26.4791023, lng: 80.3182339, interchange: false, zone: 2, facilities: ["Parking", "ATM", "Lift", "Food Court"] },
  { id: "ST10", name: "Chunniganj",          line: 1, lineColor: "#ef9f44", lineName: "Red Line", sequence: 10, lat: 26.4771194, lng: 80.3369874, interchange: false, zone: 2, facilities: ["ATM", "Lift"] },
  { id: "ST11", name: "Naveen Market",       line: 1, lineColor: "#ef9f44", lineName: "Red Line", sequence: 11, lat: 26.4739736, lng: 80.3452912, interchange: false, zone: 2, facilities: ["ATM"] },
  { id: "ST12", name: "Bada Chauraha",       line: 1, lineColor: "#ef9f44", lineName: "Red Line", sequence: 12, lat: 26.4674000, lng: 80.3518000, interchange: false, zone: 2, facilities: ["ATM", "Lift"] },
  { id: "ST13", name: "Nayaganj",            line: 1, lineColor: "#ef9f44", lineName: "Red Line", sequence: 13, lat: 26.4621000, lng: 80.3572000, interchange: false, zone: 3, facilities: ["Parking", "ATM"] },
  { id: "ST14", name: "Kanpur Central",      line: 1, lineColor: "#ef9f44", lineName: "Red Line", sequence: 14, lat: 26.4539000, lng: 80.3515000, interchange: true,  zone: 3, facilities: ["ATM", "Lift", "Food Court"] },
  { id: "ST15", name: "Naubasta",            line: 1, lineColor: "#ef9f44", lineName: "Red Line", sequence: 15, lat: 26.4056000, lng: 80.3867000, interchange: false, zone: 3, facilities: ["Parking", "ATM", "Lift"] },

  // ─── BLUE LINE (CSA Agriculture University to Barra-8) ─────────────────────
  { id: "ST16", name: "Barra-8",             line: 2, lineColor: "#3B82F6", lineName: "Blue Line", sequence: 1,  lat: 26.4123000, lng: 80.2890000, interchange: false, zone: 3, facilities: ["Parking", "ATM"] },
  { id: "ST17", name: "Barra-7",             line: 2, lineColor: "#3B82F6", lineName: "Blue Line", sequence: 2,  lat: 26.4234000, lng: 80.2934000, interchange: false, zone: 2, facilities: ["ATM", "Lift"] },
  { id: "ST18", name: "Vijay Nagar",         line: 2, lineColor: "#3B82F6", lineName: "Blue Line", sequence: 3,  lat: 26.4456000, lng: 80.3012000, interchange: false, zone: 2, facilities: ["ATM"] },
  { id: "ST19", name: "Rawatpur (Blue)",     line: 2, lineColor: "#3B82F6", lineName: "Blue Line", sequence: 4,  lat: 26.4785000, lng: 80.2523000, interchange: true,  zone: 1, facilities: ["Parking", "ATM", "Lift"] },
  { id: "ST20", name: "Kakadeo",             line: 2, lineColor: "#3B82F6", lineName: "Blue Line", sequence: 5,  lat: 26.4912000, lng: 80.2401000, interchange: false, zone: 1, facilities: ["ATM", "Lift"] },
  { id: "ST21", name: "CSA University",      line: 2, lineColor: "#3B82F6", lineName: "Blue Line", sequence: 6,  lat: 26.5045000, lng: 80.2289000, interchange: false, zone: 1, facilities: ["Parking", "ATM"] },
];

const FARE_SLABS = [
  { maxKm: 2, fare: 10 },
  { maxKm: 5, fare: 20 },
  { maxKm: 12, fare: 30 },
  { maxKm: 21, fare: 40 },
  { maxKm: 32, fare: 50 },
  { maxKm: Infinity, fare: 60 },
];

const TRAIN_SPEED_KMH = 35;
const HALT_TIME_MS = 15000;

module.exports = { STATIONS, FARE_SLABS, TRAIN_SPEED_KMH, HALT_TIME_MS };