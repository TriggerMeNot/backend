import { assertEquals } from "@std/assert";
import triggerMeNotActions from "./triggerMeNot.ts";
import ActionTrigger from "../types/ActionTrigger.ts";

Deno.test({
  name: "TriggerMeNot actions fetchRequest works",
  async fn() {
    const action: ActionTrigger = {
      id: 0,
      name: "Fetch Request",
      param: {},
      settings: {
        url: "https://example.com",
        method: "GET",
        headers: {},
      },
    };

    const result = await triggerMeNotActions.fetchRequest(action);

    assertEquals(
      result.status,
      200,
      "Expected status code to be 200",
    );
  },
});
