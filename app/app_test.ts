import app from "./app.ts";
import { assertEquals } from "@std/assert";
import { Hono } from "@hono";

Deno.test({
  name: "App is defined",
  fn() {
    assertEquals(app instanceof Hono, true);
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
