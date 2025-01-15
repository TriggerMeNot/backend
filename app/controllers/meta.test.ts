import { assertEquals } from "@std/assert";
import metaController from "./meta.ts";

Deno.test({
  name: "Meta controller has authenticate function",
  fn() {
    assertEquals(typeof metaController.authenticate, "function");
  },
});

Deno.test({
  name: "Meta controller has authorize function",
  fn() {
    assertEquals(typeof metaController.authorize, "function");
  },
});

Deno.test({
  name: "Meta controller has isAuthorized function",
  fn() {
    assertEquals(typeof metaController.isAuthorized, "function");
  },
});