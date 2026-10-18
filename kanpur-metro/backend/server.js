const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const TrainSimulator = require("./simulator");
const apiRoutes = require("./routes/api");

const app = express();
const server = http.createServer(app);

// ─── Socket.io setup ─────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins in dev; restrict in production
    methods: ["GET", "POST"],
  },
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Train Simulator ──────────────────────────────────────────────────────────
const simulator = new TrainSimulator();
app.set("simulator", simulator); // Make available to route handlers

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api", apiRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Kanpur Metro System API",
    version: "1.0.0",
    status: "Running",
    endpoints: ["/api/stations", "/api/trains", "/api/arrivals", "/api/route (POST)"],
  });
});

// ─── Real-Time Simulation Loop ────────────────────────────────────────────────
// Tick every 1 second → update train positions → broadcast via Socket.io
let tickCount = 0;

setInterval(() => {
  // Advance simulation
  simulator.tick();
  tickCount++;

  const trainData = simulator.getTrainPositions();

  // Broadcast train positions to all connected clients
  io.emit("trainUpdate", {
    timestamp: new Date().toISOString(),
    tick: tickCount,
    trains: trainData,
  });

  // Broadcast arrival board every 5 seconds (less frequent, more expensive)
  if (tickCount % 5 === 0) {
    const arrivalBoard = simulator.getArrivalBoard();
    io.emit("arrivalUpdate", {
      timestamp: new Date().toISOString(),
      board: arrivalBoard,
    });
  }
}, 1000);

// ─── WebSocket Connection Handling ────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send current state immediately on connection
  socket.emit("trainUpdate", {
    timestamp: new Date().toISOString(),
    tick: tickCount,
    trains: simulator.getTrainPositions(),
  });

  socket.emit("arrivalUpdate", {
    timestamp: new Date().toISOString(),
    board: simulator.getArrivalBoard(),
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`\n🚇 Kanpur Metro Backend running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🔗 API: http://localhost:${PORT}/api/stations\n`);
});
