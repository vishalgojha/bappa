import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}

async function body(req) {
  let data = "";
  for await (const chunk of req) data += chunk;
  return JSON.parse(data || "{}");
}

async function handle(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === "/api/config") {
    return json(res, 200, { spotifyClientId: process.env.SPOTIFY_CLIENT_ID || "", elevenLabsReady: Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID) });
  }
  if (url.pathname === "/api/speech" && req.method === "POST") {
    if (!process.env.ELEVENLABS_API_KEY || !process.env.ELEVENLABS_VOICE_ID) return json(res, 503, { error: "ElevenLabs is not configured on the server." });
    try {
      const { text } = await body(req);
      if (!text || text.length > 1800) return json(res, 400, { error: "Text is required and must be under 1800 characters." });
      const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`, {
        method: "POST",
        headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "content-type": "application/json", accept: "audio/mpeg" },
        body: JSON.stringify({ text, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.55, similarity_boost: 0.75 } })
      });
      if (!upstream.ok) return json(res, upstream.status, { error: `ElevenLabs error (${upstream.status}).` });
      const audio = Buffer.from(await upstream.arrayBuffer());
      res.writeHead(200, { "content-type": "audio/mpeg", "cache-control": "no-store" });
      return res.end(audio);
    } catch (error) { return json(res, 400, { error: error.message }); }
  }
  const file = url.pathname === "/" ? "/index.html" : url.pathname;
  try {
    const filePath = path.join(root, "public", path.normalize(file));
    if (!filePath.startsWith(path.join(root, "public"))) throw new Error("bad path");
    const content = await fs.readFile(filePath);
    const type = filePath.endsWith(".html") ? "text/html; charset=utf-8" : filePath.endsWith(".js") ? "text/javascript; charset=utf-8" : "text/css; charset=utf-8";
    res.writeHead(200, { "content-type": type }); res.end(content);
  } catch { res.writeHead(404); res.end("Not found"); }
}

http.createServer(handle).listen(port, "0.0.0.0", () => console.log(`Ganesh Radio listening on ${port}`));
