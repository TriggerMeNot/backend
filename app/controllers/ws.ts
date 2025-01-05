import { Context } from "@hono";

export function handleWebSocket(c: Context) {
  const upgradeHeader = c.req.header("Upgrade");

  if (upgradeHeader !== "websocket") {
    console.log("Invalid WebSocket request");
    return c.text("Invalid WebSocket request", 400);
  }

  const headers = new Headers();
  c.req.raw.headers.forEach((value, key) => {
    headers.append(key, value);
  });

  const request = new Request(c.req.url, {
    method: c.req.method,
    headers: headers,
  });

  try {
    const { socket, response } = Deno.upgradeWebSocket(request);

    socket.onopen = () => {
      console.log("WebSocket connection established");
    };


    socket.onmessage = (event) => {
      console.log(`Received message: ${event.data}`);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return response;
  } catch (error) {
    console.error("WebSocket upgrade failed:", error);
    return c.text("WebSocket upgrade failed", 500);
  }
}
