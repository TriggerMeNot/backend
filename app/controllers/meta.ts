import { Context } from "@hono";
import { db } from "../db/config.ts";
import { and, eq } from "drizzle-orm/expressions";
import { SERVICES } from "../db/seed.ts";
import { oauths as oauthSchema } from "../schemas/oauths.ts";
import { users as userSchema } from "../schemas/users.ts";
import { sign } from "@hono/jwt";

if (
    !Deno.env.get("META_ID") || !Deno.env.get("META_SECRET") ||
    !Deno.env.get("JWT_SECRET")
) {
    throw new Error("Environment variables for Meta OAuth or JWT not set");
}

async function linkMeta(code: string) {
    const response = await fetch("https://graph.facebook.com/v10.0/oauth/access_token", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: Deno.env.get("META_ID")!,
            client_secret: Deno.env.get("META_SECRET")!,
            code,
        }),
    })
        .then((res) => res.json())
        .catch((err) => {
            throw {
                status: 400,
                body: err,
            };
        });

    console.log('API response:', response);

    const {
        access_token: token,
        expires_in: tokenExpiresIn,
        refresh_token: refreshToken,
        refresh_token_expires_in: refreshTokenExpiresIn,
    } = response;

    const { id: metaUserId, name: username, email } = await fetch(
        "https://graph.facebook.com/me?fields=id,name,email",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    )
    .then((res) => res.json())
    .catch((err) => {
        throw {
            status: 400,
            body: err,
        };
    });

    return {
        metaUserId,
        username,
        email,
        token,
        tokenExpiresIn,
        refreshToken,
        refreshTokenExpiresIn,
        actualTime: Math.floor(Date.now() / 1000),
    };
}

async function authenticate(ctx: Context) {
    const { code } = ctx.req.valid("json" as never);

    const {
        metaUserId,
        username,
        email,
        token,
        tokenExpiresIn,
        refreshToken,
        refreshTokenExpiresIn,
        actualTime,
    } = await linkMeta(code);

    // Get the user ID
    const users = await db.select().from(userSchema).where(
        eq(userSchema.email, email),
    ).limit(1);
    const userId = users.length
        ? users[0].id
        : await db.insert(userSchema).values({
            email,
            username,
            password: null,
        }).returning().then((newUser) => newUser[0].id);

    await db.insert(oauthSchema).values({
        serviceUserId: metaUserId,
        userId,
        serviceId: SERVICES.Meta.id!,
        token,
        tokenExpiresAt: actualTime + tokenExpiresIn,
        refreshToken,
        refreshTokenExpiresAt: actualTime + refreshTokenExpiresIn,
    }).onConflictDoUpdate({
        target: [oauthSchema.userId, oauthSchema.serviceId],
        set: {
            token,
            tokenExpiresAt: actualTime + tokenExpiresIn,
            refreshToken,
            refreshTokenExpiresAt: actualTime + refreshTokenExpiresIn,
        },
    });

    const payload = {
        sub: userId,
        role: "user",
        exp: actualTime + 60 * 60 * 24,
    };

    const jwtToken = await sign(payload, Deno.env.get("JWT_SECRET")!);

    return ctx.json({ message: "Login/Register successful", token: jwtToken });
}

async function isAuthorized(ctx: Context) {
    const userId = ctx.get("jwtPayload").sub;

    const users = await db
        .select()
        .from(oauthSchema)
        .where(
            and(
                eq(oauthSchema.userId, userId),
                eq(oauthSchema.serviceId, SERVICES.Meta.id!),
            ),
        )
        .limit(1);

    return ctx.json({ authorized: users.length ? true : false });
}

async function authorize(ctx: Context) {
    const userId = ctx.get("jwtPayload").sub;
    const { code } = ctx.req.valid("json" as never);

    const {
        metaUserId,
        token,
        tokenExpiresIn,
        refreshToken,
        refreshTokenExpiresIn,
        actualTime,
    } = await linkMeta(code);

    await db.insert(oauthSchema).values({
        userId,
        serviceId: SERVICES.Meta.id!,
        serviceUserId: metaUserId,
        token,
        tokenExpiresAt: actualTime + tokenExpiresIn,
        refreshToken,
        refreshTokenExpiresAt: actualTime + refreshTokenExpiresIn,
    }).onConflictDoUpdate({
        target: [oauthSchema.userId, oauthSchema.serviceId],
        set: {
            token,
            tokenExpiresAt: actualTime + tokenExpiresIn,
            refreshToken,
            refreshTokenExpiresAt: actualTime + refreshTokenExpiresIn,
        },
    });

    return ctx.json({ message: "Connection successful" });
}

export default { authenticate, authorize, isAuthorized };
