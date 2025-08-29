const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// --- Signaling logic ---
wss.on("connection", ws => {
  ws.on("message", message => {
    // Relay all messages to other clients
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
		console.log(message);
      }
    });
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));