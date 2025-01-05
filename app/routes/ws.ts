import { Hono } from "@hono";
import { describeRoute } from "@hono-openapi";
import { handleWebSocket } from "../controllers/ws.ts";

const wsRouter = new Hono();

wsRouter.get(
  "/",
  describeRoute({
    tags: ["websocket"],
    description:
      "Establish a WebSocket connection for bidirectional communication.",
    responses: {
      101: {
        description: "WebSocket connection established",
        },
      400: {
        description: "Invalid WebSocket request",
        },
      },
  }),
  handleWebSocket,
);

export default wsRouter;
