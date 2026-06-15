const stateRank = {
  unavailable: 0,
  maybe: 1,
  available: 2,
};

const weekdays = [
  { key: "weekday-1", short: "Al", long: "Astelehena" },
  { key: "weekday-2", short: "Ar", long: "Asteartea" },
  { key: "weekday-3", short: "Az", long: "Asteazkena" },
  { key: "weekday-4", short: "Og", long: "Osteguna" },
  { key: "weekday-5", short: "Or", long: "Ostirala" },
  { key: "weekday-6", short: "Lr", long: "Larunbata" },
  { key: "weekday-0", short: "Ig", long: "Igandea" },
];

const storageKey = "hitzordu.store.v3";

let store = createDefaultStore();
let draftMode = "dated";
let draftDates = [];
let draftWeekdays = weekdays.slice(0, 5).map((day) => day.key);
let calendarMonth = startOfMonth(new Date());
let selectedSlotKey = null;
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
const slotDetailsPanel = document.querySelector("#slot-details-panel");
const scheduleTitle = document.querySelector("#schedule-title");
const meetingTitle = document.querySelector("#meeting-title");
const selectedDatesEl = document.querySelector("#selected-dates");
const startTime = document.querySelector("#start-time");
const endTime = document.querySelector("#end-time");
const durationInput = document.querySelector("#duration");
const modeButtons = document.querySelectorAll("[data-meeting-mode]");
const datedChooser = document.querySelector("#dated-chooser");
const weeklyChooser = document.querySelector("#weekly-chooser");
const calendarTitle = document.querySelector("#calendar-title");
const calendarGrid = document.querySelector("#calendar-grid");
const weekdayChoices = document.querySelector("#weekday-choices");
const exportButton = document.querySelector("#export-ics");
const slotDetailsTitle = document.querySelector("#slot-details-title");
const slotDetails = document.querySelector("#slot-details");

document.querySelector("#new-meeting").addEventListener("click", showSetup);
document.querySelector("#create-meeting").addEventListener("click", createMeeting);
document.querySelector("#add-participant").addEventListener("click", addParticipant);
document.querySelector("#clear-meeting").addEventListener("click", clearActiveMeetingResponses);
document.querySelector("#prev-month").addEventListener("click", () => changeCalendarMonth(-1));
document.querySelector("#next-month").addEventListener("click", () => changeCalendarMonth(1));
exportButton.addEventListener("click", exportCalendar);

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    draftMode = button.dataset.meetingMode;
    renderSetupMode();
  });
});

participantName.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addParticipant();
  }
});

init();

async function init() {
  fillTimeSelects();
  store = await loadStore();
  renderWeekdayChoices();
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
  renderSetupMode();
  renderParticipants(meeting);
  renderBestSlots(meeting);
  renderSlotDetails(meeting);
  renderPanels(meeting);

  if (meeting) {
    scheduleTitle.textContent = meeting.title;
    exportButton.disabled = meeting.kind === "weekly";
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
  slotDetailsPanel.hidden = !meeting;
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
    button.innerHTML = `<strong>${escapeHtml(meeting.title)}</strong><span>${meetingSummary(meeting)}</span>`;
    button.addEventListener("click", () => {
      store.activeMeetingId = meeting.id;
      selectedSlotKey = null;
      saveAndRender();
    });
    meetingsEl.append(button);
  });
}

function renderSetupMode() {
  modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.meetingMode === draftMode);
  });
  datedChooser.hidden = draftMode !== "dated";
  weeklyChooser.hidden = draftMode !== "weekly";
  renderCalendar();
  renderDraftDates();
  renderWeekdayChoices();
}

function renderCalendar() {
  calendarTitle.textContent = new Intl.DateTimeFormat("eu", {
    month: "long",
    year: "numeric",
  }).format(calendarMonth);
  calendarGrid.innerHTML = "";

  weekdays.forEach((day) => {
    const header = document.createElement("div");
    header.className = "calendar-weekday";
    header.textContent = day.short;
    calendarGrid.append(header);
  });

  const firstDayOffset = (calendarMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();

  for (let index = 0; index < firstDayOffset; index += 1) {
    calendarGrid.append(createCell("", "calendar-empty"));
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = toDateInputValue(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day));
    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.classList.toggle("selected", draftDates.includes(date));
    button.textContent = String(day);
    button.addEventListener("click", () => toggleDraftDate(date));
    calendarGrid.append(button);
  }
}

function renderDraftDates() {
  selectedDatesEl.innerHTML = "";

  if (draftDates.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "Klikatu egutegiko egunak.";
    selectedDatesEl.append(empty);
    return;
  }

  draftDates.forEach((date) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "date-chip";
    chip.textContent = `${formatDate(date)} x`;
    chip.addEventListener("click", () => toggleDraftDate(date));
    selectedDatesEl.append(chip);
  });
}

function renderWeekdayChoices() {
  weekdayChoices.innerHTML = "";

  weekdays.forEach((day) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "weekday-choice";
    button.classList.toggle("selected", draftWeekdays.includes(day.key));
    button.textContent = day.long;
    button.addEventListener("click", () => {
      draftWeekdays = draftWeekdays.includes(day.key)
        ? draftWeekdays.filter((item) => item !== day.key)
        : [...draftWeekdays, day.key];
      draftWeekdays.sort(compareWeekdays);
      renderWeekdayChoices();
    });
    weekdayChoices.append(button);
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
  const columns = meetingColumns(meeting);
  const times = buildTimes(meeting.startTime, meeting.endTime);
  grid.style.setProperty("--day-count", columns.length);
  grid.innerHTML = "";
  grid.append(createCell("", "grid-cell header corner"));

  columns.forEach((column) => {
    grid.append(createCell(column.label, "grid-cell header"));
  });

  times.forEach((time) => {
    grid.append(createCell(time, "grid-cell time"));
    columns.forEach((column) => {
      const key = slotKey(column.key, time);
      const slot = createCell("", `grid-cell slot ${slotClass(meeting, key)}`);
      slot.classList.toggle("selected", key === selectedSlotKey);
      slot.dataset.key = key;
      slot.dataset.score = slotScoreLabel(meeting, key);
      slot.tabIndex = 0;
      slot.setAttribute("aria-label", `${column.label} ${time}: ${slotSummary(meeting, key)}`);
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
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${formatSlot(meeting, slot.key)} - ${slot.available} bai, ${slot.maybe} behar izanez gero`;
    button.addEventListener("click", () => {
      selectedSlotKey = slot.key;
      render();
    });
    item.append(button);
    bestSlotsEl.append(item);
  });
}

function renderSlotDetails(meeting) {
  slotDetails.innerHTML = "";

  if (!meeting || !selectedSlotKey) {
    slotDetailsTitle.textContent = "Hautatu gelaxka bat.";
    return;
  }

  slotDetailsTitle.textContent = formatSlot(meeting, selectedSlotKey);
  const groups = slotResponseGroups(meeting, selectedSlotKey);

  [
    ["Bai", groups.available],
    ["Behar izanez gero", groups.maybe],
    ["Ez / hutsik", groups.unavailable],
  ].forEach(([title, names]) => {
    const group = document.createElement("div");
    group.className = "slot-detail-group";

    const heading = document.createElement("h3");
    heading.textContent = `${title} (${names.length})`;

    const list = document.createElement("p");
    list.textContent = names.length > 0 ? names.join(", ") : "-";

    group.append(heading, list);
    slotDetails.append(group);
  });
}

function showSetup() {
  store.activeMeetingId = null;
  selectedSlotKey = null;
  draftDates = [];
  draftWeekdays = weekdays.slice(0, 5).map((day) => day.key);
  draftMode = "dated";
  calendarMonth = startOfMonth(new Date());
  meetingTitle.value = "";
  saveAndRender();
}

function toggleDraftDate(date) {
  draftDates = draftDates.includes(date)
    ? draftDates.filter((item) => item !== date)
    : [...draftDates, date].sort();
  renderCalendar();
  renderDraftDates();
}

function changeCalendarMonth(delta) {
  calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + delta, 1);
  renderCalendar();
}

function createMeeting() {
  const title = meetingTitle.value.trim();
  if (!title) {
    meetingTitle.focus();
    return;
  }

  const selected = draftMode === "dated" ? draftDates : draftWeekdays;
  if (selected.length === 0) {
    return;
  }

  if (timeToMinutes(startTime.value) >= timeToMinutes(endTime.value)) {
    endTime.focus();
    return;
  }

  const meeting = {
    id: createId(),
    kind: draftMode,
    title,
    duration: Number(durationInput.value),
    dates: draftMode === "dated" ? [...draftDates] : [],
    weekdays: draftMode === "weekly" ? [...draftWeekdays] : [],
    startTime: startTime.value,
    endTime: endTime.value,
    activeParticipantId: null,
    participants: [],
  };

  store.meetings.push(meeting);
  store.activeMeetingId = meeting.id;
  selectedSlotKey = null;
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
  selectedSlotKey = null;
  saveAndRender();
}

function cycleSlot(meeting, key) {
  selectedSlotKey = key;
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

function slotResponseGroups(meeting, key) {
  return meeting.participants.reduce(
    (groups, participant) => {
      const value = participant.availability[key];
      if (value === "available") {
        groups.available.push(participant.name);
      } else if (value === "maybe") {
        groups.maybe.push(participant.name);
      } else {
        groups.unavailable.push(participant.name);
      }
      return groups;
    },
    { available: [], maybe: [], unavailable: [] },
  );
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
  return meetingColumns(meeting)
    .flatMap((column) => buildTimes(meeting.startTime, meeting.endTime).map((time) => ({ key: slotKey(column.key, time) })))
    .map((slot) => ({ ...slot, ...summarizeSlot(meeting, slot.key) }))
    .filter((slot) => slot.score > 0)
    .sort((a, b) => b.score - a.score || b.available - a.available || a.key.localeCompare(b.key));
}

function exportCalendar() {
  const meeting = getActiveMeeting();
  if (!meeting || meeting.kind === "weekly") {
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

function meetingColumns(meeting) {
  if (meeting.kind === "weekly") {
    return meeting.weekdays.map((key) => ({
      key,
      label: weekdays.find((day) => day.key === key)?.long || key,
    }));
  }

  return meeting.dates.map((date) => ({
    key: date,
    label: formatDate(date),
  }));
}

function meetingSummary(meeting) {
  const count = meeting.kind === "weekly" ? meeting.weekdays.length : meeting.dates.length;
  const unit = meeting.kind === "weekly" ? "asteko egun" : "egun";
  return `${count} ${unit}, ${meeting.startTime}-${meeting.endTime}`;
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

function formatSlot(meeting, key) {
  const [column, time] = key.split("T");
  const label = meeting.kind === "weekly"
    ? weekdays.find((day) => day.key === column)?.long || column
    : formatDate(column);
  return `${label}, ${time}`;
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

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
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

function compareWeekdays(a, b) {
  return weekdays.findIndex((day) => day.key === a) - weekdays.findIndex((day) => day.key === b);
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
