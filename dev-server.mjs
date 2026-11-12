// Servidor local para desarrollo: sirve los archivos estáticos y ejecuta las funciones de /api
// igual que lo hará Vercel. Uso: GEMINI_API_KEY=tu_clave npm run dev
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = fileURLToPath(new URL(".", import.meta.url));
const puerto = Number(process.env.PORT) || 3000;
const tipos = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp",
  ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".json": "application/json",
};

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    if (url.pathname.startsWith("/api/")) {
      const nombre = url.pathname.slice(5).replace(/[^a-z]/g, "");
      const mod = await import(`./api/${nombre}.js`);
      const trozos = [];
      for await (const t of req) trozos.push(t);
      const crudo = Buffer.concat(trozos).toString();
      try { req.body = crudo ? JSON.parse(crudo) : {}; } catch { req.body = {}; }
      res.status = (c) => { res.statusCode = c; return res; };
      res.json = (o) => { res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify(o)); };
      return await mod.default(req, res);
    }
    let ruta = normalize(decodeURIComponent(url.pathname));
    if (ruta.endsWith("/")) ruta += "index.html";
    if (!extname(ruta)) ruta += ".html";
    const archivo = join(raiz, ruta);
    if (!archivo.startsWith(raiz)) throw new Error("ruta inválida");
    const datos = await readFile(archivo);
    res.writeHead(200, { "Content-Type": tipos[extname(archivo)] || "application/octet-stream" });
    res.end(datos);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("No encontrado");
  }
}).listen(puerto, () => console.log(`Estatus Digital en http://localhost:${puerto}`));
