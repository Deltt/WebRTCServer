const http = require("http");
const WebSocket = require("ws");
const { RTCPeerConnection } = require("wrtc");

const PORT = process.env.PORT || 3000;

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const clients = new Map();

// --- Signaling logic ---
wss.on("connection", ws => {
	const pc = new RTCPeerConnection();
	let dc;

  // Create a data channel for the client
  dc = pc.createDataChannel("game");
  dc.onmessage = (msg) => {
    // Broadcast received data to all other clients
    for (const [otherWs, other] of clients.entries()) {
      if (otherWs !== ws && other.dataChannel?.readyState === "open") {
        other.dataChannel.send(msg.data);
      }
    }
  };

  clients.set(ws, { pc, dataChannel: dc });

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