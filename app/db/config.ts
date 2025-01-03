import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { users as userSchema } from "../schemas/users.ts";
import { oauths as oauthSchema } from "../schemas/oauths.ts";
import { services as serviceSchema } from "../schemas/services.ts";
import { reactions as reactionSchema } from "../schemas/reactions.ts";
import { actions as actionSchema } from "../schemas/actions.ts";
import { reactionsPlayground as reactionPlaygroundSchema } from "../schemas/reactionsPlayground.ts";
import { actionsPlayground as actionPlaygroundSchema } from "../schemas/actionsPlayground.ts";
import { reactionLinks as reactionLinkSchema } from "../schemas/reactionLinks.ts";
import { actionLinks as actionLinkSchema } from "../schemas/actionLinks.ts";
import { playgrounds as playgroundSchema } from "../schemas/playgrounds.ts";

if (!Deno.env.get("DATABASE_URL")) {
  console.error("Please set DATABASE_URL in the environment variables");
  Deno.exit(1);
}

const { Pool } = pg;

export const db = drizzle({
  client: new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
  }),
  schema: {
    userSchema,
    oauthSchema,
    serviceSchema,
    reactionSchema,
    actionSchema,
    reactionPlaygroundSchema,
    actionPlaygroundSchema,
    reactionLinkSchema,
    actionLinkSchema,
    playgroundSchema,
  },
});
