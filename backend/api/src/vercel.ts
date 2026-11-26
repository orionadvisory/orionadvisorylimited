import { getRequestListener } from "@hono/node-server";
import { buildApp } from "./main";

/**
 * Vercel Node.js function entry: a (req, res) handler around the same app the Docker
 * server runs. Built once per cold start. `api/index.js` re-exports this bundle.
 */
const { app } = buildApp();
export default getRequestListener(app.fetch);
