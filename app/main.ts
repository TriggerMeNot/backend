import app from "./app.ts";

const envVariables = [
  "PORT",
  "SALT_ROUNDS",
  "JWT_SECRET",
  "REDIRECT_URI",
  "GITHUB_ID",
  "GITHUB_SECRET",
  "GITHUB_APP",
  "GOOGLE_ID",
  "GOOGLE_SECRET",
  "DISCORD_ID",
  "DISCORD_SECRET",
  "DISCORD_BOT_TOKEN",
  "MICROSOFT_TENANT",
  "MICROSOFT_ID",
  "MICROSOFT_SECRET",
  "MICROSOFT_SCOPE",
  "DATABASE_URL",
  "POSTGRES_USER",
  "POSTGRES_PASSWORD",
  "POSTGRES_DB",
];

const missingVariables: string[] = [];

envVariables.forEach((variable) => {
  if (!Deno.env.has(variable)) {
    missingVariables.push(variable);
  }
});

if (missingVariables.length > 0) {
  console.error(
    `%cerror%c: The following variable are missing in the environement ${
      missingVariables.join(", ")
    }.`,
    "color: red; font-weight: bold;",
    "color: inherit;",
  );
  Deno.exit(1);
}

Deno.serve(
  { port: Deno.env.has("PORT") ? parseInt(Deno.env.get("PORT")!) : 8080 },
  app.fetch,
);
