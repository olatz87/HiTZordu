const stateRank = {
  unavailable: 0,
  maybe: 1,
  available: 2,
};

const labels = {
  maybe: "Behar izanez gero",
  available: "Bai",
};

const storageKey = "hitzordu.store.v2";

let store = createDefaultStore();
let draftDates = [];
let backendAvailable = false;
let saveTimer = null;

const meetingsEl = document.querySelector("#meetings");
const participantsEl = document.querySelector("#participants");
const participantName = document.querySelector("#participant-name");
const activePersonLabel = document.querySelector("#active-person-label");
const bestSlotsEl = document.querySelector("#best-slots");
const grid = document.querySelector("#availability-grid");
const setupPanel = document.querySelector("#setup-panel");
const schedulePanel = document.querySelector("#schedule-panel");
const participantPanel = document.querySelector("#participant-panel");
const bestPanel = document.querySelector("#best-panel");
const scheduleTitle = document.querySelector("#schedule-title");
const meetingTitle = document.querySelector("#meeting-title");
const meetingDate = document.querySelector("#meeting-date");
const selectedDatesEl = document.querySelector("#selected-dates");
const startTime = document.querySelector("#start-time");
const endTime = document.querySelector("#end-time");
const durationInput = document.querySelector("#duration");

document.querySelector("#new-meeting").addEventListener("click", showSetup);
document.querySelector("#add-date").addEventListener("click", addDraftDate);
document.querySelector("#create-meeting").addEventListener("click", createMeeting);
document.querySelector("#add-participant").addEventListener("click", addParticipant);
document.querySelector("#clear-meeting").addEventListener("click", clearActiveMeetingResponses);
document.querySelector("#export-ics").addEventListener("click", exportCalendar);

participantName.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addParticipant();
  }
});

meetingDate.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addDraftDate();
  }
});

init();

async function init() {
  fillTimeSelects();
  meetingDate.value = toDateInputValue(new Date());
  store = await loadStore();
  render();
}

async function loadStore() {
  try {
    const response = await fetch("/api/state");
    if (response.ok) {
      backendAvailable = true;
      return await response.json();
    }
  } catch {
    backendAvailable = false;
  }

  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : createDefaultStore();
}

function createDefaultStore() {
  return {
    activeMeetingId: null,
    meetings: [],
  };
}

function render() {
  const meeting = getActiveMeeting();
  renderMeetings();
  renderDraftDates();
  renderParticipants(meeting);
  renderBestSlots(meeting);
  renderPanels(meeting);

  if (meeting) {
    scheduleTitle.textContent = meeting.title;
    renderGrid(meeting);
  } else {
    grid.innerHTML = "";
  }
}

function renderPanels(meeting) {
  setupPanel.hidden = Boolean(meeting);
  schedulePanel.hidden = !meeting;
  participantPanel.hidden = !meeting;
  bestPanel.hidden = !meeting;
}

function renderMeetings() {
  meetingsEl.innerHTML = "";

  if (store.meetings.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "Ez dago bilerarik oraindik.";
    meetingsEl.append(empty);
    return;
  }

  store.meetings.forEach((meeting) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "meeting-item";
    button.classList.toggle("active", meeting.id === store.activeMeetingId);
    button.innerHTML = `<strong>${escapeHtml(meeting.title)}</strong><span>${meeting.dates.length} egun, ${meeting.startTime}-${meeting.endTime}</span>`;
    button.addEventListener("click", () => {
      store.activeMeetingId = meeting.id;
      saveAndRender();
    });
    meetingsEl.append(button);
  });
}

function renderDraftDates() {
  selectedDatesEl.innerHTML = "";

  if (draftDates.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "Gehitu gutxienez egun bat.";
    selectedDatesEl.append(empty);
    return;
  }

  draftDates.forEach((date) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "date-chip";
    chip.textContent = `${formatDate(date)} x`;
    chip.addEventListener("click", () => {
      draftDates = draftDates.filter((item) => item !== date);
      renderDraftDates();
    });
    selectedDatesEl.append(chip);
  });
}

function renderParticipants(meeting) {
  participantsEl.innerHTML = "";

  if (!meeting) {
    activePersonLabel.textContent = "";
    return;
  }

  meeting.participants.forEach((participant) => {
    const row = document.createElement("div");
    row.className = "participant";
    row.classList.toggle("active", participant.id === meeting.activeParticipantId);

    const name = document.createElement("button");
    name.type = "button";
    name.textContent = participant.name;
    name.addEventListener("click", () => {
      meeting.activeParticipantId = participant.id;
      saveAndRender();
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.setAttribute("aria-label", `${participant.name} kendu`);
    remove.textContent = "x";
    remove.addEventListener("click", () => removeParticipant(participant.id));

    row.append(name, remove);
    participantsEl.append(row);
  });

  const active = getActiveParticipant(meeting);
  activePersonLabel.textContent = active
    ? `${active.name}: klik bakoitza Bai -> Behar izanez gero -> Hutsik`
    : "Gehitu parte-hartzaile bat orduak markatzeko";
}

function renderGrid(meeting) {
  const dates = meeting.dates;
  const times = buildTimes(meeting.startTime, meeting.endTime);
  grid.style.setProperty("--day-count", dates.length);
  grid.innerHTML = "";
  grid.append(createCell("", "grid-cell header corner"));

  dates.forEach((date) => {
    grid.append(createCell(formatDate(date), "grid-cell header"));
  });

  times.forEach((time) => {
    grid.append(createCell(time, "grid-cell time"));
    dates.forEach((date) => {
      const key = slotKey(date, time);
      const slot = createCell("", `grid-cell slot ${slotClass(meeting, key)}`);
      slot.dataset.key = key;
      slot.dataset.score = slotScoreLabel(meeting, key);
      slot.tabIndex = 0;
      slot.setAttribute("aria-label", `${formatDate(date)} ${time}: ${slotSummary(meeting, key)}`);
      slot.addEventListener("click", () => cycleSlot(meeting, key));
      slot.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          cycleSlot(meeting, key);
        }
      });
      grid.append(slot);
    });
  });
}

function renderBestSlots(meeting) {
  bestSlotsEl.innerHTML = "";

  if (!meeting) {
    return;
  }

  const bestSlots = rankSlots(meeting).slice(0, 5);
  if (bestSlots.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Oraindik ez dago erantzunik.";
    bestSlotsEl.append(item);
    return;
  }

  bestSlots.forEach((slot) => {
    const item = document.createElement("li");
    item.textContent = `${formatSlot(slot.key)} - ${slot.available} bai, ${slot.maybe} behar izanez gero`;
    bestSlotsEl.append(item);
  });
}

function showSetup() {
  store.activeMeetingId = null;
  draftDates = [];
  meetingTitle.value = "";
  meetingDate.value = toDateInputValue(new Date());
  saveAndRender();
}

function addDraftDate() {
  const date = meetingDate.value;
  if (!date || draftDates.includes(date)) {
    return;
  }

  draftDates = [...draftDates, date].sort();
  renderDraftDates();
}

function createMeeting() {
  const title = meetingTitle.value.trim();
  if (!title) {
    meetingTitle.focus();
    return;
  }

  if (draftDates.length === 0) {
    meetingDate.focus();
    return;
  }

  if (timeToMinutes(startTime.value) >= timeToMinutes(endTime.value)) {
    endTime.focus();
    return;
  }

  const meeting = {
    id: createId(),
    title,
    duration: Number(durationInput.value),
    dates: [...draftDates],
    startTime: startTime.value,
    endTime: endTime.value,
    activeParticipantId: null,
    participants: [],
  };

  store.meetings.push(meeting);
  store.activeMeetingId = meeting.id;
  draftDates = [];
  saveAndRender();
}

function addParticipant() {
  const meeting = getActiveMeeting();
  const name = participantName.value.trim();
  if (!meeting || !name) {
    participantName.focus();
    return;
  }

  const participant = { id: createId(), name, availability: {} };
  meeting.participants.push(participant);
  meeting.activeParticipantId = participant.id;
  participantName.value = "";
  saveAndRender();
}

function removeParticipant(id) {
  const meeting = getActiveMeeting();
  if (!meeting) {
    return;
  }

  meeting.participants = meeting.participants.filter((participant) => participant.id !== id);
  if (meeting.activeParticipantId === id) {
    meeting.activeParticipantId = meeting.participants[0]?.id || null;
  }
  saveAndRender();
}

function clearActiveMeetingResponses() {
  const meeting = getActiveMeeting();
  if (!meeting) {
    return;
  }

  meeting.participants = meeting.participants.map((participant) => ({
    ...participant,
    availability: {},
  }));
  saveAndRender();
}

function cycleSlot(meeting, key) {
  const active = getActiveParticipant(meeting);
  if (!active) {
    participantName.focus();
    return;
  }

  const current = active.availability[key];
  if (!current || current === "unavailable") {
    active.availability[key] = "available";
  } else if (current === "available") {
    active.availability[key] = "maybe";
  } else {
    delete active.availability[key];
  }
  saveAndRender();
}

function slotClass(meeting, key) {
  const active = getActiveParticipant(meeting);
  const ownValue = active?.availability[key];
  if (ownValue === "available") {
    return "available";
  }
  if (ownValue === "maybe") {
    return "maybe";
  }

  const summary = summarizeSlot(meeting, key);
  if (summary.available > 0 && summary.maybe > 0) {
    return "mixed";
  }
  if (summary.available > 0) {
    return "available-faint";
  }
  if (summary.maybe > 0) {
    return "maybe-faint";
  }
  return "unavailable";
}

function slotScoreLabel(meeting, key) {
  const summary = summarizeSlot(meeting, key);
  const positiveResponses = summary.available + summary.maybe;
  if (positiveResponses === 0 || meeting.participants.length === 0) {
    return "";
  }
  return `${positiveResponses}/${meeting.participants.length}`;
}

function slotSummary(meeting, key) {
  const summary = summarizeSlot(meeting, key);
  return `${summary.available} bai, ${summary.maybe} behar izanez gero`;
}

function summarizeSlot(meeting, key) {
  return meeting.participants.reduce(
    (summary, participant) => {
      const value = participant.availability[key] || "unavailable";
      if (value === "available") {
        summary.available += 1;
      }
      if (value === "maybe") {
        summary.maybe += 1;
      }
      summary.score += stateRank[value];
      return summary;
    },
    { available: 0, maybe: 0, score: 0 },
  );
}

function rankSlots(meeting) {
  return meeting.dates
    .flatMap((date) => buildTimes(meeting.startTime, meeting.endTime).map((time) => ({ key: slotKey(date, time) })))
    .map((slot) => ({ ...slot, ...summarizeSlot(meeting, slot.key) }))
    .filter((slot) => slot.score > 0)
    .sort((a, b) => b.score - a.score || b.available - a.available || a.key.localeCompare(b.key));
}

function exportCalendar() {
  const meeting = getActiveMeeting();
  if (!meeting) {
    return;
  }

  const selected = rankSlots(meeting).slice(0, 3);
  if (selected.length === 0) {
    return;
  }

  const events = selected.map((slot, index) => {
    const start = parseLocalSlot(slot.key);
    const end = new Date(start.getTime() + meeting.duration * 60 * 1000);
    return [
      "BEGIN:VEVENT",
      `UID:${createId()}@hitzordu.local`,
      `DTSTAMP:${toIcsDate(new Date())}`,
      `DTSTART:${toIcsDate(start)}`,
      `DTEND:${toIcsDate(end)}`,
      `SUMMARY:${escapeIcsText(meeting.title)}${index > 0 ? ` aukera ${index + 1}` : ""}`,
      `DESCRIPTION:${escapeIcsText(`${slot.available} bai, ${slot.maybe} behar izanez gero`)}`,
      "END:VEVENT",
    ].join("\r\n");
  });

  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HiTZ//HiTZordu//EU",
    "CALSCALE:GREGORIAN",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([calendar], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugify(meeting.title)}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

function fillTimeSelects() {
  const options = [];
  for (let minutes = 0; minutes <= 24 * 60; minutes += 30) {
    const time = minutesToTime(minutes);
    options.push(`<option value="${time}">${time}</option>`);
  }
  startTime.innerHTML = options.join("");
  endTime.innerHTML = options.join("");
  startTime.value = "09:00";
  endTime.value = "17:00";
}

function buildTimes(start, end) {
  const times = [];
  for (let minutes = timeToMinutes(start); minutes < timeToMinutes(end); minutes += 30) {
    times.push(minutesToTime(minutes));
  }
  return times;
}

function createCell(text, className) {
  const cell = document.createElement("div");
  cell.className = className;
  cell.textContent = text;
  return cell;
}

function parseLocalSlot(key) {
  const [date, time] = key.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

function toIcsDate(date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function escapeIcsText(text) {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function formatSlot(key) {
  const [date, time] = key.split("T");
  return `${formatDate(date)}, ${time}`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("eu", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(parseDate(date));
}

function parseDate(date) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateInputValue(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function slotKey(day, time) {
  return `${day}T${time}`;
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

function createId() {
  return globalThis.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function getActiveMeeting() {
  return store.meetings.find((meeting) => meeting.id === store.activeMeetingId);
}

function getActiveParticipant(meeting) {
  return meeting?.participants.find((participant) => participant.id === meeting.activeParticipantId);
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(store));
  if (!backendAvailable) {
    return;
  }

  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      const response = await fetch("/api/state", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(store),
      });
      backendAvailable = response.ok;
    } catch {
      backendAvailable = false;
    }
  }, 120);
}

function saveAndRender() {
  render();
  saveState();
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "hitzordu";
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return entities[char];
  });
}
