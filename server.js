import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const dataDir = join(rootDir, "data");
const eventFile = join(dataDir, "event.json");
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";
const staticFiles = new Map([
  ["/", "index.html"],
  ["/index.html", "index.html"],
  ["/styles.css", "styles.css"],
  ["/app.js", "app.js"],
]);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

await ensureEventFile();

const server = createServer(async (request, response) => {
  try {
    if (request.url?.startsWith("/api/event")) {
      await handleEventApi(request, response);
      return;
    }

    await serveStatic(request, response);
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: "internal_server_error" });
  }
});

server.listen(port, host, () => {
  console.log(`HiTZordu listening on http://${host}:${port}`);
});

async function handleEventApi(request, response) {
  if (request.method === "GET") {
    sendJson(response, 200, await readEvent());
    return;
  }

  if (request.method === "PUT") {
    const body = await readJsonBody(request);
    const event = normalizeEvent(body);
    await writeEvent(event);
    sendJson(response, 200, event);
    return;
  }

  response.writeHead(405, { Allow: "GET, PUT" });
  response.end();
}

async function serveStatic(request, response) {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  const fileName = staticFiles.get(url.pathname);

  if (!fileName) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const filePath = join(rootDir, fileName);
  const stream = createReadStream(filePath);
  stream.on("error", () => {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  });

  response.writeHead(200, {
    "content-type": contentTypes[extname(filePath)] || "application/octet-stream",
  });
  stream.pipe(response);
}

async function ensureEventFile() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readEvent();
  } catch {
    await writeEvent(createDefaultEvent());
  }
}

async function readEvent() {
  return JSON.parse(await readFile(eventFile, "utf8"));
}

async function writeEvent(event) {
  await writeFile(eventFile, `${JSON.stringify(event, null, 2)}\n`);
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
    if (Buffer.concat(chunks).byteLength > 1_000_000) {
      throw new Error("Request body too large");
    }
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function normalizeEvent(input) {
  const fallback = createDefaultEvent();
  return {
    id: typeof input.id === "string" ? input.id : fallback.id,
    title: cleanText(input.title, fallback.title),
    duration: [30, 60, 90].includes(Number(input.duration)) ? Number(input.duration) : fallback.duration,
    activeParticipantId:
      typeof input.activeParticipantId === "string" || input.activeParticipantId === null
        ? input.activeParticipantId
        : fallback.activeParticipantId,
    participants: Array.isArray(input.participants)
      ? input.participants.map(normalizeParticipant).filter(Boolean)
      : fallback.participants,
    updatedAt: new Date().toISOString(),
  };
}

function normalizeParticipant(participant) {
  if (!participant || typeof participant !== "object") {
    return null;
  }

  const name = cleanText(participant.name, "");
  if (!name) {
    return null;
  }

  return {
    id: typeof participant.id === "string" ? participant.id : `p-${randomUUID()}`,
    name,
    availability: normalizeAvailability(participant.availability),
  };
}

function normalizeAvailability(availability) {
  if (!availability || typeof availability !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(availability).filter(([, value]) =>
      ["available", "maybe", "unavailable"].includes(value),
    ),
  );
}

function cleanText(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 120) : fallback;
}

function createDefaultEvent() {
  return {
    id: "default",
    title: "Ikerketa taldeko bilera",
    duration: 60,
    activeParticipantId: null,
    participants: [],
    updatedAt: new Date().toISOString(),
  };
}
