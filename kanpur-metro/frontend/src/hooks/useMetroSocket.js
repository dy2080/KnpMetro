import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = "http://localhost:4000";

/**
 * Custom hook that manages the WebSocket connection to the metro backend.
 * Returns live train positions and arrival board data.
 */
export function useMetroSocket() {
  const [trains, setTrains] = useState([]);
  const [arrivalBoard, setArrivalBoard] = useState({});
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Create socket connection
    const socket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      console.log("Connected to metro backend");
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    // Real-time train positions — updates every second
    socket.on("trainUpdate", ({ trains, timestamp }) => {
      setTrains(trains);
      setLastUpdate(new Date(timestamp));
    });

    // Arrival board — updates every 5 seconds
    socket.on("arrivalUpdate", ({ board }) => {
      setArrivalBoard(board);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { trains, arrivalBoard, connected, lastUpdate };
}