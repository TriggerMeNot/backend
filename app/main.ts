import app from "./app.ts";

Deno.serve(
  { port: Deno.env.has("PORT") ? parseInt(Deno.env.get("PORT")!) : 8080 },
  app.fetch,
);
