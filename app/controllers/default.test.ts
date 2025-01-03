import { Context } from "@hono";
import { assertEquals } from "@std/assert";
import defaultController from "./default.ts";

Deno.test({
  name: "Default controller has root function",
  fn() {
    assertEquals(typeof defaultController.root, "function");
  },
});

Deno.test({
  name: "Default controller has root function",
  async fn() {
    const ctx = {
      text: (message: string) => new Response(message),
    } as unknown as Context;

    const result = defaultController.root(ctx);

    const expectedResponse = new Response("Hello Hono!");
    assertEquals(result.status, expectedResponse.status);
    assertEquals(await result.text(), await expectedResponse.text());
  },
});
