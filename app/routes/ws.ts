import { Hono } from "@hono";
import { describeRoute } from "@hono-openapi";
import { upgradeWebSocket } from "@hono/deno";
import wsController from "../controllers/ws.ts";
import { resolver, validator } from "@hono-openapi/zod";
import wsSchema from "../interfaces/ws.ts";

const wsRouter = new Hono();

wsRouter.post(
  "/",
  describeRoute({
    tags: ["websocket"],
    description:
      "Establish a WebSocket connection for bidirectional communication.",
    responses: {
      200: {
        description: "WebSocket connection established",
        content: {
          "application/json": {
            schema: resolver(wsSchema.Connection.Response),
          },
        },
      },
    },
  }),
  validator("form", wsSchema.Connection.Body),
  upgradeWebSocket(wsController.handleWebSocket),
);

export default wsRouter;
