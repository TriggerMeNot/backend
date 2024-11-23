import { Hono } from "@hono";
import { describeRoute } from "@hono-openapi";
import { upgradeWebSocket } from "@hono/deno";
import { Context } from "@hono";

const wsRouter = new Hono();
const connections = new Set<WebSocket>();

const broadcast = (message: string) => {
  connections.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    }
  });
};

wsRouter.get(
  "/",
  describeRoute({
    tags: ["websocket"],
    description: "Establish a WebSocket connection for bidirectional communication.",
    responses: {
      101: {
        description: "WebSocket connection established",
        content: {
          "application/json": {
            schema: {
              type: "string",
              example: "WebSocket connection established",
            },
          },
        },
      },
    },
  }),
  upgradeWebSocket((c: Context) => {
    // Access headers correctly using c.req.raw, which should be the raw request object
    const headers = c.req.raw.headers;

    // Check for WebSocket upgrade request by looking for correct headers
    if (
      headers.get("upgrade")?.toLowerCase() === "websocket" &&
      headers.get("connection")?.toLowerCase() === "upgrade"
    ) {
      // Proceed to upgrade to WebSocket
      const { socket, response } = Deno.upgradeWebSocket(c.req.raw);

      // WebSocket events handler
      socket.onopen = () => {
        console.log("WebSocket connection opened");
        connections.add(socket);
      };

      socket.onmessage = (event) => {
        console.log(`Received message: ${event.data}`);
        try {
          const message = JSON.parse(event.data);
          if (message.type === "broadcast") {
            broadcast(message.data);
          } else {
            socket.send(`Echo: ${event.data}`);
          }
        } catch (err) {
          console.error("Invalid message format: ", err);
          socket.send("Invalid message format");
        }
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
    } else {
      // Return 400 if not a valid WebSocket upgrade request
      return {
        onMessage: () => {},
        onClose: () => {},
        onError: () => {},
      };
    }
  }),
);

export default wsRouter;
