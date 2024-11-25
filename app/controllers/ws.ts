import { Context } from "@hono";
import { verify } from "@hono/jwt";

const connections = new Map<WebSocket, { clientId: string }>();

// Broadcast a message to all connected clients
function broadcast(message: string) {
  connections.forEach((_, socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    }
  });
};

// Send data to only one client based on its id
function sendData(clientId: string, data: string) {
  connections.forEach((value, socket) => {
    if (value.clientId === clientId && socket.readyState === WebSocket.OPEN) {
      socket.send(data);
    }
  });
};

// WebSocket connection handler with authentication and message handling
async function handleWebSocket(c: Context) {
  const token = c.req.query("token");

  if (!token) {
    console.error("Token is missing");
    return {
      onMessage: () => {},
      onClose: () => {},
      onError: () => {},
    };
  }

  try {
    const payload = await verify(token, Deno.env.get("JWT_SECRET")!);
    console.log("Authenticated with payload:", payload);

    const { socket, response } = Deno.upgradeWebSocket(c.req.raw);
    const clientId = payload.sub as string;
    connections.set(socket, { clientId });

    socket.onmessage = (event) => {
      console.log(`Received message: ${event.data}`);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
      connections.delete(socket);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return {
      response,
      onMessage: socket.onmessage,
      onClose: socket.onclose,
      onError: socket.onerror,
    };
  } catch (err) {
    console.error("Authentication failed:", err);
    return {
      onMessage: () => {},
      onClose: () => {},
      onError: () => {},
    };
  }
};

export default {
    broadcast,
    sendData,
    handleWebSocket,
}