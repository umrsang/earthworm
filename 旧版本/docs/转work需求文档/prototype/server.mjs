import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const mime = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
};

createServer((request, response) => {
  const relative = decodeURIComponent((request.url || "/").split("?")[0]).replace(/^\/+/, "");
  const candidate = normalize(join(root, relative || "index.html"));
  if (!candidate.startsWith(root) || !existsSync(candidate) || statSync(candidate).isDirectory()) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }
  response.writeHead(200, {
    "Content-Type": mime[extname(candidate)] || "application/octet-stream",
  });
  createReadStream(candidate).pipe(response);
}).listen(4178, "0.0.0.0");
