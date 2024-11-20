import { Context } from "@hono";
import { sign } from "@hono/jwt";

const users = [
  {
    email: "example@email.com",
    username: "User Test",
    password: "password",
  },
];

async function login(ctx: Context) {
  // @ts-ignore - The `form` validator is added by the `validator` middleware
  const { email, password } = ctx.req.valid("form");

  const user = users.find((user) =>
    user.email === email && user.password === password
  );

  if (!user) {
    return ctx.json({ message: "Invalid email or password" }, 401);
  }

  const payload = {
    sub: `${user.username}:${user.email}`,
    role: "user",
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // Token expires in 24 hours
  };

  const token = await sign(payload, Deno.env.get("JWT_SECRET")!);
  return ctx.json({ token });
}

function register(ctx: Context) {
  // @ts-ignore - The `form` validator is added by the `validator` middleware
  const { email, username, password } = ctx.req.valid("form");

  const user = users.find((user) => user.email === email);

  if (user) {
    return ctx.json({ message: "User already exists" }, 400);
  }

  users.push({ email, username, password });
  return ctx.json({ email, username });
}

export default {
  login,
  register,
};
