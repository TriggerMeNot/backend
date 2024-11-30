import { Hono } from "@hono";
import { describeRoute } from "@hono-openapi";
import { resolver } from "@hono-openapi/zod";
import jwtMiddleware from "../middlewares/jwt.ts"
import UserController from "../controllers/user.ts";
import UserSchema from "../interfaces/user.ts";

const userRouter = new Hono();

userRouter.use(jwtMiddleware);

userRouter.get(
  "/",
  describeRoute({
    tags: ["user"],
    description: "Get the information of the current logged user.",
    responses: {
      200: {
        description: "User information",
        content: {
          "application/json": {
            schema: resolver(UserSchema.Root.Response),
          },
        },
      },
    },
  }),
  UserController.root,
);

export default userRouter;
