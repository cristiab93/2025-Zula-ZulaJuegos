const DEBUG = true;

const estado = {
    gid: null,
    items: [],
    currentIndex: 0,
    answersStatus: {}, // index -> 'success' | 'error'
    tiempoRestante: 60,
    initialDuration: 60,
    juegoTerminado: false,
    timerStartTime: null,
    timerInitialTimeLeft: null,
    animationFrameId: null,
    syncIntervalo: null
};

// DOM Elements
const timeText = document.getElementById("time");
const circleRing = document.querySelector(".progress-ring__circle");
const roscoWrapper = document.querySelector(".circle-wrapper");
const currentLetterCircle = document.querySelector(".circle-min");
const definitionText = document.querySelector("h3.text-black");
const gameForm = document.querySelector("form");
const gameInput = gameForm.querySelector("input");
const submitBtn = gameForm.querySelector("button");

// Configuration
const RADIUS = 150; // Matches translate(150px) in CSS

function dbg(event, data, level = "log") {
    if (!DEBUG) return;
    console[level](`[ROSCO] ${event}`, data || "");
}

async function IniciarJuego() {
    dbg("INICIANDO_JUEGO");
    try {
        const response = await $.post("ajax/game-start.php", { cfg_key: "rosco" });
        const data = typeof response === "string" ? JSON.parse(response) : response;
        dbg("GAME_START_RESPONSE", data);

        if (data.success) {
            estado.gid = data.gid;
            estado.items = data.items;
            estado.tiempoRestante = data.time_left || data.duration || 60;
            estado.initialDuration = data.duration || 60;
            estado.currentIndex = data.current_index || 0;
            estado.answersStatus = data.answers_status || {};

            RenderRosco();
            UpdateScreen();
            IniciarTimer();
            IniciarSync();
        } else {
            alert("Error al iniciar el juego: " + (data.error || "Desconocido"));
        }
    } catch (e) {
        console.error("Error fetching game start:", e);
    }
}

function RenderRosco() {
    roscoWrapper.innerHTML = "";
    const total = estado.items.length;

    estado.items.forEach((item, idx) => {
        const angle = (360 / total) * idx - 90;
        const div = document.createElement("div");
        div.className = `circle item letter-${idx}`;
        div.textContent = item.letter.toUpperCase();

        // Dynamic radial position
        div.style.position = "absolute";
        div.style.top = "40%";
        div.style.left = "50%";
        div.style.transformOrigin = "center";
        div.style.transform = `rotate(${angle}deg) translate(${RADIUS}px) rotate(${-angle}deg)`;

        roscoWrapper.appendChild(div);
    });
}

function UpdateScreen(clearInput = true) {
    if (estado.juegoTerminado) return;

    const item = estado.items[estado.currentIndex];
    if (!item) return;

    // Update current definition
    currentLetterCircle.textContent = item.letter.toUpperCase();
    definitionText.textContent = item.definition;

    // Update visual status of all circles
    estado.items.forEach((_, idx) => {
        const el = document.querySelector(`.letter-${idx}`);
        if (!el) return;

        el.classList.remove("active", "success", "error");

        if (estado.answersStatus[idx]) {
            el.classList.add(estado.answersStatus[idx]);
        } else if (idx === estado.currentIndex) {
            el.classList.add("active");
        }
    });

    if (clearInput) {
        console.log("[ROSCO] Clearing input and setting focus");
        gameInput.value = "";
        submitBtn.disabled = true;
        submitBtn.classList.remove("active");
        setTimeout(() => {
            gameInput.focus();
        }, 50);
    }

    // Position Selection Arrow relative to active letter
    const activeCircle = document.querySelector(`.letter-${estado.currentIndex}`);
    if (activeCircle) {
        let arrow = document.querySelector(".selection-arrow");
        if (!arrow) {
            arrow = document.createElement("div");
            arrow.className = "selection-arrow";
            arrow.innerHTML = `<img src="data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21 12L3 12M21 12L14 5M21 12L14 19' stroke='%236610F2' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E" alt="arrow">`;
        }

        if (arrow.parentElement !== activeCircle) {
            activeCircle.appendChild(arrow);
            const total = estado.items.length;
            const angle = (360 / total) * estado.currentIndex - 90;
            // The circle is upright (0deg focal). Center is at -angle relative to circle.
            // We want the arrow to be on the inner side (towards center) and point OUTWARD (towards 0deg in global space? No, towards angle in global space).
            // Since circle is upright, its local X+ is screen RIGHT.
            // The direction FROM THE CENTER to the letter in screen coordinates is 'angle'.
            // To point from the center to the letter, the arrow (pointing RIGHT at 0deg) should be rotated 'angle'.
            // And then translated BACKWARDS so it's between center and letter.
            arrow.style.transform = `rotate(${angle}deg) translate(-62px)`;
        }
    }
}

async function EnviarAccion(op, payload = {}) {
    if (!estado.gid) return;

    const data = { gid: estado.gid, op, ...payload };
    try {
        const response = await $.post("ajax/action.php", data);
        const res = typeof response === "string" ? JSON.parse(response) : response;
        dbg("ACTION_RESPONSE", res);

        if (res.success) {
            // Check for feedback (modal)
            if (res.feedback) {
                // If feedback exists, show modal FIRST.
                // The index update and screen update can happen behind, 
                // but visually we want the user to see the result of THIS answer before moving on.
                ShowFeedbackModal(res.feedback, () => {
                    // Callback after modal closed? 
                    // Actually, we can update the state immediately, but maybe wait to clear input/focus?
                    // Just let it flow. The modal is overlay.
                    ProceedWithStateUpdate(res);
                });
            } else {
                ProceedWithStateUpdate(res);
            }
        }
    } catch (e) {
        console.error("Error sending action:", e);
    }
}

function ProceedWithStateUpdate(res) {
    const indexChanged = estado.currentIndex !== res.current_index;
    estado.currentIndex = res.current_index;
    estado.answersStatus = res.answers_status;

    if (res.status === "won" || res.status === "lost") {
        FinalizarJuego(res);
    } else {
        UpdateScreen(indexChanged);
    }
}

const modalCorrectEl = document.getElementById('correct');
const modalTimeoutEl = document.getElementById('timeout');
let modalCorrect = null;
let modalTimeout = null;

// Setup Modal Buttons once
document.addEventListener("DOMContentLoaded", () => {
    // Initialize modals if bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        if (modalCorrectEl) modalCorrect = new bootstrap.Modal(modalCorrectEl, { backdrop: 'static', keyboard: false });
        if (modalTimeoutEl) modalTimeout = new bootstrap.Modal(modalTimeoutEl, { backdrop: 'static', keyboard: false });
    } else {
        console.error("[ROSCO] Bootstrap is not defined!");
    }

    if (modalCorrectEl) {
        const btn = modalCorrectEl.querySelector("button");
        if (btn) btn.addEventListener("click", () => {
            if (modalCorrect) modalCorrect.hide();
            setTimeout(() => gameInput.focus(), 100);
        });
    }

    if (modalTimeoutEl) {
        const btn = modalTimeoutEl.querySelector("button");
        if (btn) btn.addEventListener("click", () => {
            if (modalTimeout) modalTimeout.hide();
            setTimeout(() => gameInput.focus(), 100);
        });
    }
});

function ShowFeedbackModal(feedback, callback) {
    console.log("[ROSCO] ShowFeedbackModal called with:", feedback);
    if (!modalCorrect || !modalTimeout) {
        console.warn("[ROSCO] Modals not initialized. Bootstrap missing?");
        if (callback) callback();
        return;
    }

    // feedback: { status: 'success'|'error', correct_answer, explanation, title }

    if (feedback.status === 'success') {
        const el = document.getElementById('correct');
        // Update content
        el.querySelector('h4').textContent = feedback.title || "¡Respuesta Correcta!";

        const explDiv = el.querySelector('.bg-green-100');
        const explText = el.querySelector('p.text-black');

        if (feedback.explanation) {
            explDiv.style.display = 'flex';
            explText.style.display = 'block';
            explText.textContent = feedback.explanation;
        } else {
            // Hide explanation box if empty
            explDiv.style.display = 'none';
            explText.style.display = 'none';
        }

        modalCorrect.show();
    } else {
        const el = document.getElementById('timeout');
        // Update content
        el.querySelector('h4').textContent = feedback.title || "Casi... Respuesta Incorrecta";

        const explDiv = el.querySelector('.bg-red-100');
        const explText = el.querySelector('p.text-black');

        let msg = "";

        if (feedback.explanation) {
            msg += feedback.explanation;
        }

        if (msg) {
            explDiv.style.display = 'flex';
            explText.style.display = 'block';
            explText.textContent = msg;
        } else {
            explDiv.style.display = 'none';
            explText.style.display = 'none';
        }

        modalTimeout.show();
    }

    if (callback) callback();
}

// Timer Logic
function IniciarTimer() {
    if (estado.animationFrameId) cancelAnimationFrame(estado.animationFrameId);

    estado.timerStartTime = performance.now();
    estado.timerInitialTimeLeft = estado.tiempoRestante;

    function animate(timestamp) {
        if (estado.juegoTerminado) return;

        const elapsedMs = timestamp - estado.timerStartTime;
        const currentLeft = Math.max(0, estado.timerInitialTimeLeft - elapsedMs / 1000);

        estado.tiempoRestante = currentLeft;
        ActualizarUITimer();

        if (currentLeft <= 0) {
            FinalizarJuego({ status: "lost" });
            return;
        }

        estado.animationFrameId = requestAnimationFrame(animate);
    }
    estado.animationFrameId = requestAnimationFrame(animate);
}

function ActualizarUITimer() {
    const displayTime = Math.ceil(estado.tiempoRestante);
    const m = String(Math.floor(displayTime / 60)).padStart(2, "0");
    const s = String(displayTime % 60).padStart(2, "0");
    timeText.textContent = `${m}:${s}`;

    if (circleRing) {
        const circumference = 2 * Math.PI * 42;
        circleRing.style.strokeDasharray = circumference;
        const offset = ((estado.initialDuration - estado.tiempoRestante) / estado.initialDuration) * circumference;
        circleRing.style.strokeDashoffset = offset;
    }
}

function IniciarSync() {
    if (estado.syncIntervalo) clearInterval(estado.syncIntervalo);
    estado.syncIntervalo = setInterval(() => {
        if (estado.juegoTerminado) return;
        EnviarAccion("tick", {});
    }, 5000);
}

function FinalizarJuego(res) {
    estado.juegoTerminado = true;
    if (estado.animationFrameId) cancelAnimationFrame(estado.animationFrameId);
    if (estado.syncIntervalo) clearInterval(estado.syncIntervalo);

    dbg("GAME_OVER", res);

    // Show final status
    const statusText = res.status === "won" ? "¡GANASTE!" : "FIN DEL JUEGO";
    definitionText.innerHTML = `<span class="fw-700">${statusText}</span><br>Has completado el rosco.`;

    // Trigger game-over.php to save final results
    $.post("ajax/game-over.php", { gid: estado.gid }, (finalData) => {
        const data = typeof finalData === "string" ? JSON.parse(finalData) : finalData;
        if (data.success) {
            // Option to redirect or show modal
            alert(`Juego terminado. Respuestas correctas: ${data.correct_count} de ${data.total_count}`);
            window.location.href = "index.html";
        }
    });
}

// Event Listeners
gameInput.oninput = (e) => {
    const val = gameInput.value.trim();
    if (val.length > 0) {
        submitBtn.disabled = false;
        submitBtn.classList.add("active");
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.remove("active");
    }
};

gameForm.onsubmit = (e) => {
    e.preventDefault();
    const val = gameInput.value.trim().toUpperCase();
    if (val !== "") {
        EnviarAccion("answer", { answer: val });
    } else {
        // Empty = Pasapalabra only via Enter key
        EnviarAccion("pasapalabra");
    }
};

// Diagnostic click listener
gameInput.onclick = () => {
    console.log("[ROSCO] Input clicked");
};

document.addEventListener("DOMContentLoaded", () => {
    IniciarJuego();

    // Check for modal backdrop issues
    setInterval(() => {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop && !document.body.classList.contains('modal-open')) {
            console.warn("[ROSCO] Found orphaned backdrop, removing...");
            backdrop.remove();
        }
    }, 2000);

    // Aggressive Input Enabler
    if (gameInput) {
        // Debug listeners
        gameInput.addEventListener('focus', () => console.log("[ROSCO] Input FOCUSED"));
        gameInput.addEventListener('blur', () => console.log("[ROSCO] Input BLURRED"));

        let attempts = 0;
        const enabler = setInterval(() => {
            attempts++;
            if (attempts > 20) clearInterval(enabler); // Stop after ~10 seconds

            if (gameInput.disabled) {
                console.warn("[ROSCO] Input was disabled, enabling...");
                gameInput.disabled = false;
            }
            if (gameInput.readOnly) {
                console.warn("[ROSCO] Input was readOnly, fixing...");
                gameInput.readOnly = false;
            }

            // Only focus if we don't have it (to avoid flickering cursor if user is typing)
            if (document.activeElement !== gameInput && !estado.juegoTerminado) {
                // console.log("[ROSCO] Re-focusing input...");
                // gameInput.focus(); 
                // Don't force focus repeatedly as it might be annoying if user clicked away, 
                // but for "Start" issue, we want to ensure it's usable.
                // Let's force it only in the first 2 seconds.
                if (attempts < 5) gameInput.focus();
            }
        }, 500);
    }
});
