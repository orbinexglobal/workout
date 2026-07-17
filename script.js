/**
 * Workout OS - Core Application Logic
 * Integrates daily auto-detection, calendar navigation, rest timers, interactive trackers,
 * progress storage, dynamic styling, Web Audio chiming, and canvas confetti.
 */

// Global State
let currentSelectedDay = new Date().getDay(); // 0-6 (0=Sunday)
const todayDayIndex = new Date().getDay();
let timerInterval = null;
let timerTimeLeft = 0;
let timerTotalDuration = 0;
let isTimerPaused = false;
let confettiActive = false;
let confettiParticles = [];
let confettiCanvas = null;
let confettiCtx = null;

// Target values
const TARGET_WATER = 3500; // 3.5 Liters (3500 ml)
const TARGET_SLEEP = 8.5; // 8.5 Hours

// Fetch date keys
function getFormattedDate(offsetDays = 0) {
  const date = new Date();
  if (offsetDays !== 0) {
    date.setDate(date.getDate() + offsetDays);
  }
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Format weekday names
const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  setupDynamicGreeting();
  setupNavigation();
  setupWeeklyCalendar();
  setupPostureTab();
  setupMuscleMap();
  setupConfetti();
  
  // Load initial day (Today)
  loadWorkoutDay(currentSelectedDay);
  
  // Load other trackers (Hydration, Sleep, Recovery)
  loadRecoveryData();
  
  // Load progress metrics
  updateProgressTab();
  
  // Global event listener for closing modals
  document.querySelector(".timer-overlay").addEventListener("click", (e) => {
    if (e.target.classList.contains("timer-overlay")) {
      closeRestTimer();
    }
  });

  // Track initial layout progress
  updateProgressBar();
}

/* ── DYNAMIC GREETING & ROTATING QUOTES ── */
function setupDynamicGreeting() {
  const hour = new Date().getHours();
  let greeting = "Morning, Champion";
  if (hour >= 12 && hour < 17) {
    greeting = "Afternoon, Athlete";
  } else if (hour >= 17 || hour < 5) {
    greeting = "Evening, Warrior";
  }
  
  document.getElementById("greeting").textContent = greeting;
  
  // Quote of the day (based on day of month)
  const dayOfMonth = new Date().getDate();
  const quote = window.workoutData.quotes[dayOfMonth % window.workoutData.quotes.length];
  document.getElementById("quote-text").textContent = `"${quote}"`;

  // Streak counter display
  const streak = localStorage.getItem("workout_os_streak") || 0;
  document.getElementById("header-streak-count").textContent = `${streak} DAY STREAK`;
}

/* ── TAB NAVIGATION ── */
function setupNavigation() {
  const tabButtons = document.querySelectorAll(".nav-tab-btn");
  const sections = document.querySelectorAll(".app-section");
  
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;
      
      // Toggle active states
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      sections.forEach(sec => {
        sec.classList.remove("active");
        if (sec.id === `section-${targetTab}`) {
          sec.classList.add("active");
        }
      });
      
      // Special tab routines
      if (targetTab === "progress") {
        updateProgressTab();
      } else if (targetTab === "recovery") {
        calculateRecoveryScore();
      }
      
      // Scroll to top of content area on desktop/mobile
      window.scrollTo({ top: 0, behavior: 'smooth' });
      updateProgressBar();
    });
  });
}

// Global top-bar progress calculation
function updateProgressBar() {
  const activeBtn = document.querySelector(".nav-tab-btn.active");
  const bar = document.getElementById("top-bar-progress");
  if (!bar) return;
  
  if (activeBtn && activeBtn.dataset.tab === "today") {
    // Show workout completion percentage
    const completion = getTodayCompletionPercentage();
    bar.style.width = `${completion}%`;
  } else {
    // Default constant size indicating active app
    bar.style.width = `100%`;
    setTimeout(() => {
      bar.style.width = `0%`;
    }, 400);
  }
}

/* ── RENDER WORKOUT ── */
function loadWorkoutDay(dayIndex) {
  currentSelectedDay = dayIndex;
  const dayData = window.workoutData.days[dayIndex];
  
  // Highlight calendar card
  document.querySelectorAll(".calendar-day-card").forEach(card => {
    card.classList.remove("selected");
    if (parseInt(card.dataset.day) === dayIndex) {
      card.classList.add("selected");
    }
  });
  
  // Check if viewing today vs another day
  const isToday = dayIndex === todayDayIndex;
  const viewBadge = document.getElementById("view-day-badge");
  if (isToday) {
    viewBadge.style.display = "none";
  } else {
    viewBadge.style.display = "inline-block";
    viewBadge.textContent = `Viewing ${dayData.name}'s Workout`;
  }

  // Update Hero Card details
  document.getElementById("hero-weekday").textContent = `${dayData.name} Split`;
  document.getElementById("hero-workout-type").textContent = dayData.type.toUpperCase();
  document.getElementById("hero-focus").textContent = dayData.focus;
  document.getElementById("hero-duration").textContent = `${dayData.duration} Session`;
  document.getElementById("hero-intensity").textContent = `${dayData.intensity} Intensity`;
  document.getElementById("hero-intensity").style.color = dayData.intensityColor;
  
  // Set active dynamic accent CSS variable based on intensity
  const docRoot = document.documentElement;
  docRoot.style.setProperty("--accent", dayData.intensityColor);
  if (dayData.intensity === "High") {
    docRoot.style.setProperty("--accent-glow", "rgba(239, 68, 68, 0.25)");
    docRoot.style.setProperty("--accent-gradient", "linear-gradient(135deg, #ef4444, #b91c1c)");
  } else if (dayData.intensity === "Medium") {
    docRoot.style.setProperty("--accent-glow", "rgba(251, 191, 36, 0.25)");
    docRoot.style.setProperty("--accent-gradient", "linear-gradient(135deg, #fbbf24, #d97706)");
  } else {
    docRoot.style.setProperty("--accent-glow", "rgba(59, 130, 246, 0.25)");
    docRoot.style.setProperty("--accent-gradient", "linear-gradient(135deg, #3b82f6, #1d4ed8)");
  }

  // Render the day's fixed-time schedule (wake, minoxidil, posture, workout window, wind-down)
  renderDailySchedule(dayIndex);

  // Render Exercise Cards
  const exerciseContainer = document.getElementById("today-exercise-list");
  exerciseContainer.innerHTML = "";

  if (dayData.exercises.length === 0) {
    exerciseContainer.innerHTML = `
      <div class="glass-card" style="text-align:center; padding: 28px 16px;">
        <div style="font-size:28px; margin-bottom:8px;">💤</div>
        <div style="font-family:'Outfit',sans-serif; font-weight:700; font-size:16px; color:var(--text-pure); margin-bottom:6px;">Rest Day</div>
        <div style="font-size:13px; color:var(--text-muted); max-width:340px; margin:0 auto;">No circuit today. Rest days are when growth actually happens — hydration, sleep, and the minoxidil dose above still apply.</div>
      </div>
    `;
    updateProgressRing();
    return;
  }
  
  // Local storage date key
  const dateKey = getFormattedDate();
  const completedList = JSON.parse(localStorage.getItem(`workout_os_completed_${dateKey}_day_${dayIndex}`)) || [];

  dayData.exercises.forEach((ex, idx) => {
    const isCompleted = completedList.includes(ex.name);
    
    const exCard = document.createElement("div");
    exCard.className = `exercise-card ${isCompleted ? 'completed' : ''}`;
    exCard.dataset.index = idx;
    
    // Difficulty badge color
    let diffClass = "difficulty-intermediate";
    if (ex.difficulty.toLowerCase() === "beginner") diffClass = "difficulty-beginner";
    if (ex.difficulty.toLowerCase() === "advanced") diffClass = "difficulty-advanced";

    exCard.innerHTML = `
      <div class="exercise-card-header">
        <div class="exercise-checkbox-wrapper">
          <input type="checkbox" class="exercise-checkbox" id="ex-check-${idx}" ${isCompleted ? 'checked' : ''}>
          <span class="checkmark"></span>
        </div>
        <div class="exercise-card-summary">
          <div class="exercise-name-row">
            <span class="exercise-title">${ex.name}</span>
            <span class="exercise-difficulty-badge ${diffClass}">${ex.difficulty}</span>
          </div>
          <div class="exercise-meta-info">
            <div class="exercise-meta-item">
              <span>🔄</span> <strong>${ex.sets} × ${ex.reps}</strong>
            </div>
            <div class="exercise-meta-item">
              <span>⏱️</span> Rest: ${ex.rest}
            </div>
            <div class="exercise-meta-item">
              <span>⚡</span> ${ex.duration}
            </div>
          </div>
        </div>
        <button class="exercise-expand-btn">▼</button>
      </div>
      <div class="exercise-details">
        <div class="details-grid">
          <div>
            <div class="details-label">Target Muscles</div>
            <div class="details-text" style="color: var(--accent); font-weight: 600;">${ex.muscles}</div>
          </div>
          <div>
            <div class="details-label">Instructions</div>
            <div class="details-text">${ex.how}</div>
          </div>
          <div class="details-tip-box">
            <div class="details-label" style="color:#fbbf24">PRO TIP</div>
            <div>${ex.tips}</div>
          </div>
          <div class="details-progression-box">
            <div class="details-label" style="color:#60a5fa">PROGRESSION OUTLET</div>
            <div>${ex.progression}</div>
          </div>
          <div>
            <button class="start-rest-btn" data-rest="${ex.rest}" data-name="${ex.name}">
              ⏱️ Start Rest Timer (${ex.rest})
            </button>
          </div>
        </div>
      </div>
    `;

    // Connect interactions
    // 1. Checkbox complete
    const checkbox = exCard.querySelector(".exercise-checkbox");
    checkbox.addEventListener("change", (e) => {
      e.stopPropagation(); // Stop click bubbling to expand
      toggleExerciseCompletion(dayIndex, ex.name, checkbox.checked, exCard);
    });

    // 2. Expand card on clicking header summary
    const summary = exCard.querySelector(".exercise-card-summary");
    const expandBtn = exCard.querySelector(".exercise-expand-btn");
    [summary, expandBtn].forEach(el => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const expanded = exCard.classList.toggle("expanded");
        expandBtn.textContent = expanded ? "▲" : "▼";
      });
    });

    // 3. Rest timer launch
    const restBtn = exCard.querySelector(".start-rest-btn");
    restBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const restValue = restBtn.dataset.rest; // e.g. "90 sec" or "0 sec"
      const restSeconds = parseInt(restValue) || 60;
      openRestTimer(restSeconds, ex.name);
    });

    exerciseContainer.appendChild(exCard);
  });

  updateProgressRing();
}

/* ── DAILY FIXED-TIME SCHEDULE ── */
// Builds a real clock-time timeline for the selected day: wake, single morning
// Minoxidil application, posture routine, the day's workout window, and wind-down.
// Workout start/end shifts automatically based on that day's session length.
function scheduleAddMinutes(timeStr, minsToAdd) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(2000, 0, 1, h, m);
  d.setMinutes(d.getMinutes() + minsToAdd);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function scheduleTo12h(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function renderDailySchedule(dayIndex) {
  const dayData = window.workoutData.days[dayIndex];
  const container = document.getElementById("daily-schedule-list");
  if (!container || !dayData) return;

  const isRestDay = dayData.exercises.length === 0;

  const wakeTime = "05:30";
  const hydrateTime = scheduleAddMinutes(wakeTime, 5);
  const postureStart = scheduleAddMinutes(wakeTime, 10);
  const postureEnd = scheduleAddMinutes(postureStart, 12);
  const workoutStart = postureEnd;
  const workoutEnd = scheduleAddMinutes(workoutStart, dayData.approxMin || 25);
  const breakfastTime = scheduleAddMinutes(isRestDay ? postureEnd : workoutEnd, 10);

  const blocks = [
    {
      time: scheduleTo12h(wakeTime),
      icon: "💊",
      title: "Minoxidil — single morning dose",
      desc: "Right after waking, once a day. A light, thin layer only — apply just enough to cover the area without pooling. No night application.",
      tag: "5:30 AM only"
    },
    {
      time: scheduleTo12h(hydrateTime),
      icon: "💧",
      title: "Wake-up hydration",
      desc: "One full glass of water before anything else.",
      tag: "Hydration"
    },
    {
      time: `${scheduleTo12h(postureStart)} – ${scheduleTo12h(postureEnd)}`,
      icon: "🧍",
      title: "Morning Posture Routine",
      desc: "Full 12-minute sequence from the Posture tab.",
      tag: "Posture"
    }
  ];

  if (isRestDay) {
    blocks.push({
      time: scheduleTo12h(workoutStart),
      icon: "💤",
      title: "Rest Day — no circuit",
      desc: "Skip the workout entirely. This is a scheduled off day, not an extra effort day.",
      tag: "Rest"
    });
  } else {
    blocks.push({
      time: `${scheduleTo12h(workoutStart)} – ${scheduleTo12h(workoutEnd)}`,
      icon: "🏋️",
      title: `${dayData.type} — ${dayData.focus}`,
      desc: `Today's ${dayData.duration} session: GH spike, spine length, then bone loading.`,
      tag: `${dayData.intensity} Intensity`
    });
  }

  blocks.push(
    {
      time: scheduleTo12h(breakfastTime),
      icon: "🥚",
      title: "Protein breakfast",
      desc: isRestDay ? "Same protein target applies even on rest days." : "Eat within about 10 minutes of finishing the session.",
      tag: "Nutrition"
    },
    {
      time: "9:00 PM",
      icon: "📵",
      title: "Wind-down begins",
      desc: "Dim screens, phone across the room, not on the pillow.",
      tag: "Sleep Prep"
    },
    {
      time: "10:00 – 10:30 PM",
      icon: "😴",
      title: "Lights out",
      desc: "Aim for 8.5+ hours.",
      tag: "Sleep"
    }
  );

  container.innerHTML = blocks.map(b => `
    <div class="schedule-block">
      <div class="schedule-time">${b.time}</div>
      <div class="schedule-line">
        <div class="schedule-dot"></div>
        <div class="schedule-connector"></div>
      </div>
      <div class="schedule-content">
        <div class="schedule-header-row">
          <span class="schedule-icon">${b.icon}</span>
          <span class="schedule-title">${b.title}</span>
          <span class="schedule-tag">${b.tag}</span>
        </div>
        <div class="schedule-desc">${b.desc}</div>
      </div>
    </div>
  `).join("");
}

/* ── EXERCISE PROGRESS & CELEBRATION ── */
function toggleExerciseCompletion(dayIndex, exName, isChecked, cardElement) {
  const dateKey = getFormattedDate();
  const storageKey = `workout_os_completed_${dateKey}_day_${dayIndex}`;
  let completedList = JSON.parse(localStorage.getItem(storageKey)) || [];

  if (isChecked) {
    if (!completedList.includes(exName)) completedList.push(exName);
    cardElement.classList.add("completed");
  } else {
    completedList = completedList.filter(name => name !== exName);
    cardElement.classList.remove("completed");
  }

  localStorage.setItem(storageKey, JSON.stringify(completedList));
  
  // Calculate day completions & score
  updateProgressRing();
  updateProgressBar();
  
  // Check if fully finished for today
  checkTodayFullCompletion(dayIndex);
}

function getTodayCompletionPercentage() {
  const dayIndex = currentSelectedDay;
  const dayData = window.workoutData.days[dayIndex];
  if (!dayData) return 0;
  
  const dateKey = getFormattedDate();
  const completedList = JSON.parse(localStorage.getItem(`workout_os_completed_${dateKey}_day_${dayIndex}`)) || [];
  const total = dayData.exercises.length;
  if (total === 0) return 0;
  
  return Math.round((completedList.length / total) * 100);
}

function updateProgressRing() {
  const percentage = getTodayCompletionPercentage();
  const dayData = window.workoutData.days[currentSelectedDay];
  
  const circle = document.getElementById("progress-ring-circle");
  const percentText = document.getElementById("progress-ring-percent");
  const labelText = document.getElementById("progress-ring-label");
  
  if (!circle || !percentText) return;

  // Calculation for dash offset (radius = 64, circumference = 2 * PI * r = 402)
  const circumference = 402;
  const offset = circumference - (percentage / 100) * circumference;
  
  circle.style.strokeDashoffset = offset;
  percentText.textContent = `${percentage}%`;
  
  const dateKey = getFormattedDate();
  const completedCount = (JSON.parse(localStorage.getItem(`workout_os_completed_${dateKey}_day_${currentSelectedDay}`)) || []).length;
  const totalCount = dayData.exercises.length;
  labelText.textContent = `${completedCount} of ${totalCount} Done`;
}

function checkTodayFullCompletion(dayIndex) {
  // Only trigger streak and confetti if viewing ACTUAL today, and workout is 100% complete
  if (dayIndex !== todayDayIndex) return;
  
  const percentage = getTodayCompletionPercentage();
  if (percentage === 100) {
    const dateKey = getFormattedDate();
    const completionKey = `workout_os_full_completed_${dateKey}`;
    
    if (localStorage.getItem(completionKey) !== "true") {
      localStorage.setItem(completionKey, "true");
      
      // Update historical logs
      const history = JSON.parse(localStorage.getItem("workout_os_history")) || {};
      history[dateKey] = 100;
      localStorage.setItem("workout_os_history", JSON.stringify(history));
      
      // Increment Streak
      updateStreak();
      
      // Show celebration overlay & trigger confetti!
      triggerCelebration();
    }
  } else {
    // If unchecked, remove complete key
    const dateKey = getFormattedDate();
    localStorage.removeItem(`workout_os_full_completed_${dateKey}`);
    
    const history = JSON.parse(localStorage.getItem("workout_os_history")) || {};
    delete history[dateKey];
    localStorage.setItem("workout_os_history", JSON.stringify(history));
  }
}

function updateStreak() {
  const lastCompletedDate = localStorage.getItem("workout_os_last_completed_date");
  const todayStr = getFormattedDate();
  const yesterdayStr = getFormattedDate(-1);
  
  let currentStreak = parseInt(localStorage.getItem("workout_os_streak")) || 0;
  
  if (lastCompletedDate === yesterdayStr) {
    // Increment consecutive streak
    currentStreak += 1;
  } else if (lastCompletedDate === todayStr) {
    // Already did it today, no change
  } else {
    // Broke streak, reset to 1
    currentStreak = 1;
  }
  
  localStorage.setItem("workout_os_streak", currentStreak);
  localStorage.setItem("workout_os_last_completed_date", todayStr);
  
  // Update UI values
  document.getElementById("header-streak-count").textContent = `${currentStreak} DAY STREAK`;
}

function triggerCelebration() {
  const overlay = document.getElementById("celebration-overlay");
  const dayData = window.workoutData.days[todayDayIndex];
  
  // Set metrics inside modal
  const streak = localStorage.getItem("workout_os_streak") || 1;
  document.getElementById("celebration-streak").textContent = streak;
  document.getElementById("celebration-ex-count").textContent = dayData.exercises.length;
  document.getElementById("celebration-duration").textContent = dayData.approxMin;
  
  // Activate modal overlay
  overlay.classList.add("active");
  playChime(); // synthesise a gorgeous chime
  
  // Start confetti canvas
  confettiActive = true;
  for (let i = 0; i < 150; i++) {
    confettiParticles.push(createConfettiParticle());
  }
}

function closeCelebration() {
  document.getElementById("celebration-overlay").classList.remove("active");
  confettiActive = false;
  confettiParticles = [];
  if (confettiCtx) {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

/* ── REST TIMER DIALOGS ── */
function openRestTimer(seconds, exName) {
  const overlay = document.getElementById("timer-overlay");
  document.getElementById("timer-exercise-name").textContent = `Rest after ${exName}`;
  
  timerTimeLeft = seconds;
  timerTotalDuration = seconds;
  isTimerPaused = false;
  
  updateTimerUI();
  overlay.classList.add("active");
  
  // Clear any existing intervals
  if (timerInterval) clearInterval(timerInterval);
  
  // Start countdown ticks
  timerInterval = setInterval(() => {
    if (!isTimerPaused) {
      timerTimeLeft--;
      updateTimerUI();
      
      if (timerTimeLeft <= 0) {
        clearInterval(timerInterval);
        restTimerCompleted();
      }
    }
  }, 1000);
}

function updateTimerUI() {
  const timeDisplay = document.getElementById("timer-digits");
  const progressCircle = document.getElementById("timer-progress-circle");
  const toggleBtn = document.getElementById("timer-toggle-btn");
  
  // Format minutes & seconds
  const m = String(Math.floor(timerTimeLeft / 60)).padStart(2, '0');
  const s = String(timerTimeLeft % 60).padStart(2, '0');
  timeDisplay.textContent = `${m}:${s}`;
  
  // Update Circular SVG Dashoffset (circumference = 565)
  const circumference = 565;
  const ratio = timerTimeLeft / timerTotalDuration;
  progressCircle.style.strokeDashoffset = circumference - (ratio * circumference);
  
  // Slay button wording
  toggleBtn.textContent = isTimerPaused ? "▶ Resume" : "⏸ Pause";
}

function toggleRestTimer() {
  isTimerPaused = !isTimerPaused;
  updateTimerUI();
}

function skipRestTimer() {
  clearInterval(timerInterval);
  closeRestTimer();
}

function restTimerCompleted() {
  playChime();
  
  // Flash effect on modal
  const card = document.querySelector(".timer-card");
  card.style.borderColor = "var(--accent-green)";
  card.style.boxShadow = "0 0 30px rgba(16, 185, 129, 0.4)";
  
  setTimeout(() => {
    closeRestTimer();
    card.style.borderColor = "rgba(255,255,255,0.08)";
    card.style.boxShadow = "none";
  }, 1000);
}

function closeRestTimer() {
  if (timerInterval) clearInterval(timerInterval);
  document.getElementById("timer-overlay").classList.remove("active");
}

/* ── WEB AUDIO SYNTHESIZED CHIME (OFFLINE COMPATIBLE) ── */
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(523.25, now); // C5 chord
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    
    osc.start(now);
    osc.stop(now + 0.8);
    
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.frequency.setValueAtTime(659.25, now + 0.12); // E5 chord
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    
    osc2.start(now);
    osc2.stop(now + 0.9);
  } catch (e) {
    console.log("AudioContext failed", e);
  }
}

/* ── WEEKLY PLAN TAB (CALENDAR UI) ── */
function setupWeeklyCalendar() {
  const container = document.getElementById("weekly-calendar");
  container.innerHTML = "";
  
  // Load each day index
  const dayOrdering = [1, 2, 3, 4, 5, 6, 0]; // Monday-Sunday layout
  
  dayOrdering.forEach(dIdx => {
    const dayData = window.workoutData.days[dIdx];
    const isToday = dIdx === todayDayIndex;
    
    const card = document.createElement("div");
    card.className = `calendar-day-card ${isToday ? 'active-today' : ''}`;
    card.dataset.day = dIdx;
    
    // Truncate name
    const dayAbbrev = dayData.name.substring(0, 3);
    const splitSimple = dayData.type.replace(" Day", "").replace(" + Stretch", "");
    
    card.innerHTML = `
      <div class="calendar-day-lbl">${dayAbbrev}</div>
      <div class="calendar-day-title">${dayData.name === weekdayNames[todayDayIndex] ? '★' : dayAbbrev}</div>
      <div class="calendar-day-split">${splitSimple}</div>
      <span class="intensity-dot" style="background: ${dayData.intensityColor}; box-shadow: 0 0 6px ${dayData.intensityColor}"></span>
    `;
    
    card.addEventListener("click", () => {
      // Switch tab display to "Today" and render selected day
      document.querySelector(".nav-tab-btn[data-tab='today']").click();
      loadWorkoutDay(dIdx);
    });
    
    container.appendChild(card);
  });

  // Render static equipment/knee-safety rationale inside the weekly overview
  const swapsWrapper = document.getElementById("swaps-comparison");
  if (swapsWrapper) {
    swapsWrapper.innerHTML = `
      <div class="swap-row-card">
        <div class="swap-column">
          <span class="swap-tag original">🏠 Equipment</span>
          <span class="swap-name">Sunshade Bar</span>
          <span class="swap-desc">Your indoor pull-up substitute for the whole plan.</span>
        </div>
        <div class="swap-column">
          <span class="swap-tag home">✅ Used For</span>
          <span class="swap-name">Dead Hang + Active Hang — Scapular Pull</span>
          <span class="swap-desc">Spinal decompression and traction — the most important exercises in the circuit.</span>
          <span class="swap-reason">6×30s hang, then 3×10 scapular pulls, same bar.</span>
        </div>
      </div>
      <div class="swap-row-card">
        <div class="swap-column">
          <span class="swap-tag original">🏠 Equipment</span>
          <span class="swap-name">Stairs</span>
          <span class="swap-desc">Your indoor sprint + calf-loading substitute.</span>
        </div>
        <div class="swap-column">
          <span class="swap-tag home">✅ Used For</span>
          <span class="swap-name">Stair Run Intervals + Stair-Edge Calf Raises</span>
          <span class="swap-desc">GH-spiking sprint effort, then tibial growth-plate loading on the step edge.</span>
          <span class="swap-reason">Same equipment, two different phases of the circuit.</span>
        </div>
      </div>
      <div class="swap-row-card">
        <div class="swap-column">
          <span class="swap-tag original">🦵 Knocking Knees</span>
          <span class="swap-name">Standard squat / jump stance</span>
          <span class="swap-desc">Normal stance pushes stress to the inner knee (genu valgum).</span>
        </div>
        <div class="swap-column">
          <span class="swap-tag home">✅ Modified To</span>
          <span class="swap-name">Toes-Out / Sumo Stance</span>
          <span class="swap-desc">Vertical Jump and Sumo Squat both use a wider, toes-out stance so the knee tracks over the toes.</span>
          <span class="swap-reason">Keeps the bone-loading benefit while staying knee-safe for you specifically.</span>
        </div>
      </div>
    `;
  }
}

/* ── POSTURE TAB RENDERING ── */
function setupPostureTab() {
  const container = document.getElementById("posture-steps");
  container.innerHTML = "";
  
  const dateKey = getFormattedDate();
  const completedStretches = JSON.parse(localStorage.getItem(`workout_os_posture_list_${dateKey}`)) || [];

  window.workoutData.postureRoutine.forEach((step, idx) => {
    const isCompleted = completedStretches.includes(step.name);
    
    const card = document.createElement("div");
    card.className = `posture-step-card ${isCompleted ? 'completed' : ''}`;
    
    card.innerHTML = `
      <div class="posture-step-header">
        <div class="exercise-checkbox-wrapper">
          <input type="checkbox" class="posture-checkbox" id="posture-check-${idx}" ${isCompleted ? 'checked' : ''}>
          <span class="checkmark"></span>
        </div>
        <div style="flex-grow:1; margin-left: 10px;">
          <span class="posture-step-title">${step.name}</span>
          <div class="posture-step-meta">
            <span>⏱️ ${step.setsReps}</span>
            <span style="color:var(--accent-blue)">⚡ ${step.whyItMatters}</span>
          </div>
        </div>
      </div>
      <div class="posture-step-desc">
        <p>${step.how}</p>
        <p style="margin-top: 6px; font-size:11px; color:var(--text-muted);"><strong>Target:</strong> ${step.muscles}</p>
      </div>
    `;
    
    const checkbox = card.querySelector(".posture-checkbox");
    checkbox.addEventListener("change", () => {
      togglePostureStep(step.name, checkbox.checked);
    });

    container.appendChild(card);
  });
}

function togglePostureStep(stepName, isChecked) {
  const dateKey = getFormattedDate();
  const storageKey = `workout_os_posture_list_${dateKey}`;
  let list = JSON.parse(localStorage.getItem(storageKey)) || [];

  if (isChecked) {
    if (!list.includes(stepName)) list.push(stepName);
  } else {
    list = list.filter(item => item !== stepName);
  }

  localStorage.setItem(storageKey, JSON.stringify(list));
  
  // If all posture steps are completed (total 7)
  const totalCount = window.workoutData.postureRoutine.length;
  if (list.length === totalCount) {
    localStorage.setItem(`workout_os_posture_completed_${dateKey}`, "true");
  } else {
    localStorage.removeItem(`workout_os_posture_completed_${dateKey}`);
  }
  
  // Recalculate Recovery dashboard if loaded
  calculateRecoveryScore();
}

/* ── MUSCLE MAP TAB ── */
function setupMuscleMap() {
  const container = document.getElementById("muscle-group-map");
  container.innerHTML = "";
  
  const musclesList = [
    { name: "Full Spine", exercises: ["Dead Hang on Sunshade Bar", "Active Hang — Scapular Pull", "Floor Spinal Elongation"] },
    { name: "Lats & Lower Traps", exercises: ["Dead Hang on Sunshade Bar", "Active Hang — Scapular Pull"] },
    { name: "Femur & Tibia (Growth Plates)", exercises: ["Vertical Jump — Toes Out", "Stair-Edge Calf Raises"] },
    { name: "Calves", exercises: ["Stair-Edge Calf Raises", "Vertical Jump — Toes Out"] },
    { name: "Quads & Glutes", exercises: ["Sumo Squat — Slow Tempo", "Stair Run Intervals"] },
    { name: "Hip Flexors", exercises: ["Floor Spinal Elongation"] },
    { name: "Heart / Cardio (GH Spike)", exercises: ["Stair Run Intervals"] }
  ];
  
  musclesList.forEach(m => {
    const card = document.createElement("div");
    card.className = "muscle-group-card";
    
    let tagsHTML = "";
    m.exercises.forEach(ex => {
      tagsHTML += `<span class="muscle-ex-tag">${ex}</span>`;
    });
    
    card.innerHTML = `
      <div class="muscle-group-title">
        <span>💪 ${m.name}</span>
        <span style="font-size:11px; color:var(--text-dark);">${m.exercises.length} Movements</span>
      </div>
      <div class="muscle-exercise-tags">
        ${tagsHTML}
      </div>
    `;
    container.appendChild(card);
  });
}

/* ── TAB 5: RECOVERY MANAGEMENT ── */
function loadRecoveryData() {
  const dateKey = getFormattedDate();
  
  // 1. Water logs
  const loggedWater = parseInt(localStorage.getItem(`workout_os_water_${dateKey}`)) || 0;
  updateHydrationUI(loggedWater);
  
  // 2. Sleep logs
  const loggedSleep = parseFloat(localStorage.getItem(`workout_os_sleep_${dateKey}`)) || 7.5;
  const slider = document.getElementById("sleep-range-slider");
  if (slider) {
    slider.value = loggedSleep;
    updateSleepUI(loggedSleep);
  }
  
  // 3. Recovery checklist
  const loggedChecklist = JSON.parse(localStorage.getItem(`workout_os_checklist_${dateKey}`)) || [];
  document.querySelectorAll(".checklist-item input").forEach(checkbox => {
    const id = checkbox.id;
    if (loggedChecklist.includes(id)) {
      checkbox.checked = true;
      checkbox.closest(".checklist-item").classList.add("checked");
    }
    
    // Connect check action
    checkbox.addEventListener("change", () => {
      const item = checkbox.closest(".checklist-item");
      if (checkbox.checked) {
        item.classList.add("checked");
      } else {
        item.classList.remove("checked");
      }
      saveRecoveryChecklist();
    });
  });

  // Calculate first initial score
  calculateRecoveryScore();
}

function logHydration(amount) {
  const dateKey = getFormattedDate();
  let water = parseInt(localStorage.getItem(`workout_os_water_${dateKey}`)) || 0;
  
  if (amount === 0) {
    water = 0; // Reset
  } else {
    water += amount;
  }
  
  localStorage.setItem(`workout_os_water_${dateKey}`, water);
  updateHydrationUI(water);
  calculateRecoveryScore();
}

function updateHydrationUI(ml) {
  const valDisplay = document.getElementById("water-val-display");
  const waterLevel = document.getElementById("water-fill-level");
  
  if (!valDisplay || !waterLevel) return;
  
  valDisplay.textContent = `${ml} ml`;
  
  // Bottle filling percentage capped at 100%
  const percentage = Math.min((ml / TARGET_WATER) * 100, 100);
  waterLevel.style.height = `${percentage}%`;
}

function handleSleepSliderChange(value) {
  const sleepVal = parseFloat(value);
  const dateKey = getFormattedDate();
  localStorage.setItem(`workout_os_sleep_${dateKey}`, sleepVal);
  
  updateSleepUI(sleepVal);
  calculateRecoveryScore();
}

function updateSleepUI(hours) {
  const display = document.getElementById("sleep-hours-display");
  const feedback = document.getElementById("sleep-feedback-text");
  if (!display) return;
  
  display.textContent = `${hours} hrs`;
  
  // Feedback phrases
  if (hours >= 8.5) {
    feedback.textContent = "✅ Optimal sleep. Perfect muscle protein synthesis environment.";
    feedback.style.color = "var(--accent-green)";
  } else if (hours >= 7) {
    feedback.textContent = "⚠️ Borderline rest. Try to sleep 30 mins earlier tonight.";
    feedback.style.color = "var(--accent-amber)";
  } else {
    feedback.textContent = "❌ Sleep deprived. High cortisol, low anabolic repair. Prioritize rest!";
    feedback.style.color = "var(--accent-red)";
  }
}

function saveRecoveryChecklist() {
  const dateKey = getFormattedDate();
  const checkedIds = [];
  
  document.querySelectorAll(".checklist-item input").forEach(checkbox => {
    if (checkbox.checked) {
      checkedIds.push(checkbox.id);
    }
  });
  
  localStorage.setItem(`workout_os_checklist_${dateKey}`, JSON.stringify(checkedIds));
  calculateRecoveryScore();
}

function calculateRecoveryScore() {
  const dateKey = getFormattedDate();
  
  // Score parameters: Max 100 points
  // 1. Sleep (40 points)
  const sleep = parseFloat(localStorage.getItem(`workout_os_sleep_${dateKey}`)) || 7.5;
  const sleepScore = Math.min((sleep / TARGET_SLEEP) * 40, 40);
  
  // 2. Hydration (35 points)
  const water = parseInt(localStorage.getItem(`workout_os_water_${dateKey}`)) || 0;
  const waterScore = Math.min((water / TARGET_WATER) * 35, 35);
  
  // 3. Posture complete (15 points)
  const isPostureComplete = localStorage.getItem(`workout_os_posture_completed_${dateKey}`) === "true";
  const postureScore = isPostureComplete ? 15 : 0;
  
  // 4. Recovery checklists logged (10 points max)
  const checklist = JSON.parse(localStorage.getItem(`workout_os_checklist_${dateKey}`)) || [];
  const checklistScore = Math.min(checklist.length * 3.3, 10);
  
  const totalScore = Math.round(sleepScore + waterScore + postureScore + checklistScore);
  
  // Update visual dial
  const ring = document.getElementById("recovery-dial");
  const numDisplay = document.getElementById("recovery-score-number");
  const descDisplay = document.getElementById("recovery-status-description");
  
  if (!ring || !numDisplay) return;
  
  numDisplay.textContent = totalScore;
  
  // Color code dial based on recovery rating
  let dialColor = "var(--accent-blue)";
  let statusText = "FATIGUED";
  let statusAdvice = "Focus heavily on hydration and wind down early. Your CNS is stressed.";
  
  if (totalScore >= 85) {
    dialColor = "var(--accent-green)";
    statusText = "OPTIMAL";
    statusAdvice = "Muscles fully hydrated, cortisol low. Perfect environment for high-intensity output.";
  } else if (totalScore >= 60) {
    dialColor = "var(--accent-amber)";
    statusText = "STABILIZING";
    statusAdvice = "Moderate repair level. Hydrate more or ensure 8+ hours sleep tonight.";
  }
  
  // Conic-gradient updates
  ring.style.background = `conic-gradient(${dialColor} ${totalScore}%, rgba(255, 255, 255, 0.05) ${totalScore}%)`;
  descDisplay.innerHTML = `<strong style="color: ${dialColor}">${statusText}</strong> — ${statusAdvice}`;
}

/* ── TAB 6: PROGRESS METRICS & HISTORY ── */
function updateProgressTab() {
  const dateKey = getFormattedDate();
  
  // 1. Total Streak display
  const streak = parseInt(localStorage.getItem("workout_os_streak")) || 0;
  document.getElementById("progress-streak").textContent = streak;
  
  // 2. Count total exercises completed across ALL history keys
  let totalExCompleted = 0;
  let totalHydrationLogged = 0;
  let logDays = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    // Exercise lists keys: workout_os_completed_<date>_day_<dayIndex>
    if (key && key.startsWith("workout_os_completed_")) {
      const list = JSON.parse(localStorage.getItem(key)) || [];
      totalExCompleted += list.length;
    }
    
    // Water hydration keys: workout_os_water_<date>
    if (key && key.startsWith("workout_os_water_")) {
      totalHydrationLogged += parseInt(localStorage.getItem(key)) || 0;
      logDays++;
    }
  }
  
  document.getElementById("progress-exercises").textContent = totalExCompleted;
  
  // Average water
  const avgWater = logDays > 0 ? Math.round(totalHydrationLogged / logDays) : 0;
  document.getElementById("progress-avg-water").textContent = `${(avgWater / 1000).toFixed(1)} L`;
  
  // 3. Render last 7 days history logs
  const historyContainer = document.getElementById("progress-history-calendar");
  if (!historyContainer) return;
  
  historyContainer.innerHTML = "";
  
  // Fetch percentage for the last 7 calendar days
  for (let i = 0; i < 7; i++) {
    const offset = -i;
    const dateStr = getFormattedDate(offset);
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() + offset);
    
    const dayName = weekdayNames[dateObj.getDay()];
    const displayLabel = offset === 0 ? "Today" : offset === -1 ? "Yesterday" : `${dayName} (${dateObj.getDate()}/${dateObj.getMonth() + 1})`;
    
    // Check if fully completed today
    const wasFullComplete = localStorage.getItem(`workout_os_full_completed_${dateStr}`) === "true";
    
    // Let's check completed count vs total count on that date
    const dIdx = dateObj.getDay();
    const dayData = window.workoutData.days[dIdx];
    const completedList = JSON.parse(localStorage.getItem(`workout_os_completed_${dateStr}_day_${dIdx}`)) || [];
    
    let statusText = "No Session";
    let statusClass = "pending";
    
    if (wasFullComplete) {
      statusText = "100% Done";
      statusClass = "done";
    } else if (completedList.length > 0) {
      statusText = `${completedList.length}/${dayData.exercises.length} Done`;
      statusClass = "done"; // styled partially completed
    }
    
    const row = document.createElement("div");
    row.className = "history-calendar-row";
    row.innerHTML = `
      <span class="history-day-lbl">${displayLabel}</span>
      <span class="history-status-pill ${statusClass}">${statusText}</span>
    `;
    historyContainer.appendChild(row);
  }
}

function clearAllAppData() {
  if (confirm("⚠️ WARNING: This will permanently erase your streaks, logged history, hydration count, and exercise checks. Proceed?")) {
    localStorage.clear();
    alert("Application data reset successfully.");
    window.location.reload();
  }
}

/* ── PREMIUM CONFETTI SYSTEM ── */
function setupConfetti() {
  confettiCanvas = document.getElementById("confetti-canvas");
  if (!confettiCanvas) return;
  
  confettiCtx = confettiCanvas.getContext("2d");
  
  // Resize canvas to window
  window.addEventListener("resize", resizeConfettiCanvas);
  resizeConfettiCanvas();
  
  // Start animation loop
  requestAnimationFrame(animateConfetti);
}

function resizeConfettiCanvas() {
  if (confettiCanvas) {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
}

function createConfettiParticle() {
  const colors = ["#ef4444", "#3b82f6", "#10b981", "#fbbf24", "#a855f7", "#ec4899"];
  return {
    x: Math.random() * confettiCanvas.width,
    y: Math.random() * -100 - 10,
    r: Math.random() * 6 + 4,
    d: Math.random() * confettiCanvas.height,
    color: colors[Math.floor(Math.random() * colors.length)],
    tilt: Math.random() * 10 - 5,
    tiltAngleIncremental: Math.random() * 0.07 + 0.02,
    tiltAngle: 0,
    speed: Math.random() * 3 + 2
  };
}

function animateConfetti() {
  if (confettiActive && confettiCanvas && confettiCtx) {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    confettiParticles.forEach((p, idx) => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += p.speed;
      p.x += Math.sin(p.tiltAngle) * 0.5;
      p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;
      
      // Draw particle
      confettiCtx.beginPath();
      confettiCtx.lineWidth = p.r;
      confettiCtx.strokeStyle = p.color;
      confettiCtx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      confettiCtx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      confettiCtx.stroke();
      
      // If bottom out, recycle to top
      if (p.y > confettiCanvas.height) {
        confettiParticles[idx] = createConfettiParticle();
      }
    });
  }
  requestAnimationFrame(animateConfetti);
}
