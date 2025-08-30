const http = require("http");
const WebSocket = require("ws");
const { RTCPeerConnection } = require("wrtc");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {  // CHANGED
    res.writeHead(200);                           // CHANGED
    res.end("OK");                                // CHANGED
});

const wss = new WebSocket.Server({ server });    // CHANGED

const clients = new Map();

// --- Signaling logic ---
wss.on("connection", ws => {

	ws.on("message", (message, isBinary) => {

		if (isBinary) {
			const firstByte = message.readUInt8(0);

			if (firstByte == 200) {
				const sdpBuffer = message.subarray(1);
            	const sdpOffer = sdpBuffer.toString("utf8");
				console.log("Received SDP offer:", sdpOffer);

				const pc = new RTCPeerConnection();
            	pc.setRemoteDescription({ type: "offer", sdp: sdpOffer })
				.then(() => {
					console.log("Remote SDP applied!");
					return pc.createAnswer();
				})
				.then(answer => {
					return pc.setLocalDescription(answer).then(() => answer);
				})
				.then(answer => {
					const answerBuffer = Buffer.from(answer.sdp, "utf8");
					const response = Buffer.concat([
						Buffer.from([201]), // e.g. 201 = answer type
						answerBuffer
					]);
					ws.send(response);
				})
				.catch(err => {
					console.error("Failed to set remote SDP:", err);
				});
			}
			else if (firstByte == 202) {
				const iceBuffer = message.subarray(1);
				const ice = iceBuffer.toString("utf8");
				pc.addIceCandidate(ice)
  					.catch(err => console.error("Failed to add ICE candidate:", err));
			}
		}
		else {
			wss.clients.forEach(client => {
			if (client !== ws && client.readyState === WebSocket.OPEN) {
				client.send(message);
				const msgStr = message.toString();
				console.log(msgStr);
			}
		});
		}

		// Relay all messages to other clients
		// wss.clients.forEach(client => {
		// 	if (client !== ws && client.readyState === WebSocket.OPEN) {
		// 		client.send(message);

		// 		const msgStr = message.toString();
		// 		console.log(msgStr);
		// 	}
		// });
	});
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));