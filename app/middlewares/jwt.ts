import { jwt } from "@hono/jwt";
import { Context, Next } from "@hono";

if (!Deno.env.get("JWT_SECRET")) {
  console.error("Please set JWT_SECRET in the environment variables");
  Deno.exit(1);
}

export default function jwtMiddleware(
  ctx: Context,
  next: Next,
) {
  const jwtMiddleware = jwt({
    secret: Deno.env.get("JWT_SECRET") || "",
  });
  return jwtMiddleware(ctx, next);
}
