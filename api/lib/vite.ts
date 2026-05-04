import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

type App = Hono<{ Bindings: HttpBindings }>;

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export function serveStaticFiles(app: App) {
  const distPath = path.resolve(__dirname, "../../dist");
  console.log(`[LUFIT-OS] Serving static files from: ${distPath}`);
  console.log(`[LUFIT-OS] CWD: ${process.cwd()}`);
  console.log(`[LUFIT-OS] __dirname: ${__dirname}`);
  
  // Log para debug: listar arquivos no diretório
  try {
    const files = fs.readdirSync(distPath);
    console.log(`[LUFIT-OS] Files in dist: ${files.join(", ")}`);
  } catch (e) {
    console.error(`[LUFIT-OS] ERROR reading dist: ${e}`);
  }

  app.use("*", serveStatic({ root: distPath }));

  app.notFound((c) => {
    const accept = c.req.header("accept") ?? "";
    console.log(`[LUFIT-OS] notFound handler: ${c.req.path}, accept: ${accept}`);
    if (!accept.includes("text/html")) {
      return c.json({ error: "Not Found" }, 404);
    }
    const indexPath = path.resolve(distPath, "index.html");
    console.log(`[LUFIT-OS] Serving index.html from: ${indexPath}`);
    try {
      const content = fs.readFileSync(indexPath, "utf-8");
      return c.html(content);
    } catch (e) {
      console.error(`[LUFIT-OS] ERROR reading index.html: ${e}`);
      return c.json({ error: "index.html not found" }, 500);
    }
  });
}
