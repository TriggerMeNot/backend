import { Context } from "@hono";

function root(ctx: Context) {
  return ctx.text("Hello Hono!");
}

export default {
  root,
};
