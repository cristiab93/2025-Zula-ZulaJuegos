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
  animationFrameId: null,
  timerStartTime: null,
  timerInitialTimeLeft: null,
  isSpinning: false,
  currentRotation: 0,
  targetRotation: 0,
  currentSpinningIndex: null,
  selectedOption: null,
  playedIndices: [],
  results: {},
  focusIndex: null,
  finalizando: false
};

const DISTANCE = 155;
const originalColors = ['#739CFF', '#84BBBF', '#90D67F', '#C7D182', '#FFCC85', '#E1B4C2', '#C29CFF', '#9E9FFF'];
const activeColors = ['#3874FF', '#2F9281', '#25B003', '#87A620', '#EA9C3C', '#C78699', '#A370F7', '#6E72FB'];

const CORRECT_COLOR = '#25B003';
const INCORRECT_COLOR = '#E04B4B';
const DIM_ALPHA = 0.22;

const POINTER_ANGLE_DEG = 0;

let segmentBaseAngles = null;

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
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modalCorrect) modalCorrect.hide();
      if (modalTimeout) modalTimeout.hide();
      PrepareNextRound();
    });
  });

  window.addEventListener('resize', () => {
    requestAnimationFrame(() => {
      CalibrateSegmentAngles();
    });
  });

  IniciarJuego();
});

function NormalizeDeg(d) {
  let x = d % 360;
  if (x < 0) x += 360;
  return x;
}

function AngleDegFromVector(dx, dy) {
  const rad = Math.atan2(dx, -dy);
  return NormalizeDeg(rad * 180 / Math.PI);
}

function ForcePrimaryEnabled(el) {
  if (!el) return;
  el.classList.add('btn-primary');
  el.classList.remove('btn-secondary', 'btn-light', 'btn-outline-primary', 'btn-outline-secondary', 'opacity-50', 'pe-none', 'disabled');
  el.removeAttribute('aria-disabled');
  el.disabled = false;
  el.removeAttribute('disabled');
  el.style.pointerEvents = 'auto';
  el.style.opacity = '1';
  el.style.filter = 'none';
}

function ForceDisabled(el) {
  if (!el) return;
  el.classList.add('disabled');
  el.setAttribute('aria-disabled', 'true');
  el.disabled = true;
  el.setAttribute('disabled', 'disabled');
  el.style.pointerEvents = 'none';
}

function SetSubmitMode(mode) {
  if (!submitBtn) return;

  if (mode === 'spin') {
    submitBtn.textContent = "GIRAR LA RULETA";
    ForcePrimaryEnabled(submitBtn);
    return;
  }

  if (mode === 'spinning') {
    submitBtn.textContent = "GIRANDO...";
    ForceDisabled(submitBtn);
    return;
  }

  if (mode === 'answer') {
    submitBtn.textContent = "RESPONDER";
    if (estado.selectedOption === null) ForceDisabled(submitBtn);
    else ForcePrimaryEnabled(submitBtn);
    return;
  }
}

function HexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  let h = hex.trim();
  if (h.startsWith('#')) h = h.slice(1);
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length !== 6) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return { r, g, b };
}

function ToRgba(color, alpha) {
  if (!color) return `rgba(0,0,0,${alpha})`;
  const c = String(color).trim();
  if (c.startsWith('rgba(')) {
    const m = c.match(/rgba\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*\)/i);
    if (!m) return c;
    return `rgba(${m[1]},${m[2]},${m[3]},${alpha})`;
  }
  if (c.startsWith('rgb(')) {
    const m = c.match(/rgb\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*\)/i);
    if (!m) return c;
    return `rgba(${m[1]},${m[2]},${m[3]},${alpha})`;
  }
  const rgb = HexToRgb(c);
  if (!rgb) return c;
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
}

function GetSegmentBaseColor(i) {
  const r = estado.results[i];
  if (r === 'correct') return CORRECT_COLOR;
  if (r === 'incorrect') return INCORRECT_COLOR;
  return originalColors[i];
}

function GetSegmentRenderColor(i) {
  const base = GetSegmentBaseColor(i);
  const focus = estado.focusIndex;

  if (focus !== null && focus !== undefined) {
    if (i === focus) {
      const r = estado.results[i];
      if (r === 'correct') return CORRECT_COLOR;
      if (r === 'incorrect') return INCORRECT_COLOR;
      return activeColors[i];
    }
    return ToRgba(base, DIM_ALPHA);
  }

  return base;
}

function GetNumberElByIndex(i) {
  if (!wheelEl) return null;
  return wheelEl.querySelector(`.number[data-angle="${i * 45}"]`);
}

function RenderNumbers() {
  for (let i = 0; i < 8; i++) {
    const numEl = GetNumberElByIndex(i);
    if (!numEl) continue;

    const r = estado.results[i];
    if (r === 'correct') {
      numEl.innerHTML = `<img src="img/check.svg" height="13">`;
      numEl.style.backgroundColor = CORRECT_COLOR;
      numEl.style.color = '#fff';
      numEl.style.borderColor = 'transparent';
    } else if (r === 'incorrect') {
      numEl.innerHTML = `<img src="img/wrong.svg" height="13">`;
      numEl.style.backgroundColor = INCORRECT_COLOR;
      numEl.style.color = '#fff';
      numEl.style.borderColor = 'transparent';
    } else {
      numEl.textContent = String(i + 1);
      numEl.style.backgroundColor = '';
      numEl.style.color = '';
      numEl.style.borderColor = '';
    }

    if (estado.focusIndex !== null && estado.focusIndex !== undefined) {
      const inactive = i !== estado.focusIndex;
      numEl.style.opacity = inactive ? '0.25' : '1';
      numEl.style.filter = inactive ? 'grayscale(1) saturate(0.2)' : 'none';
    } else {
      numEl.style.opacity = '1';
      numEl.style.filter = 'none';
    }
  }
}

function drawWheelGradient() {
  if (!wheelEl) return;
  let gradientString = 'conic-gradient(from -22.5deg, ';
  for (let i = 0; i < 8; i++) {
    const startDeg = i * 45;
    const endDeg = (i + 1) * 45;
    const color = GetSegmentRenderColor(i);
    gradientString += `${color} ${startDeg}deg ${endDeg}deg`;
    if (i < 7) gradientString += ', ';
  }
  gradientString += ')';
  wheelEl.style.background = gradientString;
}

function updateWheelPositions() {
  if (!wheelEl) return;
  wheelEl.style.transform = `rotate(-${estado.currentRotation}deg)`;
  wheelEl.querySelectorAll('.number').forEach(num => {
    const startAngle = parseFloat(num.getAttribute('data-angle'));
    num.style.transform = `rotate(${startAngle - 90}deg) translate(${DISTANCE}px) rotate(${-startAngle + 90 + estado.currentRotation}deg)`;
  });
}

function UpdateWheelVisuals() {
  drawWheelGradient();
  RenderNumbers();
  updateWheelPositions();
}

function CalibrateSegmentAngles() {
  if (!wheelEl) return;

  const wrect = wheelEl.getBoundingClientRect();
  const cx = wrect.left + wrect.width / 2;
  const cy = wrect.top + wrect.height / 2;

  const rot = NormalizeDeg(estado.currentRotation);
  const angles = [];

  for (let i = 0; i < 8; i++) {
    const el = GetNumberElByIndex(i);
    if (!el) {
      angles[i] = NormalizeDeg(i * 45);
      continue;
    }
    const r = el.getBoundingClientRect();
    const ex = r.left + r.width / 2;
    const ey = r.top + r.height / 2;
    const dx = ex - cx;
    const dy = ey - cy;

    const observed = AngleDegFromVector(dx, dy);
    const base = NormalizeDeg(observed + rot);
    angles[i] = base;
  }

  segmentBaseAngles = angles;
}

function DesiredRotationForIndex(targetIndex) {
  if (!segmentBaseAngles || segmentBaseAngles.length !== 8) return NormalizeDeg(targetIndex * 45);
  const baseAngle = segmentBaseAngles[targetIndex];
  return NormalizeDeg(baseAngle - POINTER_ANGLE_DEG);
}

function CanSpin() {
  return !estado.isSpinning && !estado.juegoTerminado && estado.currentRound < estado.roundsToPlay && estado.currentSpinningIndex === null;
}

function RequestSpin(tryNum = 0) {
  if (!CanSpin()) return;

  SetSubmitMode('spinning');

  $.post("ajax/action.php", { op: "spin", gid: estado.gid }, (data) => {
    if (!data || !data.success) {
      SetSubmitMode('spin');
      return;
    }

    const idx = data.chosen_index;

    if (estado.results[idx]) {
      if (tryNum < 5) {
        RequestSpin(tryNum + 1);
        return;
      }
      SetSubmitMode('spin');
      return;
    }

    StartWheelAnimation(idx);
  });
}

function IniciarJuego() {
  $.post("ajax/game-start.php", { cfg_key: "ruleta" }, (data) => {
    if (!data || !data.success) return;

    estado.gid = data.gid;
    estado.instances = data.instances;
    estado.tiempoRestante = data.duration;
    estado.initialDuration = data.duration;
    estado.roundsToPlay = data.rounds_to_play;

    estado.currentRound = 0;
    estado.score = 0;
    estado.juegoTerminado = false;
    estado.playedIndices = [];
    estado.results = {};
    estado.currentRotation = 0;
    estado.targetRotation = 0;
    estado.currentSpinningIndex = null;
    estado.selectedOption = null;
    estado.isSpinning = false;
    estado.focusIndex = null;
    estado.finalizando = false;

    UpdateUI();
    IniciarTimer();
    UpdateWheelVisuals();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        CalibrateSegmentAngles();
      });
    });

    SetSubmitMode('spin');

    if (questionArea) {
      questionArea.style.opacity = "0.5";
      questionArea.style.pointerEvents = "none";
    }
    if (questionText) questionText.textContent = "Gira la ruleta para comenzar";
    if (optionsContainer) optionsContainer.innerHTML = "";
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
  if (tiempoEl) tiempoEl.textContent = `${mm}:${ss}`;

  const circle = document.querySelector(".progress-ring__circle");
  if (circle) {
    const circumference = 2 * Math.PI * 42;
    circle.style.strokeDasharray = circumference;
    const elapsed = estado.initialDuration - estado.tiempoRestante;
    circle.style.strokeDashoffset = (elapsed / estado.initialDuration) * circumference;
  }
}

if (spinBtn) {
  spinBtn.addEventListener("click", (e) => {
    e.preventDefault();
    RequestSpin();
  });
}

function StartWheelAnimation(targetIndex) {
  estado.isSpinning = true;
  estado.currentSpinningIndex = targetIndex;
  estado.focusIndex = null;

  const wh = document.querySelector('.winner-highlight');
  if (wh) wh.classList.remove('active');

  UpdateWheelVisuals();

  const extraSpins = 5 + Math.floor(Math.random() * 5);
  const desiredMod = DesiredRotationForIndex(targetIndex);

  const currentNorm = NormalizeDeg(estado.currentRotation);
  let delta = desiredMod - currentNorm;
  if (delta < 0) delta += 360;

  estado.targetRotation = estado.currentRotation + (extraSpins * 360) + delta;

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

  const wh = document.querySelector('.winner-highlight');
  if (wh) wh.classList.add('active');

  estado.focusIndex = estado.currentSpinningIndex;

  UpdateWheelVisuals();
  RenderQuestion(estado.currentSpinningIndex);
}

function RenderQuestion(index) {
  const inst = estado.instances[index];
  if (!inst) return;

  if (questionArea) {
    questionArea.style.opacity = "1";
    questionArea.style.pointerEvents = "all";
  }

  if (questionText) questionText.textContent = inst.text;

  estado.selectedOption = null;
  SetSubmitMode('answer');

  if (optionsContainer) {
    optionsContainer.innerHTML = "";
    inst.options.forEach((opt, i) => {
      const div = document.createElement("div");
      div.className = "form-check bg-white border py-3 w-100 rounded-3 mb-3 cursor-pointer option-item";
      div.innerHTML = `<p class="font14 mb-0">${opt}</p>`;
      div.addEventListener("click", () => {
        document.querySelectorAll('.option-item').forEach(el => el.classList.remove('active'));
        div.classList.add('active');
        estado.selectedOption = i;
        SetSubmitMode('answer');
      });
      optionsContainer.appendChild(div);
    });
  }
}

if (submitBtn) {
  submitBtn.addEventListener("click", (e) => {
    e.preventDefault();

    if (estado.currentSpinningIndex === null) {
      RequestSpin();
      return;
    }

    if (estado.selectedOption === null) return;

    ForceDisabled(submitBtn);

    $.post("ajax/action.php", {
      op: "check_answer",
      gid: estado.gid,
      index: estado.currentSpinningIndex,
      selected: estado.selectedOption
    }, (data) => {
      if (data && data.success) {
        ShowFeedback(data);
      } else {
        SetSubmitMode('answer');
      }
    });
  });
}

function ShowFeedback(data) {
  const inst = estado.instances[estado.currentSpinningIndex];
  if (!inst) return;

  const idx = estado.currentSpinningIndex;
  estado.results[idx] = data.isCorrect ? 'correct' : 'incorrect';

  UpdateWheelVisuals();

  const modal = data.isCorrect ? modalCorrect : modalTimeout;
  if (modal && modal._element) {
    const modalEl = modal._element;
    const q = modalEl.querySelector('.modal-question-desc');
    const e = modalEl.querySelector('.modal-explanation');
    if (q) q.textContent = inst.text;
    if (e) e.textContent = data.explanation;
    modal.show();
  }

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
  estado.focusIndex = null;

  if (questionArea) {
    questionArea.style.opacity = "0.5";
    questionArea.style.pointerEvents = "none";
  }

  if (questionText) questionText.textContent = "Gira la ruleta para continuar";
  if (optionsContainer) optionsContainer.innerHTML = "";

  estado.currentRound++;
  UpdateUI();
  UpdateWheelVisuals();

  requestAnimationFrame(() => {
    CalibrateSegmentAngles();
  });

  SetSubmitMode('spin');
}

function UpdateUI() {
  if (roundCounter) roundCounter.textContent = `${estado.currentRound + 1}/${estado.roundsToPlay}`;
}

function FinalizarJuego() {
  if (estado.finalizando) return;
  estado.finalizando = true;

  estado.juegoTerminado = true;
  if (estado.animationFrameId) cancelAnimationFrame(estado.animationFrameId);

  ForceDisabled(submitBtn);
  ForceDisabled(spinBtn);

  $.post("ajax/game-over.php", { gid: estado.gid }, (data) => {
    const correct = data && typeof data.correct_count === 'number' ? data.correct_count : 0;
    const total = data && typeof data.total_count === 'number' ? data.total_count : estado.currentRound;
    const timeSpent = data && typeof data.time_spent === 'number' ? data.time_spent : Math.max(0, Math.round(estado.initialDuration - estado.tiempoRestante));

    const msg = `¡Juego terminado!\n\nRespondiste bien ${correct} de ${total} preguntas.\nTiempo total: ${timeSpent} segundos.`;
    alert(msg);

    window.location.href = "index.html";
  });
}
