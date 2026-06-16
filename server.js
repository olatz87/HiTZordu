import { createServer } from "node:http";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { spawn } from "node:child_process";
import ICAL from "ical.js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const dataDir = join(rootDir, "data");
const storeFile = join(dataDir, "store.json");
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";
const createToken = process.env.HITZORDU_CREATE_TOKEN || "";
const sendmailPath = process.env.HITZORDU_SENDMAIL || "/usr/sbin/sendmail";
const notifyFrom = process.env.HITZORDU_NOTIFY_FROM || "HiTZordu <hitzordu@localhost>";
const publicBaseUrl = process.env.HITZORDU_PUBLIC_BASE_URL || "";
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

if (!createToken) {
  console.warn("HITZORDU_CREATE_TOKEN is not set; meeting creation is open in this development run.");
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);
    if (url.pathname === "/api/meetings") {
      await handleMeetingsApi(request, response);
      return;
    }

    if (url.pathname === "/api/config") {
      await handleConfigApi(request, response);
      return;
    }

    if (url.pathname === "/api/calendar/availability") {
      await handleCalendarAvailabilityApi(request, response);
      return;
    }

    if (url.pathname.startsWith("/api/meetings/")) {
      await handleMeetingApi(request, response, decodeURIComponent(url.pathname.slice("/api/meetings/".length)));
      return;
    }

    if (url.pathname === "/api/state") {
      sendJson(response, 410, { error: "deprecated_endpoint" });
      return;
    }

    await serveStatic(request, response);
  } catch (error) {
    if (!error.status || error.status >= 500) {
      console.error(error);
    }
    sendJson(response, error.status || 500, { error: error.code || "internal_server_error" });
  }
});

server.listen(port, host, () => {
  console.log(`HiTZordu listening on http://${host}:${port}`);
});

async function handleConfigApi(request, response) {
  if (request.method !== "GET") {
    response.writeHead(405, securityHeaders({ Allow: "GET" }));
    response.end();
    return;
  }

  sendJson(response, 200, { createTokenRequired: Boolean(createToken) });
}

async function handleMeetingsApi(request, response) {
  if (request.method !== "POST") {
    response.writeHead(405, securityHeaders({ Allow: "POST" }));
    response.end();
    return;
  }

  if (!isValidCreateToken(request.headers["x-create-token"])) {
    sendJson(response, 403, { error: "invalid_create_token" });
    return;
  }

  const body = await readJsonBody(request);
  const meeting = normalizeMeeting(body.meeting || body);
  if (!meeting) {
    sendJson(response, 400, { error: "invalid_meeting" });
    return;
  }

  const store = await readStore();
  if (store.meetings.some((item) => item.id === meeting.id)) {
    meeting.id = randomUUID();
  }
  const createdMeeting = { ...meeting, participants: [], activeParticipantId: null };
  store.meetings.push(createdMeeting);
  store.activeMeetingId = createdMeeting.id;
  await writeStore(store);
  sendJson(response, 201, publicMeeting(createdMeeting));
}

async function handleCalendarAvailabilityApi(request, response) {
  if (request.method !== "POST") {
    response.writeHead(405, securityHeaders({ Allow: "POST" }));
    response.end();
    return;
  }

  const body = await readJsonBody(request);
  const meeting = normalizeMeeting(body.meeting);
  if (!meeting || meeting.kind !== "dated") {
    sendJson(response, 400, { error: "dated_meeting_required" });
    return;
  }

  const feeds = calendarFeedUrls(body.calendarUrl);
  if (feeds.length === 0) {
    sendJson(response, 400, { error: "unsupported_calendar_url" });
    return;
  }

  const busyRanges = [];
  const windowRange = meetingDateWindow(meeting);
  for (const feedUrl of feeds) {
    const ics = await fetchCalendarFeed(feedUrl);
    busyRanges.push(...busyRangesFromIcs(ics, windowRange));
  }

  sendJson(response, 200, {
    availability: calendarAvailability(meeting, busyRanges),
    calendars: feeds.length,
    busyRanges: busyRanges.length,
  });
}

async function handleMeetingApi(request, response, meetingId) {
  if (!meetingId) {
    sendJson(response, 404, { error: "not_found" });
    return;
  }

  if (request.method === "GET") {
    const meeting = findMeeting(await readStore(), meetingId);
    if (!meeting) {
      sendJson(response, 404, { error: "not_found" });
      return;
    }
    sendJson(response, 200, publicMeeting(meeting));
    return;
  }

  if (request.method === "PUT") {
    const store = await readStore();
    const index = store.meetings.findIndex((meeting) => meeting.id === meetingId);
    if (index === -1) {
      sendJson(response, 404, { error: "not_found" });
      return;
    }

    const body = await readJsonBody(request);
    const updated = normalizeMeetingResponses(store.meetings[index], body.meeting || body);
    store.meetings[index] = updated;
    store.activeMeetingId = updated.id;
    await writeStore(store);
    if (await notifyOrganizerIfReady(updated)) {
      store.meetings[index] = updated;
      await writeStore(store);
    }
    sendJson(response, 200, publicMeeting(updated));
    return;
  }

  response.writeHead(405, securityHeaders({ Allow: "GET, PUT" }));
  response.end();
}

async function serveStatic(request, response) {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  const fileName = staticFiles.get(url.pathname);

  if (!fileName) {
    response.writeHead(404, securityHeaders({ "content-type": "text/plain; charset=utf-8" }));
    response.end("Not found");
    return;
  }

  const filePath = join(rootDir, fileName);
  const stream = createReadStream(filePath);
  stream.on("error", () => {
    response.writeHead(404, securityHeaders({ "content-type": "text/plain; charset=utf-8" }));
    response.end("Not found");
  });

  response.writeHead(200, securityHeaders({
    "content-type": contentTypes[extname(filePath)] || "application/octet-stream",
  }));
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
      throwHttpError(413, "request_body_too_large");
    }
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    throwHttpError(400, "invalid_json");
  }
}

function sendJson(response, status, payload) {
  response.writeHead(status, securityHeaders({ "content-type": "application/json; charset=utf-8" }));
  response.end(JSON.stringify(payload));
}

function securityHeaders(headers = {}) {
  return {
    "x-content-type-options": "nosniff",
    "referrer-policy": "same-origin",
    "content-security-policy": "default-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
    ...headers,
  };
}

function throwHttpError(status, code) {
  const error = new Error(code);
  error.status = status;
  error.code = code;
  throw error;
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
  const kind = meeting.kind === "weekly" ? "weekly" : "dated";
  const dates = Array.isArray(meeting.dates)
    ? [...new Set(meeting.dates.filter(isDateString))].sort()
    : [];
  const weekdays = Array.isArray(meeting.weekdays)
    ? [...new Set(meeting.weekdays.filter(isWeekdayKey))].sort(compareWeekdays)
    : [];

  if (!title || (kind === "dated" && dates.length === 0) || (kind === "weekly" && weekdays.length === 0)) {
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
    kind,
    title,
    duration: [30, 60, 90].includes(Number(meeting.duration)) ? Number(meeting.duration) : 60,
    dates: kind === "dated" ? dates : [],
    weekdays: kind === "weekly" ? weekdays : [],
    startTime: isTimeString(meeting.startTime) ? meeting.startTime : "09:00",
    endTime: isTimeString(meeting.endTime) ? meeting.endTime : "17:00",
    expectedResponses: normalizeExpectedResponses(meeting.expectedResponses),
    organizerEmail: normalizeEmail(meeting.organizerEmail),
    notificationSentAt: typeof meeting.notificationSentAt === "string" ? meeting.notificationSentAt : null,
    activeParticipantId,
    participants,
  };
}

function normalizeMeetingResponses(existingMeeting, input) {
  const participants = input && typeof input === "object" && Array.isArray(input.participants)
    ? input.participants.map(normalizeParticipant).filter(Boolean)
    : existingMeeting.participants;
  const activeParticipantId = participants.some((participant) => participant.id === input?.activeParticipantId)
    ? input.activeParticipantId
    : participants[0]?.id || null;

  return {
    ...existingMeeting,
    activeParticipantId,
    participants,
  };
}

function findMeeting(store, meetingId) {
  return store.meetings.find((meeting) => meeting.id === meetingId) || null;
}

function isValidCreateToken(value) {
  if (!createToken) {
    return true;
  }

  if (typeof value !== "string" || !value) {
    return false;
  }

  const expected = Buffer.from(createToken);
  const actual = Buffer.from(value);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function publicMeeting(meeting) {
  const { organizerEmail, notificationSentAt, ...publicFields } = meeting;
  return publicFields;
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

function normalizeExpectedResponses(value) {
  const count = Number(value);
  return Number.isInteger(count) && count > 0 && count <= 500 ? count : null;
}

function normalizeEmail(value) {
  if (typeof value !== "string") {
    return "";
  }

  const email = value.trim().slice(0, 254);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

async function notifyOrganizerIfReady(meeting) {
  if (!meeting.expectedResponses || !meeting.organizerEmail || meeting.notificationSentAt) {
    return false;
  }

  const completedCount = countCompletedParticipants(meeting);
  if (completedCount < meeting.expectedResponses) {
    return false;
  }

  const sent = await sendOrganizerNotification(meeting, completedCount);
  if (!sent) {
    return false;
  }

  meeting.notificationSentAt = new Date().toISOString();
  return true;
}

function countCompletedParticipants(meeting) {
  return meeting.participants.filter((participant) => Object.keys(participant.availability).length > 0).length;
}

function sendOrganizerNotification(meeting, completedCount) {
  return new Promise((resolve, reject) => {
    const child = spawn(sendmailPath, ["-t"], { stdio: ["pipe", "ignore", "pipe"] });
    const errors = [];

    child.stderr.on("data", (chunk) => {
      errors.push(chunk);
    });
    child.stdin.on("error", (error) => {
      errors.push(Buffer.from(error.message));
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(true);
        return;
      }
      reject(new Error(`sendmail exited with code ${code}: ${Buffer.concat(errors).toString("utf8")}`));
    });

    child.stdin.end(buildNotificationEmail(meeting, completedCount));
  }).catch((error) => {
    console.error(`Could not send notification for meeting ${meeting.id}:`, error.message);
    return false;
  });
}

function buildNotificationEmail(meeting, completedCount) {
  const meetingUrl = publicBaseUrl ? `${publicBaseUrl.replace(/\/$/, "")}/?meeting=${encodeURIComponent(meeting.id)}` : "";
  const lines = [
    `From: ${sanitizeHeaderValue(notifyFrom)}`,
    `To: ${meeting.organizerEmail}`,
    `Subject: ${encodeMimeHeader(`HiTZordu: ${meeting.title}`)}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    `Kaixo,`,
    "",
    `"${meeting.title}" bilerak ${completedCount}/${meeting.expectedResponses} erantzun jaso ditu.`,
    "HiTZordu ireki eta tarte onenak begiratu ditzakezu.",
  ];

  if (meetingUrl) {
    lines.push("", meetingUrl);
  }

  lines.push("", "HiTZordu");
  return `${lines.join("\n")}\n`;
}

function encodeMimeHeader(value) {
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function sanitizeHeaderValue(value) {
  return String(value).replace(/[\r\n]+/g, " ").trim();
}

function calendarFeedUrls(value) {
  if (typeof value !== "string" || value.length > 4_000) {
    return [];
  }

  let url;
  try {
    url = new URL(value.trim());
  } catch {
    return [];
  }

  if (url.protocol !== "https:" || url.hostname !== "calendar.google.com") {
    return [];
  }

  if (url.pathname === "/calendar/embed") {
    return url.searchParams.getAll("src")
      .map(decodeCalendarSource)
      .filter(Boolean)
      .map((calendarId) => `https://calendar.google.com/calendar/ical/${encodeURIComponent(calendarId)}/public/basic.ics`);
  }

  if (url.pathname.startsWith("/calendar/ical/") && url.pathname.endsWith("/public/basic.ics")) {
    return [url.toString()];
  }

  return [];
}

function decodeCalendarSource(value) {
  if (!value || value.length > 512) {
    return "";
  }

  const decoded = decodeURIComponent(value);
  if (decoded.includes("@")) {
    return decoded;
  }

  try {
    return Buffer.from(decoded, "base64").toString("utf8");
  } catch {
    return "";
  }
}

async function fetchCalendarFeed(url) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: { "user-agent": "HiTZordu/0.1" },
  });
  if (!response.ok) {
    throwHttpError(400, "calendar_feed_not_accessible");
  }

  const text = await readResponseText(response, 2_000_000);
  if (new URL(response.url).hostname !== "calendar.google.com") {
    throwHttpError(400, "calendar_feed_not_accessible");
  }
  if (!text.includes("BEGIN:VCALENDAR")) {
    throwHttpError(400, "invalid_calendar_feed");
  }
  return text;
}

async function readResponseText(response, limit) {
  const reader = response.body?.getReader();
  if (!reader) {
    return response.text();
  }

  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    size += value.byteLength;
    if (size > limit) {
      throwHttpError(413, "calendar_feed_too_large");
    }
    chunks.push(value);
  }

  return Buffer.concat(chunks).toString("utf8");
}

function busyRangesFromIcs(ics, windowRange) {
  const calendar = new ICAL.Component(ICAL.parse(ics));
  const events = calendar.getAllSubcomponents("vevent").map((component) => new ICAL.Event(component));
  const expansionStart = new Date(windowRange.start.getTime() - 7 * 24 * 60 * 60 * 1_000);
  const windowStart = ICAL.Time.fromJSDate(expansionStart, false);
  const ranges = [];

  for (const event of events) {
    const transparency = event.component.getFirstPropertyValue("transp") || "";
    if (String(transparency).toUpperCase() === "TRANSPARENT") {
      continue;
    }

    if (!event.isRecurring()) {
      addBusyRange(ranges, event.startDate.toJSDate(), event.endDate.toJSDate(), windowRange);
      continue;
    }

    const iterator = event.iterator(windowStart);
    for (let index = 0; index < 1_000; index += 1) {
      const next = iterator.next();
      if (!next) {
        break;
      }
      const occurrence = event.getOccurrenceDetails(next);
      const start = occurrence.startDate.toJSDate();
      const end = occurrence.endDate.toJSDate();
      if (start > windowRange.end) {
        break;
      }
      addBusyRange(ranges, start, end, windowRange);
    }
  }

  return ranges;
}

function addBusyRange(ranges, start, end, windowRange) {
  if (end <= windowRange.start || start >= windowRange.end) {
    return;
  }

  ranges.push({
    start: new Date(Math.max(start.getTime(), windowRange.start.getTime())),
    end: new Date(Math.min(end.getTime(), windowRange.end.getTime())),
  });
}

function meetingDateWindow(meeting) {
  const sortedDates = [...meeting.dates].sort();
  return {
    start: parseLocalDateTime(sortedDates[0], "00:00"),
    end: new Date(parseLocalDateTime(sortedDates.at(-1), "23:59").getTime() + 60_000),
  };
}

function calendarAvailability(meeting, busyRanges) {
  return Object.fromEntries(
    meeting.dates.flatMap((date) => buildTimes(meeting.startTime, meeting.endTime).map((time) => {
      const key = `${date}T${time}`;
      const start = parseLocalDateTime(date, time);
      const end = new Date(start.getTime() + 30 * 60 * 1_000);
      return [key, overlapsBusyRange(start, end, busyRanges) ? "" : "available"];
    })),
  );
}

function overlapsBusyRange(start, end, busyRanges) {
  return busyRanges.some((range) => start < range.end && end > range.start);
}

function parseLocalDateTime(date, time) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

function buildTimes(start, end) {
  const times = [];
  for (let minutes = timeToMinutes(start); minutes < timeToMinutes(end); minutes += 30) {
    times.push(minutesToTime(minutes));
  }
  return times;
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const normalized = minutes % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
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

function isWeekdayKey(value) {
  return typeof value === "string" && /^weekday-[0-6]$/.test(value);
}

function compareWeekdays(a, b) {
  return weekdayIndex(a) - weekdayIndex(b);
}

function weekdayIndex(value) {
  const day = Number(value.replace("weekday-", ""));
  return day === 0 ? 7 : day;
}
