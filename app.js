const stateRank = {
  unavailable: 0,
  maybe: 1,
  available: 2,
};

const weekdays = [
  { key: "weekday-1", short: { eu: "Al", en: "Mon" }, long: { eu: "Astelehena", en: "Monday" } },
  { key: "weekday-2", short: { eu: "Ar", en: "Tue" }, long: { eu: "Asteartea", en: "Tuesday" } },
  { key: "weekday-3", short: { eu: "Az", en: "Wed" }, long: { eu: "Asteazkena", en: "Wednesday" } },
  { key: "weekday-4", short: { eu: "Og", en: "Thu" }, long: { eu: "Osteguna", en: "Thursday" } },
  { key: "weekday-5", short: { eu: "Or", en: "Fri" }, long: { eu: "Ostirala", en: "Friday" } },
  { key: "weekday-6", short: { eu: "Lr", en: "Sat" }, long: { eu: "Larunbata", en: "Saturday" } },
  { key: "weekday-0", short: { eu: "Ig", en: "Sun" }, long: { eu: "Igandea", en: "Sunday" } },
];

const storageKey = "hitzordu.store.v3";
const languageKey = "hitzordu.language";
const supportedLanguages = ["eu", "en"];
const translations = {
  eu: {
    addParticipant: "Gehitu",
    available: "Bai",
    bestEmptyNoResponses: "Oraindik ez dago erantzunik.",
    bestEmptyNoPositive: "Ez dago tarte positiborik iraupen osoarekin.",
    bestFallback: "Ez dago aukera bateraturik; hurbilenak",
    bestFlexible: "Aukera onenak, if-need-be kontuan",
    bestOptimal: "Emaitza optimoak",
    bestTitle: "Tarte onenak",
    bestWithMaybe: "Denek bai edo behar izanez gero",
    brandEyebrow: "EHU · HiTZ ikerketa taldea",
    calendarImportOnlyDated: "Google Calendar inportazioa data zehatzetako bileretan bakarrik dago erabilgarri.",
    calendarImportOnlyDatedShort: "Inportazioa data zehatzetako bileretan bakarrik dago erabilgarri.",
    calendarImportRead: "{count} egutegi irakurrita; libre dauden tarteak markatu dira.",
    calendarNotAccessible: "Egutegia ez da publikoa edo ezin da irakurri.",
    calendarTooLarge: "Egutegia handiegia da.",
    calendarLinkLabel: "Google Calendar esteka publikoa",
    calendarReading: "Egutegia irakurtzen...",
    clearResponses: "Erantzunak garbitu",
    copyShareLink: "Esteka kopiatu",
    createMeetingButton: "Bilera sortu",
    createMeetingTitle: "Sortu bilera",
    createToken: "Sortzeko tokena",
    cancel: "Utzi",
    datedMeetingRequired: "Inportazioa data zehatzetako bileretan bakarrik dago erabilgarri.",
    duration: "Iraupena",
    editParticipant: "Editatu",
    editParticipantAria: "{name} editatu",
    emailInvalid: "Email helbidea ez da baliozkoa.",
    empty: "Hutsik",
    endAfterStart: "Amaiera hasiera baino beranduago jarri.",
    endTime: "Amaiera",
    expectedInvalid: "Espero diren erantzunak 1 eta 500 arteko zenbaki osoa izan behar du.",
    expectedResponses: "Espero diren erantzunak",
    generalMeeting: "Bilera orokorra",
    importCalendar: "Google Calendarretik inportatu",
    importCalendarFailed: "Ezin izan da egutegia irakurri.",
    importCalendarNoMeeting: "Ireki edo sortu bilera bat lehenengo.",
    importCalendarNoName: "Idatzi izena edo hautatu parte-hartzaile bat lehenengo.",
    importCalendarNoUrl: "Itsatsi Google Calendar esteka publikoa.",
    invalidCalendarFeed: "Estekak ez du egutegi baliozkorik eman.",
    maybe: "Behar izanez gero",
    meetingName: "Bileraren izena",
    meetingNamePlaceholder: "Adib. Latxa artikuluaren jarraipena",
    meetingTypeAria: "Bilera mota",
    myCalendar: "Nire egutegia",
    nameLabel: "Izena",
    namePlaceholder: "Adib. Olatz",
    newMeeting: "Bilera berria",
    nextMonth: "Hurrengo hilabetea",
    noActiveParticipant: "Gehitu parte-hartzaile bat orduak markatzeko",
    optionalPlaceholder: "Hautazkoa",
    organizerEmail: "Antolatzailearen emaila",
    organizerEmailRequired: "Sartu antolatzailearen emaila abisua bidaltzeko.",
    participantClickHelp: "{name}: klik bakoitza Bai -> Behar izanez gero -> Hutsik",
    participantTitle: "Parte-hartzailea",
    personalCalendarAria: "Nire erabilgarritasuna",
    previousMonth: "Aurreko hilabetea",
    save: "Gorde",
    schedulePanelAria: "Erabilgarritasun sarea",
    scheduleTitleDefault: "Aukeratu orduak",
    selectAtLeastOneDay: "Aukeratu gutxienez egun bat.",
    selectedDatesEmpty: "Klikatu egutegiko egunak.",
    setupPanelAria: "Bilera konfiguratu",
    shareLink: "Esteka",
    shareTitle: "Partekatu",
    slotDetailsDefault: "Hautatu gelaxka bat.",
    slotDetailsTitle: "Orduaren xehetasuna",
    specificDates: "Data zehatzak",
    startTime: "Hasiera",
    legendAria: "Egoeren azalpena",
    teamCalendar: "Taldearen egutegia",
    teamCalendarAria: "Taldearen emaitza",
    tokenInvalid: "Tokena ez da zuzena edo ezin izan da bilera sortu.",
    tokenRequired: "Sartu sortzeko tokena.",
    unavailable: "Ez / hutsik",
    unsupportedCalendarUrl: "Erabili Google Calendar embed/newembed edo public .ics esteka bat.",
  },
  en: {
    addParticipant: "Add",
    available: "Yes",
    bestEmptyNoResponses: "There are no responses yet.",
    bestEmptyNoPositive: "No positive slots cover the full duration.",
    bestFallback: "No shared option; closest matches",
    bestFlexible: "Best options including if-need-be",
    bestOptimal: "Optimal results",
    bestTitle: "Best slots",
    bestWithMaybe: "Everyone yes or if-need-be",
    brandEyebrow: "EHU · HiTZ research group",
    calendarImportOnlyDated: "Google Calendar import is only available for meetings with specific dates.",
    calendarImportOnlyDatedShort: "Import is only available for meetings with specific dates.",
    calendarImportRead: "{count} calendars read; free slots have been marked.",
    calendarNotAccessible: "The calendar is not public or could not be read.",
    calendarTooLarge: "The calendar is too large.",
    calendarLinkLabel: "Public Google Calendar link",
    calendarReading: "Reading calendar...",
    clearResponses: "Clear responses",
    copyShareLink: "Copy link",
    createMeetingButton: "Create meeting",
    createMeetingTitle: "Create meeting",
    createToken: "Creation token",
    cancel: "Cancel",
    datedMeetingRequired: "Import is only available for meetings with specific dates.",
    duration: "Duration",
    editParticipant: "Edit",
    editParticipantAria: "Edit {name}",
    emailInvalid: "The email address is not valid.",
    empty: "Empty",
    endAfterStart: "Set the end time later than the start time.",
    endTime: "End",
    expectedInvalid: "Expected responses must be a whole number between 1 and 500.",
    expectedResponses: "Expected responses",
    generalMeeting: "General meeting",
    importCalendar: "Import from Google Calendar",
    importCalendarFailed: "Could not read the calendar.",
    importCalendarNoMeeting: "Open or create a meeting first.",
    importCalendarNoName: "Enter a name or select a participant first.",
    importCalendarNoUrl: "Paste the public Google Calendar link.",
    invalidCalendarFeed: "The link did not return a valid calendar.",
    maybe: "If need be",
    meetingName: "Meeting name",
    meetingNamePlaceholder: "E.g. Latxa paper follow-up",
    meetingTypeAria: "Meeting type",
    myCalendar: "My calendar",
    nameLabel: "Name",
    namePlaceholder: "E.g. Olatz",
    newMeeting: "New meeting",
    nextMonth: "Next month",
    noActiveParticipant: "Add a participant to mark times",
    optionalPlaceholder: "Optional",
    organizerEmail: "Organizer email",
    organizerEmailRequired: "Enter the organizer email to send the notification.",
    participantClickHelp: "{name}: each click cycles Yes -> If need be -> Empty",
    participantTitle: "Participant",
    personalCalendarAria: "My availability",
    previousMonth: "Previous month",
    save: "Save",
    schedulePanelAria: "Availability grid",
    scheduleTitleDefault: "Choose times",
    selectAtLeastOneDay: "Choose at least one day.",
    selectedDatesEmpty: "Click days in the calendar.",
    setupPanelAria: "Configure meeting",
    shareLink: "Link",
    shareTitle: "Share",
    slotDetailsDefault: "Select a cell.",
    slotDetailsTitle: "Slot details",
    specificDates: "Specific dates",
    startTime: "Start",
    legendAria: "Status legend",
    teamCalendar: "Team calendar",
    teamCalendarAria: "Team result",
    tokenInvalid: "The token is incorrect or the meeting could not be created.",
    tokenRequired: "Enter the creation token.",
    unavailable: "No / empty",
    unsupportedCalendarUrl: "Use a Google Calendar embed/newembed or public .ics link.",
  },
};

let store = createDefaultStore();
let draftMode = "dated";
let draftDates = [];
let draftWeekdays = weekdays.slice(0, 5).map((day) => day.key);
let calendarMonth = startOfMonth(new Date());
let selectedSlotKey = null;
let dragPaintState = null;
let backendAvailable = false;
let createTokenRequired = false;
let saveTimer = null;
let currentLanguage = readStoredLanguage();
let editingParticipantId = null;

const participantsEl = document.querySelector("#participants");
const participantName = document.querySelector("#participant-name");
const activePersonLabel = document.querySelector("#active-person-label");
const calendarUrl = document.querySelector("#calendar-url");
const importCalendar = document.querySelector("#import-calendar");
const calendarImportStatus = document.querySelector("#calendar-import-status");
const bestSlotsEl = document.querySelector("#best-slots");
const personalGrid = document.querySelector("#personal-grid");
const summaryGrid = document.querySelector("#summary-grid");
const setupPanel = document.querySelector("#setup-panel");
const schedulePanel = document.querySelector("#schedule-panel");
const sharePanel = document.querySelector("#share-panel");
const participantPanel = document.querySelector("#participant-panel");
const bestPanel = document.querySelector("#best-panel");
const slotDetailsPanel = document.querySelector("#slot-details-panel");
const scheduleTitle = document.querySelector("#schedule-title");
const meetingTitle = document.querySelector("#meeting-title");
const createToken = document.querySelector("#create-token");
const expectedResponses = document.querySelector("#expected-responses");
const organizerEmail = document.querySelector("#organizer-email");
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
const slotDetailsTitle = document.querySelector("#slot-details-title");
const slotDetails = document.querySelector("#slot-details");
const shareLink = document.querySelector("#share-link");
const copyShareLink = document.querySelector("#copy-share-link");
const setupError = document.querySelector("#setup-error");
const languageToggle = document.querySelector("#language-toggle");

document.querySelector("#new-meeting").addEventListener("click", showSetup);
document.querySelector("#create-meeting").addEventListener("click", createMeeting);
document.querySelector("#add-participant").addEventListener("click", addParticipant);
importCalendar.addEventListener("click", importCalendarAvailability);
document.querySelector("#clear-meeting").addEventListener("click", clearActiveMeetingResponses);
document.querySelector("#prev-month").addEventListener("click", () => changeCalendarMonth(-1));
document.querySelector("#next-month").addEventListener("click", () => changeCalendarMonth(1));
copyShareLink.addEventListener("click", copyCurrentShareLink);
languageToggle.addEventListener("click", toggleLanguage);

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

window.addEventListener("pointerup", () => {
  dragPaintState = null;
});

window.addEventListener("pointercancel", () => {
  dragPaintState = null;
});

init();

async function init() {
  applyTranslations();
  fillTimeSelects();
  store = await loadStore();
  applyMeetingFromUrl();
  renderWeekdayChoices();
  render();
}

async function loadStore() {
  await loadBackendConfig();

  const meetingId = new URLSearchParams(window.location.search).get("meeting");
  if (meetingId) {
    try {
      const response = await fetch(`/api/meetings/${encodeURIComponent(meetingId)}`);
      if (response.ok) {
        backendAvailable = true;
        const meeting = await response.json();
        return { activeMeetingId: meeting.id, meetings: [meeting] };
      }
    } catch {
      backendAvailable = false;
    }
  }

  try {
    const response = await fetch("/api/state");
    if (response.ok) {
      backendAvailable = true;
      return await response.json();
    }
    if (response.status === 410) {
      backendAvailable = true;
      return createDefaultStore();
    }
  } catch {
    backendAvailable = false;
  }

  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : createDefaultStore();
}

async function loadBackendConfig() {
  try {
    const response = await fetch("/api/config");
    if (response.ok) {
      backendAvailable = true;
      const config = await response.json();
      createTokenRequired = Boolean(config.createTokenRequired);
      return;
    }
  } catch {
    backendAvailable = false;
  }

  createTokenRequired = false;
}

function createDefaultStore() {
  return {
    activeMeetingId: null,
    meetings: [],
  };
}

function readStoredLanguage() {
  const saved = localStorage.getItem(languageKey);
  return supportedLanguages.includes(saved) ? saved : "eu";
}

function toggleLanguage() {
  currentLanguage = currentLanguage === "eu" ? "en" : "eu";
  localStorage.setItem(languageKey, currentLanguage);
  render();
}

function locale() {
  return currentLanguage === "eu" ? "eu" : "en-GB";
}

function t(key, values = {}) {
  const template = translations[currentLanguage][key] || translations.eu[key] || key;
  return Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, value),
    template,
  );
}

function weekdayLabel(day, field) {
  return day?.[field]?.[currentLanguage] || day?.[field]?.eu || "";
}

function applyTranslations() {
  document.documentElement.lang = currentLanguage;
  languageToggle.textContent = currentLanguage === "eu" ? "English" : "Euskara";
  languageToggle.setAttribute(
    "aria-label",
    currentLanguage === "eu" ? "Change language to English" : "Aldatu hizkuntza euskarara",
  );

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
}

function render() {
  const meeting = getActiveMeeting();
  applyTranslations();
  renderShareLink(meeting);
  renderSetupMode();
  renderParticipants(meeting);
  renderBestSlots(meeting);
  renderSlotDetails(meeting);
  renderPanels(meeting);

  if (meeting) {
    scheduleTitle.textContent = meeting.title;
    renderGrids(meeting);
  } else {
    personalGrid.innerHTML = "";
    summaryGrid.innerHTML = "";
  }
}

function renderPanels(meeting) {
  setupPanel.hidden = Boolean(meeting);
  schedulePanel.hidden = !meeting;
  sharePanel.hidden = !meeting;
  participantPanel.hidden = !meeting;
  bestPanel.hidden = !meeting;
  slotDetailsPanel.hidden = !meeting;
}

function renderShareLink(meeting) {
  shareLink.value = meeting ? meetingShareUrl(meeting.id) : "";
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
  calendarTitle.textContent = new Intl.DateTimeFormat(locale(), {
    month: "long",
    year: "numeric",
  }).format(calendarMonth);
  calendarGrid.innerHTML = "";

  weekdays.forEach((day) => {
    const header = document.createElement("div");
    header.className = "calendar-weekday";
    header.textContent = weekdayLabel(day, "short");
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
    empty.textContent = t("selectedDatesEmpty");
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
    button.textContent = weekdayLabel(day, "long");
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
    calendarImportStatus.textContent = "";
    return;
  }

  importCalendar.disabled = meeting.kind !== "dated";
  calendarUrl.disabled = meeting.kind !== "dated";
  if (meeting.kind === "weekly") {
    calendarImportStatus.textContent = t("calendarImportOnlyDated");
  }

  meeting.participants.forEach((participant) => {
    const row = document.createElement("div");
    row.className = "participant";
    row.classList.toggle("active", participant.id === meeting.activeParticipantId);

    if (participant.id === editingParticipantId) {
      const input = document.createElement("input");
      input.className = "participant-name-edit";
      input.value = participant.name;
      input.setAttribute("aria-label", t("nameLabel"));

      const save = document.createElement("button");
      save.type = "button";
      save.className = "participant-edit";
      save.textContent = t("save");
      save.addEventListener("click", () => saveParticipantName(participant.id, input.value));

      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "participant-edit secondary";
      cancel.textContent = t("cancel");
      cancel.addEventListener("click", () => {
        editingParticipantId = null;
        render();
      });

      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          saveParticipantName(participant.id, input.value);
        }
        if (event.key === "Escape") {
          editingParticipantId = null;
          render();
        }
      });

      row.append(input, save, cancel);
      participantsEl.append(row);
      requestAnimationFrame(() => {
        input.focus();
        input.select();
      });
      return;
    }

    const name = document.createElement("button");
    name.type = "button";
    name.className = "participant-name";
    name.textContent = participant.name;
    name.addEventListener("click", () => {
      meeting.activeParticipantId = participant.id;
      saveAndRender();
    });

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "participant-edit";
    edit.setAttribute("aria-label", t("editParticipantAria", { name: participant.name }));
    edit.textContent = t("editParticipant");
    edit.addEventListener("click", () => editParticipantName(participant.id));

    row.append(name, edit);
    participantsEl.append(row);
  });

  const active = getActiveParticipant(meeting);
  activePersonLabel.textContent = active
    ? t("participantClickHelp", { name: active.name })
    : t("noActiveParticipant");
}

function renderGrids(meeting) {
  renderPersonalGrid(meeting);
  renderSummaryGrid(meeting);
}

function renderPersonalGrid(meeting) {
  const columns = meetingColumns(meeting);
  const times = buildTimes(meeting.startTime, meeting.endTime);
  const active = getActiveParticipant(meeting);
  personalGrid.style.setProperty("--day-count", columns.length);
  personalGrid.innerHTML = "";
  personalGrid.append(createCell("", "grid-cell header corner"));

  columns.forEach((column, index) => {
    const className = `grid-cell header${hasColumnGap(meeting, columns, index) ? " gap-before" : ""}`;
    personalGrid.append(createCell(column.label, className));
  });

  times.forEach((time) => {
    personalGrid.append(createCell(time, "grid-cell time"));
    columns.forEach((column, index) => {
      const key = slotKey(column.key, time);
      const gapClass = hasColumnGap(meeting, columns, index) ? " gap-before" : "";
      const slot = createCell("", `grid-cell slot ${personalSlotClass(active, key)}${gapClass}`);
      slot.classList.toggle("selected", key === selectedSlotKey);
      slot.dataset.key = key;
      slot.tabIndex = 0;
      slot.setAttribute("aria-label", `${column.label} ${time}: ${personalSlotSummary(active, key)}`);
      slot.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) {
          return;
        }
        event.preventDefault();
        beginPaintSlot(meeting, key);
      });
      slot.addEventListener("pointerenter", () => {
        paintSlot(meeting, key);
      });
      slot.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          cycleSlot(meeting, key);
        }
      });
      personalGrid.append(slot);
    });
  });
}

function renderSummaryGrid(meeting) {
  const columns = meetingColumns(meeting);
  const times = buildTimes(meeting.startTime, meeting.endTime);
  summaryGrid.style.setProperty("--day-count", columns.length);
  summaryGrid.innerHTML = "";
  summaryGrid.append(createCell("", "grid-cell header corner"));

  columns.forEach((column, index) => {
    const className = `grid-cell header${hasColumnGap(meeting, columns, index) ? " gap-before" : ""}`;
    summaryGrid.append(createCell(column.label, className));
  });

  times.forEach((time) => {
    summaryGrid.append(createCell(time, "grid-cell time"));
    columns.forEach((column, index) => {
      const key = slotKey(column.key, time);
      const gapClass = hasColumnGap(meeting, columns, index) ? " gap-before" : "";
      const slot = createCell("", `grid-cell slot ${summarySlotClass(meeting, key)}${gapClass}`);
      slot.classList.toggle("selected", key === selectedSlotKey);
      slot.dataset.key = key;
      slot.dataset.score = slotScoreLabel(meeting, key);
      setSummarySlotIntensity(slot, meeting, key);
      slot.tabIndex = 0;
      slot.title = slotTooltip(meeting, key);
      slot.setAttribute("aria-label", `${column.label} ${time}: ${slotTooltip(meeting, key)}`);
      slot.addEventListener("click", () => selectSlot(key));
      slot.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectSlot(key);
        }
      });
      summaryGrid.append(slot);
    });
  });
}

function renderBestSlots(meeting) {
  bestSlotsEl.innerHTML = "";

  if (!meeting) {
    return;
  }

  const rankedSlots = rankSlots(meeting);
  if (rankedSlots.length === 0) {
    const item = document.createElement("p");
    item.className = "muted";
    item.textContent = meeting.participants.length === 0
      ? t("bestEmptyNoResponses")
      : t("bestEmptyNoPositive");
    bestSlotsEl.append(item);
    return;
  }

  const optimalSlots = rankedSlots.filter((slot) => slot.kind === "optimal").slice(0, 5);
  const flexibleSlots = rankedSlots.filter((slot) => slot.kind === "flexible").slice(0, 5);
  const fallbackSlots = rankedSlots.filter((slot) => slot.kind === "fallback").slice(0, 5);

  if (optimalSlots.length > 0) {
    appendBestSlotGroup(t("bestOptimal"), optimalSlots, meeting);
    if (flexibleSlots.length > 0) {
      appendBestSlotGroup(t("bestWithMaybe"), flexibleSlots, meeting);
    }
    return;
  }

  if (flexibleSlots.length > 0) {
    appendBestSlotGroup(t("bestFlexible"), flexibleSlots, meeting);
    return;
  }

  appendBestSlotGroup(t("bestFallback"), fallbackSlots, meeting);
}

function appendBestSlotGroup(title, slots, meeting) {
  const group = document.createElement("section");
  group.className = "best-slot-group";

  const heading = document.createElement("h3");
  heading.textContent = title;
  const list = document.createElement("ol");

  slots.forEach((slot) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${formatSlotBlock(meeting, slot)} - ${slot.available} ${t("available").toLowerCase()}, ${slot.maybe} ${t("maybe").toLowerCase()}`;
    button.addEventListener("click", () => {
      selectedSlotKey = slot.key;
      render();
    });
    item.append(button);
    list.append(item);
  });

  group.append(heading, list);
  bestSlotsEl.append(group);
}

function renderSlotDetails(meeting) {
  slotDetails.innerHTML = "";

  if (!meeting || !selectedSlotKey) {
    slotDetailsTitle.textContent = t("slotDetailsDefault");
    return;
  }

  slotDetailsTitle.textContent = formatSlot(meeting, selectedSlotKey);
  const groups = slotResponseGroups(meeting, selectedSlotKey);

  [
    [t("available"), groups.available],
    [t("maybe"), groups.maybe],
    [t("unavailable"), groups.unavailable],
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
  setMeetingUrl(null);
  draftDates = [];
  draftWeekdays = weekdays.slice(0, 5).map((day) => day.key);
  draftMode = "dated";
  calendarMonth = startOfMonth(new Date());
  meetingTitle.value = "";
  createToken.value = "";
  expectedResponses.value = "";
  organizerEmail.value = "";
  setSetupError("");
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

async function createMeeting() {
  const title = meetingTitle.value.trim();
  setSetupError("");
  if (!title) {
    meetingTitle.focus();
    return;
  }

  const token = createToken.value;
  if (!token && createTokenRequired) {
    setSetupError(t("tokenRequired"));
    createToken.focus();
    return;
  }

  const notificationSettings = readNotificationSettings();
  if (!notificationSettings) {
    return;
  }

  const selected = draftMode === "dated" ? draftDates : draftWeekdays;
  if (selected.length === 0) {
    setSetupError(t("selectAtLeastOneDay"));
    return;
  }

  if (timeToMinutes(startTime.value) >= timeToMinutes(endTime.value)) {
    setSetupError(t("endAfterStart"));
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
    ...notificationSettings,
    activeParticipantId: null,
    participants: [],
  };

  const created = await createMeetingOnServer(meeting, token);
  if (!created) {
    setSetupError(t("tokenInvalid"));
    createToken.focus();
    return;
  }

  store.meetings = [created];
  store.activeMeetingId = created.id;
  selectedSlotKey = null;
  setMeetingUrl(created.id);
  draftDates = [];
  createToken.value = "";
  expectedResponses.value = "";
  organizerEmail.value = "";
  saveAndRender();
}

function readNotificationSettings() {
  const expected = expectedResponses.value ? Number(expectedResponses.value) : null;
  const email = organizerEmail.value.trim();

  if (!expected && !email) {
    return { expectedResponses: null, organizerEmail: "" };
  }

  if (!Number.isInteger(expected) || expected < 1 || expected > 500) {
    setSetupError(t("expectedInvalid"));
    expectedResponses.focus();
    return null;
  }

  if (!email) {
    setSetupError(t("organizerEmailRequired"));
    organizerEmail.focus();
    return null;
  }

  if (!organizerEmail.validity.valid) {
    setSetupError(t("emailInvalid"));
    organizerEmail.focus();
    return null;
  }

  return { expectedResponses: expected, organizerEmail: email };
}

function setSetupError(message) {
  setupError.textContent = message;
  setupError.hidden = !message;
}

async function createMeetingOnServer(meeting, token) {
  if (!backendAvailable) {
    return meeting;
  }

  try {
    const response = await fetch("/api/meetings", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-create-token": token,
      },
      body: JSON.stringify({ meeting }),
    });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    backendAvailable = false;
    return meeting;
  }
}

function addParticipant() {
  const meeting = getActiveMeeting();
  const name = participantName.value.trim();
  if (!meeting || !name) {
    participantName.focus();
    return;
  }

  createParticipant(meeting, name);
  participantName.value = "";
  saveAndRender();
}

async function importCalendarAvailability() {
  const meeting = getActiveMeeting();
  const url = calendarUrl.value.trim();

  if (!meeting) {
    participantName.focus();
    calendarImportStatus.textContent = t("importCalendarNoMeeting");
    return;
  }

  if (meeting.kind !== "dated") {
    calendarImportStatus.textContent = t("calendarImportOnlyDatedShort");
    return;
  }

  if (!url) {
    calendarUrl.focus();
    calendarImportStatus.textContent = t("importCalendarNoUrl");
    return;
  }

  let active = getActiveParticipant(meeting);
  if (!active) {
    const name = participantName.value.trim();
    if (!name) {
      participantName.focus();
      calendarImportStatus.textContent = t("importCalendarNoName");
      return;
    }
    active = createParticipant(meeting, name);
    participantName.value = "";
  }

  importCalendar.disabled = true;
  calendarImportStatus.textContent = t("calendarReading");

  try {
    const response = await fetch("/api/calendar/availability", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ calendarUrl: url, meeting }),
    });
    const result = await response.json();
    if (!response.ok) {
      calendarImportStatus.textContent = calendarImportError(result.error);
      return;
    }

    Object.entries(result.availability).forEach(([key, value]) => {
      if (value === "available") {
        active.availability[key] = "available";
      } else {
        delete active.availability[key];
      }
    });
    calendarImportStatus.textContent = t("calendarImportRead", { count: result.calendars });
    saveAndRender();
  } catch {
    calendarImportStatus.textContent = t("importCalendarFailed");
  } finally {
    importCalendar.disabled = false;
  }
}

function createParticipant(meeting, name) {
  const participant = { id: createId(), name, availability: {} };
  meeting.participants.push(participant);
  meeting.activeParticipantId = participant.id;
  return participant;
}

function calendarImportError(error) {
  const messages = {
    calendar_feed_not_accessible: t("calendarNotAccessible"),
    calendar_feed_too_large: t("calendarTooLarge"),
    dated_meeting_required: t("datedMeetingRequired"),
    invalid_calendar_feed: t("invalidCalendarFeed"),
    unsupported_calendar_url: t("unsupportedCalendarUrl"),
  };
  return messages[error] || t("importCalendarFailed");
}

function editParticipantName(id) {
  editingParticipantId = id;
  render();
}

function saveParticipantName(id, rawName) {
  const meeting = getActiveMeeting();
  if (!meeting) {
    return;
  }

  const participant = meeting.participants.find((item) => item.id === id);
  if (!participant) {
    return;
  }

  const nextName = rawName.trim();
  if (!nextName) {
    return;
  }

  participant.name = nextName;
  meeting.activeParticipantId = participant.id;
  editingParticipantId = null;
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

function beginPaintSlot(meeting, key) {
  const active = getActiveParticipant(meeting);
  if (!active) {
    participantName.focus();
    return;
  }

  dragPaintState = nextAvailability(active.availability[key]);
  paintSlot(meeting, key);
}

function paintSlot(meeting, key) {
  if (dragPaintState === null) {
    return;
  }

  const active = getActiveParticipant(meeting);
  if (!active) {
    return;
  }

  selectedSlotKey = key;
  if (dragPaintState) {
    active.availability[key] = dragPaintState;
  } else {
    delete active.availability[key];
  }
  saveAndRender();
}

function nextAvailability(current) {
  if (!current || current === "unavailable") {
    return "available";
  }
  if (current === "available") {
    return "maybe";
  }
  return "";
}

function selectSlot(key) {
  selectedSlotKey = key;
  render();
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

function slotTooltip(meeting, key) {
  const groups = slotResponseGroups(meeting, key);
  return [
    `${t("available")}: ${formatNames(groups.available)}`,
    `${t("maybe")}: ${formatNames(groups.maybe)}`,
    `${t("unavailable")}: ${formatNames(groups.unavailable)}`,
  ].join("\n");
}

function formatNames(names) {
  return names.length > 0 ? names.join(", ") : "-";
}

function personalSlotClass(participant, key) {
  const ownValue = participant?.availability[key];
  if (ownValue === "available") {
    return "available";
  }
  if (ownValue === "maybe") {
    return "maybe";
  }
  return "unavailable";
}

function summarySlotClass(meeting, key) {
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

function summarySlotStrength(meeting, key) {
  if (meeting.participants.length === 0) {
    return 0;
  }

  const summary = summarizeSlot(meeting, key);
  const weightedScore = summary.available + summary.maybe * 0.55;
  return Math.max(0, Math.min(1, weightedScore / meeting.participants.length));
}

function setSummarySlotIntensity(slot, meeting, key) {
  const strength = summarySlotStrength(meeting, key);
  slot.style.setProperty("--available-mix", `${Math.round(26 + strength * 58)}%`);
  slot.style.setProperty("--maybe-mix", `${Math.round(24 + strength * 52)}%`);
  slot.style.setProperty("--mixed-available-mix", `${Math.round(32 + strength * 58)}%`);
  slot.style.setProperty("--mixed-maybe-mix", `${Math.round(28 + strength * 50)}%`);
}

function personalSlotSummary(participant, key) {
  const value = participant?.availability[key];
  if (value === "available") {
    return t("available");
  }
  if (value === "maybe") {
    return t("maybe");
  }
  return t("empty");
}

function slotScoreLabel(meeting, key) {
  const summary = summarizeSlot(meeting, key);
  const positiveResponses = summary.available + summary.maybe;
  if (positiveResponses === 0 || meeting.participants.length === 0) {
    return "";
  }
  return `${positiveResponses}/${meeting.participants.length}`;
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
    .flatMap((column) => buildStartTimes(meeting).map((time) => ({ key: slotKey(column.key, time) })))
    .map((slot) => ({ ...slot, ...summarizeSlotBlock(meeting, slot.key) }))
    .filter((slot) => slot.score > 0)
    .map((slot) => ({ ...slot, kind: bestSlotKind(meeting, slot) }))
    .sort(compareRankedSlots);
}

function summarizeSlotBlock(meeting, key) {
  const keys = slotBlockKeys(meeting, key);
  return meeting.participants.reduce(
    (summary, participant) => {
      const values = keys.map((slot) => participant.availability[slot] || "unavailable");
      const hasUnavailable = values.some((value) => value === "unavailable");
      const hasMaybe = values.some((value) => value === "maybe");

      if (!hasUnavailable && !hasMaybe) {
        summary.available += 1;
        summary.score += stateRank.available;
      } else if (!hasUnavailable) {
        summary.maybe += 1;
        summary.score += stateRank.maybe;
      }

      return summary;
    },
    { available: 0, maybe: 0, score: 0 },
  );
}

function bestSlotKind(meeting, slot) {
  if (slot.available === meeting.participants.length) {
    return "optimal";
  }
  if (slot.available + slot.maybe === meeting.participants.length) {
    return "flexible";
  }
  return "fallback";
}

function compareRankedSlots(a, b) {
  const kindOrder = { optimal: 0, flexible: 1, fallback: 2 };
  const aPositive = a.available + a.maybe;
  const bPositive = b.available + b.maybe;
  return kindOrder[a.kind] - kindOrder[b.kind]
    || bPositive - aPositive
    || b.available - a.available
    || b.score - a.score
    || a.key.localeCompare(b.key);
}

function slotBlockKeys(meeting, key) {
  const [column, start] = key.split("T");
  return buildBlockTimes(start, meeting.duration).map((time) => slotKey(column, time));
}

function formatSlotBlock(meeting, slot) {
  const endTimeLabel = minutesToTime(timeToMinutes(slot.key.split("T")[1]) + meeting.duration);
  return `${formatSlot(meeting, slot.key)}-${endTimeLabel}`;
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

function buildStartTimes(meeting) {
  const times = [];
  const start = timeToMinutes(meeting.startTime);
  const latestStart = timeToMinutes(meeting.endTime) - meeting.duration;
  for (let minutes = start; minutes <= latestStart; minutes += 30) {
    times.push(minutesToTime(minutes));
  }
  return times;
}

function buildBlockTimes(start, duration) {
  const times = [];
  for (let offset = 0; offset < duration; offset += 30) {
    times.push(minutesToTime(timeToMinutes(start) + offset));
  }
  return times;
}

function meetingColumns(meeting) {
  if (meeting.kind === "weekly") {
    return meeting.weekdays.map((key) => ({
      key,
      label: weekdayLabel(weekdays.find((day) => day.key === key), "long") || key,
    }));
  }

  return meeting.dates.map((date) => ({
    key: date,
    label: formatDate(date),
  }));
}

function hasColumnGap(meeting, columns, index) {
  if (index === 0) {
    return false;
  }

  return columnOrderValue(meeting, columns[index].key) - columnOrderValue(meeting, columns[index - 1].key) > 1;
}

function columnOrderValue(meeting, key) {
  if (meeting.kind === "weekly") {
    return weekdayOrder(key);
  }

  return Math.round(parseDate(key).getTime() / 86_400_000);
}

function applyMeetingFromUrl() {
  const meetingId = new URLSearchParams(window.location.search).get("meeting");
  if (!meetingId) {
    store.activeMeetingId = null;
    return;
  }

  store.activeMeetingId = store.meetings.some((meeting) => meeting.id === meetingId) ? meetingId : null;
}

function meetingShareUrl(meetingId) {
  const url = new URL(window.location.href);
  url.searchParams.set("meeting", meetingId);
  return url.toString();
}

function setMeetingUrl(meetingId) {
  const url = new URL(window.location.href);
  if (meetingId) {
    url.searchParams.set("meeting", meetingId);
  } else {
    url.searchParams.delete("meeting");
  }
  window.history.pushState({}, "", url);
}

async function copyCurrentShareLink() {
  if (!shareLink.value) {
    return;
  }

  shareLink.select();
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareLink.value);
    }
  } catch {
    // The selected text still lets the user copy manually in restricted browsers.
  }
}

function createCell(text, className) {
  const cell = document.createElement("div");
  cell.className = className;
  cell.textContent = text;
  return cell;
}

function formatSlot(meeting, key) {
  const [column, time] = key.split("T");
  const label = meeting.kind === "weekly"
    ? weekdays.find((day) => day.key === column)?.long || column
    : formatDate(column);
  return `${label}, ${time}`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat(locale(), {
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
  return weekdayOrder(a) - weekdayOrder(b);
}

function weekdayOrder(key) {
  return weekdays.findIndex((day) => day.key === key);
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

  const meeting = getActiveMeeting();
  if (!meeting) {
    return;
  }

  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      const response = await fetch(`/api/meetings/${encodeURIComponent(meeting.id)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ meeting }),
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
