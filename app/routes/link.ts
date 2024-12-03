import { Hono } from "@hono";
import { describeRoute } from "@hono-openapi";
import { validator } from "@hono-openapi/zod";
import jwtMiddleware from "../middlewares/jwt.ts";
import LinkController from "../controllers/link.ts";
import LinkSchema from "../interfaces/link.ts";

const linkRouter = new Hono();

linkRouter.use(jwtMiddleware);

linkRouter.get(
  "/",
  describeRoute({
    tags: ["link"],
    description: "Link reaction or action to a action",
    responses: {
      200: {
        description: "Successful link response",
      },
      400: {
        description: "Bad request",
      },
      404: {
        description: "Not found",
      },
    },
  }),
  validator("json", LinkSchema.Link.Body),
  LinkController.link,
);

export default linkRouter;
