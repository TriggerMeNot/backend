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
  UserController.getUser,
);

userRouter.patch(
  "/:id",
  describeRoute({
    tags: ["user"],
    description: "Update the username of a user by ID.",
    responses: {
      200: {
        description: "User information",
        content: {
          "application/json": {
            schema: resolver(UserSchema.PatchUser.Response),
          },
        },
      },
      404: {
        description: "User not found",
        content: {
          "application/json": {
            schema: resolver(UserSchema.PatchUser.ResponseFailure),
          },
        },
      },
    },
  }),
  validator("json", UserSchema.PatchUser.Body),
  UserController.patchUser,
);

export default userRouter;
