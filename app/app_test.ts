import app from "./app.ts";
import { assertEquals } from "@std/assert";
import { OpenAPIHono } from "@hono/zod-openapi";

Deno.test({
  name: "App is defined",
  fn() {
    assertEquals(app instanceof OpenAPIHono, true);
  },
});

Deno.test({
  name: "App has / route",
  fn() {
    assertEquals(
      app.routes.some((route) => route.method === "GET" && route.path === "/"),
      true,
    );
  },
});
