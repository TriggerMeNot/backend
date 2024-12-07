import ActionTrigger from "../types/ActionTrigger.ts";

interface FetchSettings {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
}

async function fetchRequest(action: ActionTrigger) {
  const settings = action.settings as FetchSettings;

  const fetchOptions: RequestInit = {
    method: settings.method,
    headers: settings.headers,
  };

  if (settings.method !== "GET" && settings.method !== "HEAD") {
    fetchOptions.body = settings.body;
  }

  const response = await fetch(settings.url, fetchOptions);
  await response.text(); // Consume the response body
  return response;
}

export default {
  fetchRequest,
};
