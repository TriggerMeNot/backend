import { Hono } from "@hono";
import { describeRoute } from "@hono-openapi";
import { upgradeWebSocket } from "@hono/deno";
import { Context } from "@hono";
import { verify } from "@hono/jwt";

const wsRouter = new Hono();
const connections = new Map<WebSocket, { clientId: string }>();

const broadcast = (message: string) => {
  connections.forEach((_, socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    }
  });
};

export const sendData = (clientId: string, data: string) => {
  connections.forEach((value, socket) => {
    if (value.clientId === clientId && socket.readyState === WebSocket.OPEN) {
      socket.send(data);
    }
  });
};

wsRouter.get(
  "/",
  describeRoute({
    tags: ["websocket"],
    description:
      "Establish a WebSocket connection for bidirectional communication.",
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
  upgradeWebSocket(async (c: Context) => {
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
    } catch (err) {
      console.error("Authentication failed:", err);
      return {
        onMessage: () => {},
        onClose: () => {},
        onError: () => {},
      };
    }
  }),
);

export default wsRouter;
