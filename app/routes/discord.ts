import { Hono } from "@hono";
import { describeRoute } from "@hono-openapi";
import { validator } from "@hono-openapi/zod";
import jwtMiddleware from "../middlewares/jwt.ts";
import DiscordSchema from "../interfaces/discord.ts";
import DiscordController from "../controllers/discord.ts";

const discordRouter = new Hono();

discordRouter.get(
  "/uri",
  describeRoute({
    tags: ["auth", "discord"],
    description: "Get Discord OAuth URIs",
    responses: {
      200: {
        description: "Successful response",
      },
    },
  }),
  DiscordController.getURI,
);

discordRouter.post(
  "/authenticate",
  describeRoute({
    tags: ["auth", "discord"],
    description: "Login to authenticate with Discord",
    responses: {
      200: {
        description: "Successful response",
      },
    },
  }),
  validator("json", DiscordSchema.Authenticate.Body),
  DiscordController.authenticate,
);

discordRouter.use(jwtMiddleware);

discordRouter.get(
  "/authorize",
  describeRoute({
    tags: ["auth", "discord"],
    description: "Verify if authorized with Discord",
    responses: {
      200: {
        description: "Successful response",
      },
    },
  }),
  DiscordController.isAuthorized,
);

discordRouter.post(
  "/authorize",
  describeRoute({
    tags: ["auth", "discord"],
    description: "Authorize with Discord",
    responses: {
      200: {
        description: "Successful response",
      },
    },
  }),
  validator("json", DiscordSchema.Authorize.Body),
  DiscordController.authorize,
);

export default discordRouter;
