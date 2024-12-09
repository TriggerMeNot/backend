import app from "./app.ts";
import { assertEquals } from "@std/assert";

Deno.test({
  name: "App has /api/openapi route",
  fn() {
    assertEquals(
      app.routes.some((route) =>
        route.method === "GET" && route.path === "/api/openapi"
      ),
      true,
    );
  },
});

Deno.test({
  name: "App has /api/doc route",
  fn() {
    assertEquals(
      app.routes.some((route) =>
        route.method === "GET" && route.path === "/api/doc"
      ),
      true,
    );
  },
});

Deno.test({
  name: "App has /api/reference route",
  fn() {
    assertEquals(
      app.routes.some((route) =>
        route.method === "GET" && route.path === "/api/reference"
      ),
      true,
    );
  },
});

Deno.test({
  name: "App has /api/metrics route",
  fn() {
    assertEquals(
      app.routes.some((route) =>
        route.method === "GET" && route.path === "/api/metrics"
      ),
      true,
    );
  },
});
