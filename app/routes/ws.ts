import { Hono } from "@hono";
import { describeRoute } from "@hono-openapi";

const wsRouter = new Hono();
const connections = new Set<WebSocket>();

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
  (c) => {
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
        socket.send(`Echo: ${event.data}`);
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
        connections.delete(socket);
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      // Return WebSocket response
      return response;
    } else {
      // Return 400 if not a valid WebSocket upgrade request
      return c.text("Invalid WebSocket request", 400);
    }
  }
);

export default wsRouter;
