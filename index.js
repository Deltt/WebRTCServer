const http = require("http");
const WebSocket = require("ws");
const PORT = process.env.PORT || 3000;

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// --- Signaling logic ---
wss.on("connection", ws => {
  ws.on("message", message => {
    // Relay all messages to other clients
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);

		const msgStr = message.toString();
		console.log(msgStr);
      }
    });
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));