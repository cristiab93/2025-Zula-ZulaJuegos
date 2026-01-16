const DEBUG = true;

const estado = {
  gid: null,
  instances: [],
  currentRound: 0,
  roundsToPlay: 4,
  score: 0,
  juegoTerminado: false,
  tiempoRestante: 60,
  initialDuration: 60,
  intervalo: null,
  animationFrameId: null,
  timerStartTime: null,
  timerInitialTimeLeft: null,
  isSpinning: false,
  currentRotation: 0,
  targetRotation: 0,
  currentSpinningIndex: null,
  selectedOption: null,
  playedIndices: [],
  results: {} // { index: 'correct' | 'incorrect' }
};

const DISTANCE = 155;
const originalColors = [
  '#739CFF', '#84BBBF', '#90D67F', '#C7D182',
  '#FFCC85', '#E1B4C2', '#C29CFF', '#9E9FFF'
];
const activeColors = [
  '#3874FF', '#2F9281', '#25B003', '#87A620',
  '#EA9C3C', '#C78699', '#A370F7', '#6E72FB'
];

let currentWheelColors = [...originalColors];

// DOM Elements
const wheelEl = document.getElementById("main-wheel");
const spinBtn = document.getElementById("spin-btn");
const questionArea = document.getElementById("question-area");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const submitBtn = document.getElementById("submit-answer");
const roundCounter = document.getElementById("round-counter");
const tiempoEl = document.getElementById("time");

let modalCorrect, modalTimeout;

document.addEventListener("DOMContentLoaded", () => {
  const modalCorrectEl = document.getElementById('correct');
  const modalTimeoutEl = document.getElementById('timeout');

  if (typeof bootstrap !== 'undefined') {
    if (modalCorrectEl) modalCorrect = new bootstrap.Modal(modalCorrectEl, { backdrop: 'static', keyboard: false });
    if (modalTimeoutEl) modalTimeout = new bootstrap.Modal(modalTimeoutEl, { backdrop: 'static', keyboard: false });
  }

  document.querySelectorAll('.btn-modal-continue').forEach(btn => {
    btn.addEventListener('click', () => {
      if (modalCorrect) modalCorrect.hide();
      if (modalTimeout) modalTimeout.hide();
      PrepareNextRound();
    });
  });

  IniciarJuego();
});

function IniciarJuego() {
  $.post("ajax/game-start.php", { cfg_key: "ruleta" }, (data) => {
    if (data.success) {
      estado.gid = data.gid;
      estado.instances = data.instances;
      estado.tiempoRestante = data.duration;
      estado.initialDuration = data.duration;
      estado.roundsToPlay = data.rounds_to_play;

      UpdateUI();
      IniciarTimer();
      drawWheelGradient();
      updateWheelPositions();
      submitBtn.textContent = "GIRAR LA RULETA";
    }
  });
}

function IniciarTimer() {
  estado.timerStartTime = performance.now();
  estado.timerInitialTimeLeft = estado.tiempoRestante;

  function animate(timestamp) {
    if (estado.juegoTerminado) return;

    const elapsedMs = timestamp - estado.timerStartTime;
    const newTiempoRestante = Math.max(0, estado.timerInitialTimeLeft - elapsedMs / 1000);

    estado.tiempoRestante = newTiempoRestante;
    ActualizarTiempo();

    if (newTiempoRestante <= 0) {
      FinalizarJuego();
      return;
    }
    estado.animationFrameId = requestAnimationFrame(animate);
  }
  estado.animationFrameId = requestAnimationFrame(animate);
}

function ActualizarTiempo() {
  const s = Math.ceil(estado.tiempoRestante);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  tiempoEl.textContent = `${mm}:${ss}`;

  const circle = document.querySelector(".progress-ring__circle");
  if (circle) {
    const circumference = 2 * Math.PI * 42;
    circle.style.strokeDasharray = circumference;
    const elapsed = estado.initialDuration - estado.tiempoRestante;
    circle.style.strokeDashoffset = (elapsed / estado.initialDuration) * circumference;
  }
}

function drawWheelGradient() {
  let gradientString = 'conic-gradient(from -22.5deg, ';
  currentWheelColors.forEach((color, index) => {
    const startDeg = index * 45;
    const endDeg = (index + 1) * 45;
    gradientString += `${color} ${startDeg}deg ${endDeg}deg`;
    if (index < currentWheelColors.length - 1) gradientString += ', ';
  });
  gradientString += ')';
  wheelEl.style.background = gradientString;
}

function updateWheelPositions() {
  wheelEl.style.transform = `rotate(-${estado.currentRotation}deg)`;
  wheelEl.querySelectorAll('.number').forEach(num => {
    const startAngle = parseFloat(num.getAttribute('data-angle'));
    num.style.transform = `
      rotate(${startAngle - 90}deg) 
      translate(${DISTANCE}px) 
      rotate(${-startAngle + 90 + estado.currentRotation}deg)
    `;
  });
}

spinBtn.addEventListener("click", () => {
  if (estado.isSpinning || estado.juegoTerminado || estado.currentRound >= estado.roundsToPlay) return;
  if (estado.currentSpinningIndex !== null) return; // Must answer current first

  $.post("ajax/action.php", { op: "spin", gid: estado.gid }, (data) => {
    if (data.success) {
      StartWheelAnimation(data.chosen_index);
    }
  });
});

function StartWheelAnimation(targetIndex) {
  estado.isSpinning = true;
  estado.currentSpinningIndex = targetIndex;
  document.querySelector('.winner-highlight').classList.remove('active');

  const extraSpins = 5 + Math.floor(Math.random() * 5);
  estado.targetRotation = estado.currentRotation + (extraSpins * 360) + (targetIndex * 45);

  function animate() {
    const speed = 0.05;
    const diff = estado.targetRotation - estado.currentRotation;

    if (diff < 0.5) {
      estado.currentRotation = estado.targetRotation;
      updateWheelPositions();
      FinishSpin();
      return;
    }
    estado.currentRotation += diff * speed;
    updateWheelPositions();
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

function FinishSpin() {
  estado.isSpinning = false;
  document.querySelector('.winner-highlight').classList.add('active');

  // Highlight color
  currentWheelColors[estado.currentSpinningIndex] = activeColors[estado.currentSpinningIndex];
  drawWheelGradient();

  RenderQuestion(estado.currentSpinningIndex);
}

function RenderQuestion(index) {
  const inst = estado.instances[index];
  questionArea.style.opacity = "1";
  questionArea.style.pointerEvents = "all";
  questionText.textContent = inst.text;
  submitBtn.textContent = "RESPONDER";

  optionsContainer.innerHTML = "";
  inst.options.forEach((opt, i) => {
    const div = document.createElement("div");
    div.className = "form-check bg-white border py-3 w-100 rounded-3 mb-3 cursor-pointer option-item";
    div.innerHTML = `<p class="font14 mb-0 ms-3">${opt}</p>`;
    div.addEventListener("click", () => {
      document.querySelectorAll('.option-item').forEach(el => el.classList.remove('active'));
      div.classList.add('active');
      estado.selectedOption = i;
      submitBtn.disabled = false;
    });
    optionsContainer.appendChild(div);
  });
}

submitBtn.addEventListener("click", () => {
  if (estado.selectedOption === null) return;

  $.post("ajax/action.php", {
    op: "check_answer",
    gid: estado.gid,
    index: estado.currentSpinningIndex,
    selected: estado.selectedOption
  }, (data) => {
    if (data.success) {
      ShowFeedback(data);
    }
  });
});

function ShowFeedback(data) {
  const inst = estado.instances[estado.currentSpinningIndex];
  const modal = data.isCorrect ? modalCorrect : modalTimeout;
  const modalEl = modal._element;

  modalEl.querySelector('.modal-question-desc').textContent = inst.text;
  modalEl.querySelector('.modal-explanation').textContent = data.explanation;

  // Update wheel number to V or X
  const numEl = wheelEl.querySelector(`.number[data-angle="${estado.currentSpinningIndex * 45}"]`);
  if (data.isCorrect) {
    numEl.innerHTML = `<img src="img/check.svg" height="13">`;
  } else {
    numEl.innerHTML = `<img src="img/wrong.svg" height="13">`;
  }

  modal.show();

  if (data.isFinished) {
    estado.juegoTerminado = true;
  }
}

function PrepareNextRound() {
  if (estado.juegoTerminado) {
    FinalizarJuego();
    return;
  }

  estado.currentSpinningIndex = null;
  estado.selectedOption = null;
  submitBtn.disabled = true;
  questionArea.style.opacity = "0.5";
  questionArea.style.pointerEvents = "none";
  questionText.textContent = "Gira la ruleta para continuar";
  submitBtn.textContent = "GIRAR LA RULETA";
  optionsContainer.innerHTML = "";

  estado.currentRound++;
  UpdateUI();
}

function UpdateUI() {
  roundCounter.textContent = `${estado.currentRound + 1}/${estado.roundsToPlay}`;
}

function FinalizarJuego() {
  estado.juegoTerminado = true;
  cancelAnimationFrame(estado.animationFrameId);

  $.post("ajax/game-over.php", { gid: estado.gid }, (data) => {
    window.location.href = "index.html";
  });
}
