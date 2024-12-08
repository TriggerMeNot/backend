import triggerMeNot from "./triggerMeNot.ts";
import type ReactionTrigger from "../types/ReactionTrigger.ts";
import { reactionTrigger } from "../utils/trigger.ts";

function run(reaction: ReactionTrigger) {
  switch (reaction.name) {
    case "Fetch Request":
      triggerMeNot.fetchRequest(reaction);
      break;
    default:
      throw new Error("Reaction not found");
  }

  reactionTrigger(reaction.id, reaction.param);
}

export default { run };
