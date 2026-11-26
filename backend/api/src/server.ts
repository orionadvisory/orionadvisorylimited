import { serve } from "@hono/node-server";
import { buildApp } from "./main";

const { app, env } = buildApp();

const server = serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(JSON.stringify({ level: "info", msg: "orion api listening", port: info.port, env: env.NODE_ENV }));
});

function shutdown(signal: string) {
  console.log(JSON.stringify({ level: "info", msg: "shutting down", signal }));
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
