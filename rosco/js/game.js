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
            const indexChanged = estado.currentIndex !== res.current_index;
            estado.currentIndex = res.current_index;
            estado.answersStatus = res.answers_status;

            if (res.status === "won" || res.status === "lost") {
                FinalizarJuego(res);
            } else {
                UpdateScreen(indexChanged);
            }
        }
    } catch (e) {
        console.error("Error sending action:", e);
    }
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
    // Extra focus attempt
    setTimeout(() => {
        if (gameInput) gameInput.focus();
    }, 1000);
});
