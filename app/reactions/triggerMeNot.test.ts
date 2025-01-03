import { assertEquals } from "@std/assert";
import triggerMeNotReactions from "./triggerMeNot.ts";
import ReactionTrigger from "../types/ReactionTrigger.ts";

Deno.test({
  name: "TriggerMeNot reactions fetchRequest works",
  async fn() {
    const reaction: ReactionTrigger = {
      id: 0,
      name: "Fetch Request",
      param: {},
      settings: {
        url: "https://example.com",
        method: "GET",
        headers: {},
      },
    };

    const result = await triggerMeNotReactions.fetchRequest(reaction);

    assertEquals(
      result.status,
      200,
      "Expected status code to be 200",
    );
  },
});
