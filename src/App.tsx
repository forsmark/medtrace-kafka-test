import React, { useState } from "react";
import DraggableCanvas from "./DraggableCanvas";

const App: React.FC = () => {
  const [ip, setIp] = useState<string>("127.0.0.1");
  const [port, setPort] = useState<string>("8080");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [circleRadius, setCircleRadius] = useState<number>(30);

  const handleConnectClick = () => {
    if (ws) {
      ws.close();
      setWs(null);
    } else {
      const url = `ws://${ip}:${port}`;
      const newWs = new WebSocket(url);
      newWs.onopen = () => {
        console.log("Connected to", url);
      };
      newWs.onclose = () => {
        console.log("Disconnected");
        setWs(null);
      };
      newWs.onerror = (error) => {
        console.error("WebSocket error", error);
      };
      newWs.onmessage = (message) => {
        try {
          const data = JSON.parse(message.data);
          if (data.radius) {
            setCircleRadius(data.radius);
          }
        } catch {
          console.error("Invalid message received:", message.data);
        }
      };
      setWs(newWs);
    }
  };

  // Callback passed to the canvas to send coordinates over the WebSocket when dragging.
  const handlePointDrag = (x: number, y: number) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ x, y });
      ws.send(message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 text-white space-y-6">
      <h1 className="text-3xl font-bold">Kafka Testing</h1>
      <div className="flex flex-col items-center space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <label htmlFor="ip" className="w-24 text-right">
              IP Address:
            </label>
            <input
              id="ip"
              type="text"
              placeholder="IP Address"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              disabled={ws !== null}
              className="px-3 py-2 rounded border border-gray-600 bg-gray-700 focus:outline-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="port" className="w-24 text-right">
              Port:
            </label>
            <input
              id="port"
              type="text"
              placeholder="Port"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              disabled={ws !== null}
              className="px-3 py-2 rounded border border-gray-600 bg-gray-700 focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleConnectClick}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 focus:outline-none"
        >
          {ws ? "Disconnect" : "Connect"}
        </button>
      </div>
      <DraggableCanvas
        circleRadius={circleRadius}
        onPointDrag={handlePointDrag}
      />
    </div>
  );
};

export default App;
