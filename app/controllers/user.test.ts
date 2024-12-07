import { assertEquals } from "@std/assert";
import userController from "./user.ts";

Deno.test({
  name: "User controller has self function",
  fn() {
    assertEquals(typeof userController.self, "function");
  },
});

Deno.test({
  name: "User controller has getUser function",
  fn() {
    assertEquals(typeof userController.getUser, "function");
  },
});
