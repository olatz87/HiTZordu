const days = [
  { key: "2026-06-22", label: "Astelehena 22" },
  { key: "2026-06-23", label: "Asteartea 23" },
  { key: "2026-06-24", label: "Asteazkena 24" },
  { key: "2026-06-25", label: "Osteguna 25" },
  { key: "2026-06-26", label: "Ostirala 26" },
];

const times = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

const stateRank = {
  unavailable: 0,
  maybe: 1,
  available: 2,
};

const labels = {
  unavailable: "Ezinezkoa",
  maybe: "Behar izanez gero",
  available: "Bai",
};

const storageKey = "hitzordu.prototype.v1";

let state = loadState();
let activeMode = "available";
let isDragging = false;

const grid = document.querySelector("#availability-grid");
const participantsEl = document.querySelector("#participants");
const participantName = document.querySelector("#participant-name");
const activePersonLabel = document.querySelector("#active-person-label");
const bestSlotsEl = document.querySelector("#best-slots");
const titleInput = document.querySelector("#event-title");
const durationInput = document.querySelector("#duration");

document.querySelector("#add-participant").addEventListener("click", addParticipant);
document.querySelector("#reset-demo").addEventListener("click", resetData);
document.querySelector("#export-ics").addEventListener("click", exportCalendar);
titleInput.addEventListener("input", (event) => {
  state.title = event.target.value.trim() || "HiTZordu bilera";
  saveAndRender();
});
durationInput.addEventListener("change", (event) => {
  state.duration = Number(event.target.value);
  saveAndRender();
});

document.querySelectorAll(".mode").forEach((button) => {
  button.addEventListener("click", () => {
    activeMode = button.dataset.mode;
    document.querySelectorAll(".mode").forEach((mode) => mode.classList.remove("active"));
    button.classList.add("active");
  });
});

window.addEventListener("pointerup", () => {
  isDragging = false;
});

participantName.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addParticipant();
  }
});

render();

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    return JSON.parse(saved);
  }

  return {
    title: "Ikerketa taldeko bilera",
    duration: 60,
    activeParticipantId: "p1",
    participants: [
      { id: "p1", name: "Olatz", availability: seedAvailability("available", "maybe") },
      { id: "p2", name: "Aitor", availability: seedAvailability("maybe", "unavailable") },
      { id: "p3", name: "Miren", availability: seedAvailability("available", "unavailable") },
    ],
  };
}

function seedAvailability(primary, secondary) {
  const availability = {};
  days.forEach((day, dayIndex) => {
    times.forEach((time, timeIndex) => {
      const key = slotKey(day.key, time);
      if ((dayIndex + timeIndex) % 5 === 0) {
        availability[key] = secondary;
      } else if (timeIndex > 1 && timeIndex < 11 && dayIndex !== 4) {
        availability[key] = primary;
      }
    });
  });
  return availability;
}

function render() {
  titleInput.value = state.title;
  durationInput.value = String(state.duration);
  renderParticipants();
  renderGrid();
  renderBestSlots();
  saveState();
}

function renderParticipants() {
  participantsEl.innerHTML = "";

  state.participants.forEach((participant) => {
    const row = document.createElement("div");
    row.className = "participant";
    if (participant.id === state.activeParticipantId) {
      row.classList.add("active");
    }

    const name = document.createElement("button");
    name.type = "button";
    name.textContent = participant.name;
    name.addEventListener("click", () => {
      state.activeParticipantId = participant.id;
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

  const active = getActiveParticipant();
  activePersonLabel.textContent = active
    ? `${active.name}: ${labels[activeMode]} markatzen`
    : "Gehitu parte-hartzaile bat orduak markatzeko";
}

function renderGrid() {
  grid.innerHTML = "";
  grid.append(createCell("", "grid-cell header corner"));

  days.forEach((day) => {
    grid.append(createCell(day.label, "grid-cell header"));
  });

  times.forEach((time) => {
    grid.append(createCell(time, "grid-cell time"));
    days.forEach((day) => {
      const key = slotKey(day.key, time);
      const slot = createCell("", `grid-cell slot ${slotClass(key)}`);
      slot.dataset.key = key;
      slot.dataset.score = slotScoreLabel(key);
      slot.tabIndex = 0;
      slot.setAttribute("aria-label", `${day.label} ${time}: ${slotSummary(key)}`);
      slot.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        isDragging = true;
        markSlot(key);
      });
      slot.addEventListener("pointerenter", () => {
        if (isDragging) {
          markSlot(key);
        }
      });
      slot.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          markSlot(key);
        }
      });
      grid.append(slot);
    });
  });
}

function renderBestSlots() {
  const bestSlots = rankSlots().slice(0, 5);
  bestSlotsEl.innerHTML = "";

  bestSlots.forEach((slot) => {
    const item = document.createElement("li");
    item.textContent = `${formatSlot(slot.key)} - ${slot.available} bai, ${slot.maybe} behar izanez gero`;
    bestSlotsEl.append(item);
  });
}

function createCell(text, className) {
  const cell = document.createElement("div");
  cell.className = className;
  cell.textContent = text;
  return cell;
}

function addParticipant() {
  const name = participantName.value.trim();
  if (!name) {
    participantName.focus();
    return;
  }

  const id = `p${Date.now()}`;
  state.participants.push({ id, name, availability: {} });
  state.activeParticipantId = id;
  participantName.value = "";
  saveAndRender();
}

function removeParticipant(id) {
  state.participants = state.participants.filter((participant) => participant.id !== id);
  if (state.activeParticipantId === id) {
    state.activeParticipantId = state.participants[0]?.id || null;
  }
  saveAndRender();
}

function markSlot(key) {
  const active = getActiveParticipant();
  if (!active) {
    return;
  }
  active.availability[key] = activeMode;
  saveAndRender();
}

function slotClass(key) {
  const summary = summarizeSlot(key);
  if (summary.available > 0 && summary.maybe > 0) {
    return "mixed";
  }
  if (summary.available > 0) {
    return "available";
  }
  if (summary.maybe > 0) {
    return "maybe";
  }
  return "unavailable";
}

function slotScoreLabel(key) {
  const summary = summarizeSlot(key);
  if (summary.score === 0) {
    return "";
  }
  return `${summary.score}/${state.participants.length * 2}`;
}

function slotSummary(key) {
  const summary = summarizeSlot(key);
  return `${summary.available} bai, ${summary.maybe} behar izanez gero`;
}

function summarizeSlot(key) {
  return state.participants.reduce(
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

function rankSlots() {
  return days
    .flatMap((day) => times.map((time) => ({ key: slotKey(day.key, time), day: day.key, time })))
    .map((slot) => ({ ...slot, ...summarizeSlot(slot.key) }))
    .filter((slot) => slot.score > 0)
    .sort((a, b) => b.score - a.score || b.available - a.available || a.key.localeCompare(b.key));
}

function exportCalendar() {
  const selected = rankSlots().slice(0, 3);
  if (selected.length === 0) {
    return;
  }

  const events = selected.map((slot, index) => {
    const start = parseLocalSlot(slot.key);
    const end = new Date(start.getTime() + state.duration * 60 * 1000);
    return [
      "BEGIN:VEVENT",
      `UID:${crypto.randomUUID()}@hitzordu.local`,
      `DTSTAMP:${toIcsDate(new Date())}`,
      `DTSTART:${toIcsDate(start)}`,
      `DTEND:${toIcsDate(end)}`,
      `SUMMARY:${escapeIcsText(state.title)}${index > 0 ? ` aukera ${index + 1}` : ""}`,
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
  link.download = `${slugify(state.title)}.ics`;
  link.click();
  URL.revokeObjectURL(url);
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
  const day = days.find((item) => item.key === date)?.label || date;
  return `${day}, ${time}`;
}

function slotKey(day, time) {
  return `${day}T${time}`;
}

function getActiveParticipant() {
  return state.participants.find((participant) => participant.id === state.activeParticipantId);
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function saveAndRender() {
  saveState();
  render();
}

function resetData() {
  localStorage.removeItem(storageKey);
  state = loadState();
  activeMode = "available";
  document.querySelectorAll(".mode").forEach((mode) => {
    mode.classList.toggle("active", mode.dataset.mode === activeMode);
  });
  render();
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "hitzordu";
}

