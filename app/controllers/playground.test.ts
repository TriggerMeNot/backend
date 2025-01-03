import { assertEquals } from "@std/assert";
import playgroundController from "./playground.ts";

Deno.test({
  name: "Playground controller has addAction function",
  fn() {
    assertEquals(typeof playgroundController.addAction, "function");
  },
});

Deno.test({
  name: "Playground controller has addReaction function",
  fn() {
    assertEquals(typeof playgroundController.addReaction, "function");
  },
});
