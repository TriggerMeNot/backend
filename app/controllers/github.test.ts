import { assertEquals } from "@std/assert";
import githubController from "./github.ts";

Deno.test({
  name: "Github controller has root function",
  fn() {
    assertEquals(typeof githubController.root, "function");
  },
});
