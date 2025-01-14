import { reactionTrigger } from "../utils/trigger.ts";
import type ReactionTrigger from "../types/ReactionTrigger.ts";
import triggerMeNot from "./triggerMeNot.ts";
import github from "./github.ts";
import google from "./google.ts";

async function run(reaction: ReactionTrigger) {
  try {
    switch (reaction.name) {
      case "Fetch Request":
        await triggerMeNot.fetchRequest(reaction);
        break;
      case "Create Issue":
        await github.createIssue(reaction);
        break;
      case "Send Email":
        await google.sendEmail(reaction);
        break;
      default:
        throw new Error("Reaction not found");
    }
    await reactionTrigger(reaction.id, reaction.param);
  } catch (error) {
    console.error(error);
  }
}

export default { run };
