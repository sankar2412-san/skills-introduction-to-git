/* global portal.js */

// =====================================================
//  24/7 Project Management Portal — JavaScript
// =====================================================

const MEMBERS = [
  // Morning Shift (Shift 1)  06:00 – 14:00
  { name: "Alice Johnson",  role: "Team Lead",    shift: "morning", emoji: "👩‍💼" },
  { name: "Bob Martinez",   role: "Developer",    shift: "morning", emoji: "👨‍💻" },
  { name: "Carol Lee",      role: "QA Engineer",  shift: "morning", emoji: "👩‍🔬" },
  { name: "David Singh",    role: "DevOps",       shift: "morning", emoji: "👨‍🔧" },
  { name: "Eva Chen",       role: "Designer",     shift: "morning", emoji: "👩‍🎨" },

  // Evening Shift (Shift 2)  14:00 – 22:00
  { name: "Frank Okafor",   role: "Team Lead",    shift: "evening", emoji: "👨‍💼" },
  { name: "Grace Kim",      role: "Developer",    shift: "evening", emoji: "👩‍💻" },
  { name: "Henry Patel",    role: "QA Engineer",  shift: "evening", emoji: "👨‍🔬" },
  { name: "Irene Torres",   role: "Analyst",      shift: "evening", emoji: "👩‍📊" },
  { name: "James Nguyen",   role: "Backend Dev",  shift: "evening", emoji: "👨‍💻" },

  // Night Shift (Shift 3)    22:00 – 06:00
  { name: "Karen Blake",    role: "Team Lead",    shift: "night",   emoji: "👩‍💼" },
  { name: "Leo Ramirez",    role: "Developer",    shift: "night",   emoji: "👨‍💻" },
  { name: "Mia Hoffmann",   role: "SRE",          shift: "night",   emoji: "👩‍🔧" },
  { name: "Noah Williams",  role: "Security Eng", shift: "night",   emoji: "👨‍🛡️" },
  { name: "Olivia Brown",   role: "Data Analyst", shift: "night",   emoji: "👩‍📈" },
];

// Shift windows  (start hour inclusive, end hour exclusive; night wraps midnight)
const SHIFTS = {
  morning: { start: 6,  end: 14, label: "🌅 Morning Shift  (06:00–14:00)" },
  evening: { start: 14, end: 22, label: "🌇 Evening Shift  (14:00–22:00)" },
  night:   { start: 22, end: 6,  label: "🌙 Night Shift    (22:00–06:00)" },
};

// Day names aligned with JS Date.getDay() (0 = Sunday)
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ---- Helpers ---------------------------------------------------------------

function currentShift(hour) {
  if (hour >= 6  && hour < 14) return "morning";
  if (hour >= 14 && hour < 22) return "evening";
  return "night"; // 22-06
}

function formatTime(d) {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDate(d) {
  return d.toLocaleDateString("en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

// ---- Clock & active-shift highlighter -------------------------------------

function updateClock() {
  const now    = new Date();
  const hour   = now.getHours();
  const active = currentShift(hour);

  // Clock display
  document.getElementById("clockTime").textContent  = formatTime(now);
  document.getElementById("clockDate").textContent  = formatDate(now);

  const shiftLabel = document.getElementById("clockShift");
  shiftLabel.textContent  = SHIFTS[active].label;
  shiftLabel.className    = `clock-shift shift-label-${active}`;

  // Highlight active shift card
  ["morning", "evening", "night"].forEach((s) => {
    const card   = document.getElementById(`shift-${s}`);
    if (s === active) {
      card.classList.add("active");
    } else {
      card.classList.remove("active");
    }
  });

  // Timeline indicator  (fraction of 24 h elapsed since midnight)
  const fraction  = (hour * 60 + now.getMinutes()) / (24 * 60);
  const indicator = document.getElementById("tlIndicator");
  if (indicator) {
    indicator.style.left = `${fraction * 100}%`;
  }

  // Dim inactive timeline segments
  const segMap = { morning: ".tl-morning", evening: ".tl-evening", night: ".tl-night" };
  Object.entries(segMap).forEach(([s, sel]) => {
    const el = document.querySelector(sel);
    if (!el) return;
    if (s === active) {
      el.classList.remove("inactive");
    } else {
      el.classList.add("inactive");
    }
  });
}

// ---- Weekly schedule — highlight today's column ---------------------------

function highlightToday() {
  const today  = new Date().getDay(); // 0 = Sun … 6 = Sat
  // Column indices in the table:  0=Shift,1=Time,2=Mon,3=Tue,4=Wed,5=Thu,6=Fri,7=Sat,8=Sun
  const colMap = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 0: 8 }; // JS day → table col index
  const col    = colMap[today];
  if (!col) return;

  const table = document.getElementById("scheduleTable");
  if (!table) return;

  table.querySelectorAll("tr").forEach((row) => {
    row.querySelectorAll("th, td").forEach((cell, i) => {
      if (i === col) cell.classList.add("today");
    });
  });
}

// ---- Member directory  (built dynamically) ---------------------------------

function buildDirectory() {
  const grid = document.getElementById("directoryGrid");
  if (!grid) return;

  MEMBERS.forEach((m) => {
    const card = document.createElement("div");
    card.className = `dir-card dir-${m.shift}`;
    card.innerHTML = `
      <div class="dir-avatar">${m.emoji}</div>
      <span class="dir-name">${m.name}</span>
      <span class="dir-role">${m.role}</span>
      <span class="dir-shift-tag">${m.shift === "morning" ? "Shift 1 · Morning" : m.shift === "evening" ? "Shift 2 · Evening" : "Shift 3 · Night"}</span>
    `;
    grid.appendChild(card);
  });
}

// ---- Bootstrap -------------------------------------------------------------

buildDirectory();
highlightToday();
updateClock();                     // initial paint
setInterval(updateClock, 1000);    // update every second
