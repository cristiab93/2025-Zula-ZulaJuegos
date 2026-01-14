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
  hasAnswered: false
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

  // Reset UI
  btnTrue.classList.remove("active", "disabled");
  btnFalse.classList.remove("active", "disabled");
  // Make them clickable again
  btnTrue.style.pointerEvents = "auto";
  btnFalse.style.pointerEvents = "auto";

  feedbackMsgs.forEach(el => el.style.display = "none");
  const explEl = document.getElementById("answer-explanation");
  if (explEl) explEl.style.display = "none";

  btnNext.style.visibility = "hidden"; // Or display none

  // Set Text
  if (questionTextEl) questionTextEl.textContent = inst.question || "Pregunta...";
  // If description exists use it, if not maybe hide it? 
  if (questionDescEl) {
    questionDescEl.textContent = inst.text || "";
  }
}

async function HandleAnswer(isTrue) {
  if (estado.hasAnswered) return;
  estado.hasAnswered = true;

  // Visual selection
  if (isTrue) {
    btnTrue.classList.add("active");
  } else {
    btnFalse.classList.add("active");
  }

  // Disable interactions
  btnTrue.style.pointerEvents = "none";
  btnFalse.style.pointerEvents = "none";

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

    // Show Feedback
    // The original design has <p class="feedback-msg">CORRECTO!</p> inside each col.
    // We can show the one corresponding to the selected button? 
    // Or show the one under the user's choice?
    // Let's assume we show the feedback message under the USER'S choice if correct?
    // Wait, the HTML has "CORRECTO!" hardcoded.

    let msg = "INCORRECTO";
    if (data.isCorrect) msg = "CORRECTO!";

    feedbackMsgs.forEach(el => {
      el.textContent = msg;
      // set style based on correctness if needed, but class is fixed.
      // maybe add text-danger for incorrect?
      if (!data.isCorrect) {
        el.classList.remove("text-violeta");
        el.classList.add("text-danger"); // Bootstrap red
      } else {
        el.classList.add("text-violeta");
        el.classList.remove("text-danger");
      }
    });

    // Show feedback under the button the user clicked
    if (isTrue) {
      btnTrue.parentElement.querySelector(".feedback-msg").style.display = "block";
    } else {
      btnFalse.parentElement.querySelector(".feedback-msg").style.display = "block";
    }

    // Show Explanation
    const explEl = document.getElementById("answer-explanation");
    if (explEl && data.explanation) {
      explEl.textContent = data.explanation;
      explEl.style.display = "block";
    }

    // Show next button
    btnNext.style.visibility = "visible";

    estado.score = data.totalScore;

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
if (btnTrue) btnTrue.addEventListener("click", () => HandleAnswer(true));
if (btnFalse) btnFalse.addEventListener("click", () => HandleAnswer(false));

if (btnNext) btnNext.addEventListener("click", () => {
  estado.currentIndex++;
  RenderScreen();
});

// Start
document.addEventListener("DOMContentLoaded", () => {
  IniciarJuego();
});
