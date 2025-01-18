import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { users as userSchema } from "../schemas/users.ts";
import { oauths as oauthSchema } from "../schemas/oauths.ts";
import { oidcs as oidcsSchema } from "../schemas/oidcs.ts";
import { services as serviceSchema } from "../schemas/services.ts";
import { reactions as reactionSchema } from "../schemas/reactions.ts";
import { actions as actionSchema } from "../schemas/actions.ts";
import { reactionsPlayground as reactionPlaygroundSchema } from "../schemas/reactionsPlayground.ts";
import { actionsPlayground as actionPlaygroundSchema } from "../schemas/actionsPlayground.ts";
import { reactionLinks as reactionLinkSchema } from "../schemas/reactionLinks.ts";
import { actionLinks as actionLinkSchema } from "../schemas/actionLinks.ts";
import { playgrounds as playgroundSchema } from "../schemas/playgrounds.ts";
import { crons as cornsSchema } from "../schemas/crons.ts";

const { Pool } = pg;

export const db = drizzle({
  client: new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
  }),
  schema: {
    userSchema,
    oauthSchema,
    oidcsSchema,
    serviceSchema,
    reactionSchema,
    actionSchema,
    reactionPlaygroundSchema,
    actionPlaygroundSchema,
    reactionLinkSchema,
    actionLinkSchema,
    playgroundSchema,
    cornsSchema,
  },
});
