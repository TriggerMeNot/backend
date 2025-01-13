import { reactionTrigger } from "../utils/trigger.ts";
import type ReactionTrigger from "../types/ReactionTrigger.ts";
import triggerMeNot from "./triggerMeNot.ts";
import github from "./github.ts";
import google from "./google.ts";

function run(reaction: ReactionTrigger) {
  switch (reaction.name) {
    case "Fetch Request":
      triggerMeNot.fetchRequest(reaction);
      break;
    case "Create Issue":
      github.createIssue(reaction);
      break;
    case "Send Email":
      google.sendEmail(reaction);
      break;
    default:
      throw new Error("Reaction not found");
  }

  reactionTrigger(reaction.id, reaction.param);
}

export default { run };
