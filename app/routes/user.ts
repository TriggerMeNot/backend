import { Hono } from "@hono";
import { describeRoute } from "@hono-openapi";
import { resolver, validator } from "@hono-openapi/zod";
import jwtMiddleware from "../middlewares/jwt.ts";
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
            schema: resolver(UserSchema.Self.Response),
          },
        },
      },
    },
  }),
  UserController.self,
);

userRouter.get(
  "/:id",
  describeRoute({
    tags: ["user"],
    description: "Get the information of a user by ID.",
    responses: {
      200: {
        description: "User information",
        content: {
          "application/json": {
            schema: resolver(UserSchema.GetUser.Response),
          },
        },
      },
      404: {
        description: "User not found",
        content: {
          "application/json": {
            schema: resolver(UserSchema.GetUser.ResponseFailure),
          },
        },
      },
    },
  }),
  validator("param", UserSchema.GetUser.Param),
  UserController.getUser,
);

export default userRouter;
