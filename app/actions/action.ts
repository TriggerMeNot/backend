import triggerMeNot from "./triggerMeNot.ts";
import type ActionTrigger from "../types/ActionTrigger.ts";
import { actionTrigger } from "../utils/trigger.ts";

function run(action: ActionTrigger) {
  switch (action.name) {
    case "Fetch Request":
      triggerMeNot.fetchRequest(action);
      break;
    default:
      throw new Error("Action not found");
  }

  actionTrigger(action.id, action.param);
}

export default { run };
