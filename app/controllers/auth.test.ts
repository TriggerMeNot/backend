import { assertEquals } from "@std/assert";
import authController from "./auth.ts";

Deno.test({
  name: "Auth controller has login function",
  fn() {
    assertEquals(typeof authController.login, "function");
  },
});

Deno.test({
  name: "Auth controller has register function",
  fn() {
    assertEquals(typeof authController.register, "function");
  },
});
