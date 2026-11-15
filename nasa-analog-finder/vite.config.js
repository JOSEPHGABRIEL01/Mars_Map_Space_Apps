import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.resolve(projectRoot, "frontend/data");

function generatedDataPlugin() {
  return {
    name: "serve-generated-data",
    configureServer(server) {
      server.middlewares.use("/data", (request, response, next) => {
        const requested = decodeURIComponent((request.url || "").split("?")[0]).replace(/^\/+/, "");
        const filePath = path.resolve(dataDirectory, requested);
        if (!filePath.startsWith(`${dataDirectory}${path.sep}`) || !fs.existsSync(filePath)) {
          next();
          return;
        }
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        fs.createReadStream(filePath).pipe(response);
      });
    },
    generateBundle() {
      for (const filename of fs.readdirSync(dataDirectory)) {
        const source = fs.readFileSync(path.join(dataDirectory, filename));
        this.emitFile({ type: "asset", fileName: `data/${filename}`, source });
      }
    },
  };
}

export default defineConfig({
  // The Python data pipeline writes generated JSON to frontend/data. The
  // plugin exposes that directory as /data without duplicating source files.
  publicDir: false,
  plugins: [generatedDataPlugin()],
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8000",
    },
  },
});
