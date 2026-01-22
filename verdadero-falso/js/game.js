const DEBUG = true;

const estado = {
  gid: null,
  instances: [],
  currentIndex: 0,
  score: 0,
  juegoTerminado: false,
  timerInterval: null,
  duration: 60,
  timeLeft: 60,
  hasAnswered: false,
  selectedOption: null
};

// DOM Elements
const questionTextEl = document.getElementById("question-text");
const questionDescEl = document.getElementById("question-desc");
const btnTrue = document.getElementById("btn-true");
const btnFalse = document.getElementById("btn-false");
const btnNext = document.getElementById("btn-next");
const feedbackMsgs = document.querySelectorAll(".feedback-msg");
const timeText = document.getElementById("time");
const circle = document.querySelector(".progress-ring__circle");

let modalCorrect = null;
let modalTimeout = null;

// Timer settings
const radius = 42;
const circumference = 2 * Math.PI * radius;
if (circle) {
  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = 0;
}

function dbg(event, data) {
  if (!DEBUG) return;
  console.log(`[VF] ${event}`, data || "");
}

async function IniciarJuego() {
  dbg("INICIANDO_JUEGO");
  try {
    const response = await fetch("ajax/game-start.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "cfg_key=verdadero_falso"
    });
    const data = await response.json();
    console.log("[BACKEND] game-start:", data);

    if (data.success) {
      estado.gid = data.gid;
      estado.instances = data.instances;
      estado.duration = data.duration || 60;
      estado.timeLeft = estado.duration;
      estado.currentIndex = 0;

      StartTimer();
      RenderScreen();
    } else {
      alert("Error al iniciar: " + (data.error || "Desconocido"));
    }
  } catch (e) {
    console.error("Error fetching game start:", e);
  }
}

function StartTimer() {
  if (estado.timerInterval) clearInterval(estado.timerInterval);

  UpdateTimerUI(estado.timeLeft);

  estado.timerInterval = setInterval(() => {
    estado.timeLeft--;
    UpdateTimerUI(estado.timeLeft);

    if (estado.timeLeft <= 0) {
      clearInterval(estado.timerInterval);
      FinishGame();
    }
  }, 1000);
}

function UpdateTimerUI(seconds) {
  if (!timeText || !circle) return;

  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  timeText.textContent = `${m}:${s}`;

  const offset = ((estado.duration - seconds) / estado.duration) * circumference;
  circle.style.strokeDashoffset = offset;
}

function RenderScreen() {
  // If we went past the last question, end.
  if (estado.currentIndex >= estado.instances.length) {
    FinishGame();
    return;
  }

  const inst = estado.instances[estado.currentIndex];
  // Skip "intro" or "results" types if the config has them but we only want to show questions in this specific UI?
  // The provided UI is a question UI. If we have intro/result logic, we might need to handle overlay or redirect.
  // For now, let's assume valid questions. 

  if (inst.type === "intro" || inst.type === "results") {
    // Just auto skip non-questions for this specific layout if they appear in array
    estado.currentIndex++;
    RenderScreen();
    return;
  }


  estado.hasAnswered = false;
  estado.selectedOption = null;

  // Reset UI
  btnTrue.classList.remove("active", "disabled", "selected-card");
  btnFalse.classList.remove("active", "disabled", "selected-card");
  // Make them clickable again
  btnTrue.style.pointerEvents = "auto";
  btnFalse.style.pointerEvents = "auto";

  feedbackMsgs.forEach(el => el.style.display = "none");
  const explEl = document.getElementById("answer-explanation");
  if (explEl) explEl.style.display = "none";

  btnNext.classList.add("d-none");
  btnNext.style.visibility = "visible"; // We use d-none instead

  // Set Text
  if (questionTextEl) questionTextEl.textContent = inst.question || "Pregunta...";
}

function SelectOption(isTrue) {
  if (estado.hasAnswered) return;

  estado.selectedOption = isTrue;

  // Visual selection
  btnTrue.classList.remove("selected-card");
  btnFalse.classList.remove("selected-card");

  if (isTrue) {
    btnTrue.classList.add("selected-card");
  } else {
    btnFalse.classList.add("selected-card");
  }

  // Show Next button
  btnNext.classList.remove("d-none");
}

async function HandleAnswer() {
  if (estado.hasAnswered || estado.selectedOption === null) return;
  estado.hasAnswered = true;

  const isTrue = estado.selectedOption;

  // Disable interactions
  btnTrue.style.pointerEvents = "none";
  btnFalse.style.pointerEvents = "none";
  btnNext.classList.add("d-none");

  try {
    const formData = new URLSearchParams();
    formData.append("gid", estado.gid);
    formData.append("op", "check_answer");
    formData.append("index", estado.currentIndex);
    formData.append("selected", isTrue ? "true" : "false");

    const response = await fetch("ajax/action.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString()
    });
    const data = await response.json();

    // Show Feedback in Modal
    if (data.success) {
      if (data.isCorrect) {
        if (isTrue) btnTrue.classList.add("active");
        else btnFalse.classList.add("active");
      } else {
        // Option: we could highlight the wrong one or just show the modal
      }

      const modalId = data.isCorrect ? 'correct' : 'timeout';
      const modalEl = document.getElementById(modalId);
      if (modalEl) {
        const inst = estado.instances[estado.currentIndex];
        const descEl = modalEl.querySelector(".modal-question-desc");
        const explEl = modalEl.querySelector(".modal-explanation");

        if (descEl) descEl.textContent = inst.question || "";
        if (explEl) explEl.textContent = data.explanation || "";

        if (modalId === 'correct' && modalCorrect) modalCorrect.show();
        else if (modalId === 'timeout' && modalTimeout) modalTimeout.show();
      }

      estado.score = data.totalScore;
    }

  } catch (e) {
    console.error("Error checking answer:", e);
  }
}

async function FinishGame() {
  if (estado.timerInterval) clearInterval(estado.timerInterval);

  try {
    const formData = new URLSearchParams();
    formData.append("gid", estado.gid);

    await fetch("ajax/game-over.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString()
    });

    // Redirect or show final alert
    alert("Juego terminado. Puntaje: " + estado.score);
    // Reload or go to index (maybe specific URL)
    window.location.href = "index.html";

  } catch (e) {
    console.error(e);
  }
}

// Event Listeners
if (btnTrue) btnTrue.addEventListener("click", () => SelectOption(true));
if (btnFalse) btnFalse.addEventListener("click", () => SelectOption(false));

if (btnNext) btnNext.addEventListener("click", () => {
  HandleAnswer();
});

// Start
document.addEventListener("DOMContentLoaded", () => {
  // Initialize modals
  const modalCorrectEl = document.getElementById('correct');
  const modalTimeoutEl = document.getElementById('timeout');

  if (typeof bootstrap !== 'undefined') {
    if (modalCorrectEl) modalCorrect = new bootstrap.Modal(modalCorrectEl, { backdrop: 'static', keyboard: false });
    if (modalTimeoutEl) modalTimeout = new bootstrap.Modal(modalTimeoutEl, { backdrop: 'static', keyboard: false });
  }

  // Handle continue buttons
  document.querySelectorAll(".btn-modal-continue").forEach(btn => {
    btn.onclick = () => {
      if (modalCorrect) modalCorrect.hide();
      if (modalTimeout) modalTimeout.hide();

      estado.currentIndex++;
      RenderScreen();
    };
  });

  IniciarJuego();
});
