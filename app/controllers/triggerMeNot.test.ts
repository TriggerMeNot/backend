import { assertEquals } from "@std/assert";
import triggerMeNotController from "./triggerMeNot.ts";

Deno.test({
  name: "TriggerMeNot controller has OnFetch function",
  fn() {
    assertEquals(typeof triggerMeNotController.OnFetch, "function");
  },
});
