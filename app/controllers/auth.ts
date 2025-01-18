import { Context } from "@hono";
import { sign, verify } from "@hono/jwt";
import { db } from "../db/config.ts";
import { users as userSchema } from "../schemas/users.ts";
import { eq } from "drizzle-orm/expressions";
import { Resend } from "resend";
import * as bcrypt from "bcrypt";

async function login(ctx: Context) {
  const { email, password } = ctx.req.valid("form" as never);

  const users = await db.select().from(userSchema).where(
    eq(userSchema.email, email),
  ).limit(1);

  if (!users.length || !(await bcrypt.compare(password, users[0].password!))) {
    return ctx.json({ message: "Invalid email or password" }, 401);
  }

  const user = users[0];

  const payload = {
    sub: user.id,
    role: "user",
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // Token expires in 24 hours
  };

  const token = await sign(payload, Deno.env.get("JWT_SECRET")!);
  return ctx.json({ token });
}

async function register(ctx: Context) {
  const { email, username, password } = ctx.req.valid("form" as never);

  {
    const users = await db.select().from(userSchema).where(
      eq(userSchema.email, email),
    ).limit(1);

    if (!users) {
      return ctx.json({ message: "User already exists" }, 400);
    }
  }

  const saltRounds = parseInt(Deno.env.get("SALT_ROUNDS")!, 10);
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);

  const users = await db.insert(userSchema).values({
    email,
    username,
    password: hashedPassword,
  }).returning();

  if (!users) {
    return ctx.json({ message: "Unable to create user" }, 401);
  }

  const user = users[0];

  const payload = {
    sub: user.id,
    role: "user",
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // Token expires in 24 hours
  };

  const token = await sign(payload, Deno.env.get("JWT_SECRET")!);
  return ctx.json({ token });
}

async function forgotPassword(ctx: Context) {
  const { email } = ctx.req.valid("json" as never);

  const users = await db.select().from(userSchema).where(
    eq(userSchema.email, email),
  ).limit(1);
  if (!users.length) {
    return ctx.json({ message: "User not found" }, 401);
  }

  const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

  const payload = {
    sub: email,
    exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
  };

  const token = await sign(
    payload,
    Deno.env.get("JWT_FORGOT_PASSWORD_SECRET")!,
  );

  return await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Reset Password",
    html: `<p>Click <a href="${
      Deno.env.get("REDIRECT_URI")
    }/reset-password?token=${token}">here</a> to reset your password</p>`,
  })
    .then((response) => {
      if (response.error) {
        return ctx.json(
          { message: response.error.message },
          // @ts-expect-error - The error property is present
          response.error.statusCode,
        );
      }
      return ctx.json({ message: "Email sent" });
    })
    .catch(() => {
      return ctx.json({ message: "Unable to send email" }, 401);
    });
}

async function resetPassword(ctx: Context) {
  const { token, password } = ctx.req.valid("json" as never);

  let payload: Awaited<ReturnType<typeof verify>>;
  try {
    payload = await verify(
      token,
      Deno.env.get("JWT_FORGOT_PASSWORD_SECRET")!,
    );
  } catch {
    return ctx.json({ message: "Invalid token" }, 401);
  }

  const users = await db.select().from(userSchema).where(
    eq(userSchema.email, payload.sub as string),
  ).limit(1);

  if (!users.length) {
    return ctx.json({ message: "User not found" }, 401);
  }

  const saltRounds = parseInt(Deno.env.get("SALT_ROUNDS")!, 10);
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = users[0];
  await db.update(userSchema).set({ password: hashedPassword })
    .where(
      eq(userSchema.id, user.id),
    );

  return ctx.json({ message: "Password updated" });
}

export default {
  login,
  register,
  forgotPassword,
  resetPassword,
};
