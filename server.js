import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const dataDir = join(rootDir, "data");
const storeFile = join(dataDir, "store.json");
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
};

await ensureStoreFile();

const server = createServer(async (request, response) => {
  try {
    if (request.url?.startsWith("/api/state")) {
      await handleStateApi(request, response);
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

async function handleStateApi(request, response) {
  if (request.method === "GET") {
    sendJson(response, 200, await readStore());
    return;
  }

  if (request.method === "PUT") {
    const body = await readJsonBody(request);
    const store = normalizeStore(body);
    await writeStore(store);
    sendJson(response, 200, store);
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

async function ensureStoreFile() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readStore();
  } catch {
    await writeStore(createDefaultStore());
  }
}

async function readStore() {
  const store = normalizeStore(JSON.parse(await readFile(storeFile, "utf8")));
  await writeStore(store);
  return store;
}

async function writeStore(store) {
  await writeFile(storeFile, `${JSON.stringify(store, null, 2)}\n`);
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    chunks.push(chunk);
    size += chunk.byteLength;
    if (size > 1_000_000) {
      throw new Error("Request body too large");
    }
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function normalizeStore(input) {
  const meetings = Array.isArray(input.meetings)
    ? input.meetings.map(normalizeMeeting).filter(Boolean)
    : [];
  const activeMeetingId = meetings.some((meeting) => meeting.id === input.activeMeetingId)
    ? input.activeMeetingId
    : meetings[0]?.id || null;

  return {
    activeMeetingId,
    meetings,
    updatedAt: new Date().toISOString(),
  };
}

function normalizeMeeting(meeting) {
  if (!meeting || typeof meeting !== "object") {
    return null;
  }

  const title = cleanText(meeting.title, "");
  const dates = Array.isArray(meeting.dates)
    ? [...new Set(meeting.dates.filter(isDateString))].sort()
    : [];

  if (!title || dates.length === 0) {
    return null;
  }

  const participants = Array.isArray(meeting.participants)
    ? meeting.participants.map(normalizeParticipant).filter(Boolean)
    : [];
  const activeParticipantId = participants.some((participant) => participant.id === meeting.activeParticipantId)
    ? meeting.activeParticipantId
    : participants[0]?.id || null;

  return {
    id: typeof meeting.id === "string" ? meeting.id : randomUUID(),
    title,
    duration: [30, 60, 90].includes(Number(meeting.duration)) ? Number(meeting.duration) : 60,
    dates,
    startTime: isTimeString(meeting.startTime) ? meeting.startTime : "09:00",
    endTime: isTimeString(meeting.endTime) ? meeting.endTime : "17:00",
    activeParticipantId,
    participants,
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
    id: typeof participant.id === "string" ? participant.id : randomUUID(),
    name,
    availability: normalizeAvailability(participant.availability),
  };
}

function normalizeAvailability(availability) {
  if (!availability || typeof availability !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(availability).filter(([, value]) => ["available", "maybe"].includes(value)),
  );
}

function cleanText(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 120) : fallback;
}

function createDefaultStore() {
  return {
    activeMeetingId: null,
    meetings: [],
    updatedAt: new Date().toISOString(),
  };
}

function isDateString(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isTimeString(value) {
  return typeof value === "string" && /^([01]\d|2[0-4]):[0-5]\d$/.test(value);
}
