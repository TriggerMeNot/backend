import { db } from "./config.ts";
import { services as serviceSchema } from "../schemas/services.ts";
import { reactions as reactionSchema } from "../schemas/reactions.ts";
import { actions as actionSchema } from "../schemas/actions.ts";
import { and, eq } from "drizzle-orm/expressions";
import { zodToJsonSchema } from "zod-to-json-schema";

import { FetchSettings, OnFetchParams } from "../interfaces/triggerMeNot.ts";
import { GithubIssueSettings } from "../interfaces/github.ts";
import {
  OnNewEmailGmailSettings,
  SendEmailGmailSettings,
} from "../interfaces/google.ts";
import {
  OnNewEmailOutlookSettings,
  SendEmailOutlookSettings,
} from "../interfaces/microsoft.ts";
import {
  OnNewMessageSettings,
  SendMessageSettings,
  SendTTSMessageSettings,
} from "../interfaces/discord.ts";

interface Element {
  id?: number;
  description: string;
  params?: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

interface Service {
  id?: number;
  description: string;
  actions?: Record<string, Element>;
  reactions?: Record<string, Element>;
}

const SERVICES: Record<string, Service> = {
  "TriggerMeNot": {
    description:
      "TriggerMeNot is the default service, I do not need to login to an external service to use it.",
    actions: {
      "On Fetch": {
        description: "When it fetches",
        params: zodToJsonSchema(OnFetchParams),
      },
    },
    reactions: {
      "Fetch Request": {
        description: "Fetch a URL",
        settings: zodToJsonSchema(FetchSettings),
      },
    },
  },
  "GitHub": {
    description:
      "GitHub is a code hosting platform for version control and collaboration.",
    actions: {
      "On Pull Request Opened": {
        description: "When a pull request is opened",
      },
    },
    reactions: {
      "Create Issue": {
        description: "Create a new issue in the specified repository",
        settings: zodToJsonSchema(GithubIssueSettings),
      },
    },
  },
  "Google": {
    description:
      "Google is an American multinational technology company that specializes in Internet-related services and products.",
    actions: {
      "On New Email (Gmail)": {
        description:
          "Check at each time of the interval if there is a unread email in the inbox",
        settings: zodToJsonSchema(OnNewEmailGmailSettings),
      },
    },
    reactions: {
      "Send Email (Gmail)": {
        description: "Send an email using the Gmail API",
        settings: zodToJsonSchema(SendEmailGmailSettings),
      },
    },
  },
  "Discord": {
    description:
      "Discord is a proprietary freeware VoIP application and digital distribution platform designed for video gaming communities.",
    actions: {
      "On New Message": {
        description: "When a message as been sent in the last 5 minutes",
        settings: zodToJsonSchema(OnNewMessageSettings),
      },
    },
    reactions: {
      "Send Message": {
        description: "Send a message to a channel",
        settings: zodToJsonSchema(SendMessageSettings),
      },
      "Send TTS Message": {
        description: "Send a TTS message to a channel",
        settings: zodToJsonSchema(SendTTSMessageSettings),
      },
    },
  },
  "Microsoft": {
    description:
      "Microsoft is an American multinational technology company with headquarters in Redmond, Washington.",
    actions: {
      "On New Email (Outlook)": {
        description:
          "Check at each time of the interval if there is a unread email in the inbox",
        settings: zodToJsonSchema(OnNewEmailOutlookSettings),
      },
    },
    reactions: {
      "Send Email (Outlook)": {
        description: "Send an email using the Outlook API",
        settings: zodToJsonSchema(SendEmailOutlookSettings),
      },
    },
  },
};

async function seedDatabase() {
  for (const [serviceName, service] of Object.entries(SERVICES)) {
    // Insert service
    const serviceRecord = await db.insert(serviceSchema).values({
      name: serviceName,
      description: service.description,
    }).onConflictDoNothing().returning();

    if (!serviceRecord.length) {
      const existingService = await db.select().from(serviceSchema).where(
        eq(serviceSchema.name, serviceName),
      ).limit(1);
      if (!existingService.length) {
        throw new Error(`Failed to insert or find service: ${serviceName}`);
      }
      serviceRecord.push(existingService[0]);
    }

    service.id = serviceRecord[0].id;

    // Insert reactions
    if (service.reactions) {
      for (
        const [reactionName, reaction] of Object.entries(service.reactions)
      ) {
        const reactionRecord = await db.insert(reactionSchema).values({
          serviceId: service.id,
          name: reactionName,
          description: reaction.description,
          settings: reaction.settings,
        }).onConflictDoNothing().returning();

        if (!reactionRecord.length) {
          const existingReaction = await db.select().from(reactionSchema).where(
            and(
              eq(reactionSchema.name, reactionName),
              eq(reactionSchema.serviceId, service.id),
            ),
          ).limit(1);
          if (!existingReaction.length) {
            throw new Error(
              `Failed to insert or find reaction: ${reactionName}`,
            );
          }
          reactionRecord.push(existingReaction[0]);
        }

        reaction.id = reactionRecord[0].id;
      }
    }

    // Insert actions
    if (service.actions) {
      for (
        const [actionName, action] of Object.entries(
          service.actions,
        )
      ) {
        const actionRecord = await db.insert(actionSchema).values({
          serviceId: service.id,
          name: actionName,
          description: action.description,
          params: action.params,
          settings: action.settings,
        }).onConflictDoNothing().returning();

        if (!actionRecord.length) {
          const existingAction = await db.select().from(actionSchema)
            .where(
              and(
                eq(actionSchema.name, actionName),
                eq(actionSchema.serviceId, service.id),
              ),
            ).limit(1);
          if (!existingAction.length) {
            throw new Error(
              `Failed to insert or find action: ${actionName}`,
            );
          }
          actionRecord.push(existingAction[0]);
        }

        action.id = actionRecord[0].id;
      }
    }
  }
}

export { seedDatabase, SERVICES };
