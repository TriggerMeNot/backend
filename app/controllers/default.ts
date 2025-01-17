import { Context } from "@hono";
import { db } from "../db/config.ts";
import { eq } from "drizzle-orm/expressions";
import { services as serviceSchema } from "../schemas/services.ts";
import { actions as actionSchema } from "../schemas/actions.ts";
import { reactions as reactionSchema } from "../schemas/reactions.ts";

function root(ctx: Context) {
  return ctx.text("Hello Hono!");
}

const oauths = {
  "GitHub": {
    authenticate_uri: `https://github.com/login/oauth/authorize` +
      `?client_id=${Deno.env.get("GITHUB_ID")}` +
      `&redirect_uri=${Deno.env.get("REDIRECT_URI")}/login/github`,
    authorization_uri: `https://github.com/apps/${
      Deno.env.get("GITHUB_APP")
    }/installations/new`,
  },

  "Google": {
    authenticate_uri: `https://accounts.google.com/o/oauth2/v2/auth` +
      `?redirect_uri=${Deno.env.get("REDIRECT_URI")}/login/google` +
      `&prompt=consent` +
      `&response_type=code` +
      `&client_id=${Deno.env.get("GOOGLE_ID")}` +
      `&scope=https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile` +
      `&access_type=offline`,
    authorization_uri: `https://accounts.google.com/o/oauth2/auth` +
      `?client_id=${Deno.env.get("GOOGLE_ID")}` +
      `&redirect_uri=${Deno.env.get("REDIRECT_URI")}/services/google` +
      `&prompt=consent` +
      `&response_type=code` +
      `&scope=https://mail.google.com/+https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile` +
      `&access_type=offline`,
  },

  "Microsoft": {
    authenticate_uri:
      `https://login.microsoftonline.com/${
        Deno.env.get("MICROSOFT_TENANT")
      }/oauth2/v2.0/authorize?` +
      `client_id=${Deno.env.get("MICROSOFT_ID")}&` +
      `response_type=code&` +
      `redirect_uri=${Deno.env.get("REDIRECT_URI")}/login/microsoft&` +
      `response_mode=query&` +
      `scope=${Deno.env.get("MICROSOFT_SCOPE")}&` +
      `state=12345&` +
      `sso_reload=true`,
    authorization_uri:
      `https://login.microsoftonline.com/${
        Deno.env.get("MICROSOFT_TENANT")
      }/oauth2/v2.0/authorize` +
      `?client_id=${Deno.env.get("MICROSOFT_ID")}` +
      `&response_type=code` +
      `&redirect_uri=${Deno.env.get("REDIRECT_URI")}/services/microsoft` +
      `&response_mode=query` +
      `&scope=${Deno.env.get("MICROSOFT_SCOPE")}` +
      `&state=12345` +
      `&sso_reload=true`,
  },

  "Discord": {
    authenticate_uri: `https://discord.com/oauth2/authorize` +
      `?client_id=${Deno.env.get("DISCORD_ID")}` +
      `&permissions=562949953427456` +
      `&response_type=code` +
      `&redirect_uri=${Deno.env.get("REDIRECT_URI")}/login/discord` +
      `&integration_type=0` +
      `&scope=identify+email`,
    authorization_uri: `https://discord.com/oauth2/authorize` +
      `?client_id=${Deno.env.get("DISCORD_ID")}` +
      `&permissions=562949953427456` +
      `&response_type=code` +
      `&redirect_uri=${Deno.env.get("REDIRECT_URI")}/services/discord` +
      `&integration_type=0` +
      `&scope=identify+email+bot`,
  },
};

async function about(ctx: Context) {
  const services = [];
  for (const service of await db.select().from(serviceSchema)) {
    services.push({
      name: service.name,
      description: service.description,
      ...(Object.keys(oauths).includes(service.name) &&
        // @ts-expect-error - don't know
        ({ oauths: oauths[service.name] })),
      actions: await db.select({
        id: actionSchema.id,
        name: actionSchema.name,
        description: actionSchema.description,
        params: actionSchema.params,
        settings: actionSchema.settings,
      }).from(actionSchema).where(
        eq(actionSchema.serviceId, service.id),
      ),
      reactions: await db.select({
        id: reactionSchema.id,
        name: reactionSchema.name,
        description: reactionSchema.description,
        settings: reactionSchema.settings,
      }).from(reactionSchema).where(
        eq(reactionSchema.serviceId, service.id),
      ),
    });
  }

  return ctx.json({
    client: {
      host: ctx.req.header("host") || "unknown",
    },
    server: {
      current_time: Math.floor(Date.now() / 1000),
      services,
    },
  });
}

export default {
  root,
  about,
};
