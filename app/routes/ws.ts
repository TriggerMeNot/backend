import { Hono } from "@hono";
import { describeRoute } from "@hono-openapi";
import { upgradeWebSocket } from "@hono/deno";
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
  upgradeWebSocket(handleWebSocket),
);

export default wsRouter;
