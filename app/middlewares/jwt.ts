import { jwt } from "@hono/jwt";
import { Context, Next } from "@hono";

export default function jwtMiddleware(
  ctx: Context,
  next: Next,
) {
  const jwtMiddleware = jwt({
    secret: Deno.env.get("JWT_SECRET") || "",
  });
  return jwtMiddleware(ctx, next);
}
