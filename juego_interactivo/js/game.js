const DEBUG = true;

const estado = {
  gid: null,
  instances: [],
  currentIndex: 0,
  userAnswers: {}, // index -> { selected, correct, points }
  pendingAnswer: null, // Stores selected index before submission
  score: 0,
  juegoTerminado: false
};

// DOM Elements
const progressCounterEl = document.getElementById("progress-counter");
const mainTitleEl = document.getElementById("main-title");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const btnFinish = document.getElementById("btn-finish");
const navStandard = document.getElementById("nav-standard");
const navFinish = document.getElementById("nav-finish");
const stepsSliderContainer = document.getElementById("steps-slider-container");

function dbg(event, data) {
  if (!DEBUG) return;
  console.log(`[TRIVIA] ${event}`, data || "");
}

async function IniciarJuego() {
  dbg("INICIANDO_JUEGO");
  try {
    const response = await fetch("ajax/game-start.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "cfg_key=juego_interactivo"
    });
    const data = await response.json();

    if (data.success) {
      estado.gid = data.gid;
      estado.instances = data.instances;
      estado.currentIndex = 0;

      RenderSlider();
      RenderScreen();
    } else {
      alert("Error al iniciar el juego: " + (data.error || "Desconocido"));
    }
  } catch (e) {
    console.error("Error fetching game start:", e);
  }
}

function RenderSlider() {
  if (!stepsSliderContainer) return;

  // Destruir slick si ya existe para re-renderizar
  if ($(stepsSliderContainer).hasClass('slick-initialized')) {
    $(stepsSliderContainer).slick('unslick');
  }

  stepsSliderContainer.innerHTML = "";
  estado.instances.forEach((inst, idx) => {
    const card = document.createElement("div");
    card.className = "step-card";
    if (idx === estado.currentIndex) card.classList.add("active");
    else if (idx < estado.currentIndex) card.classList.add("success");
    else card.classList.add("locked");

    const iconDiv = document.createElement("div");
    iconDiv.className = "icon-circle";
    if (idx < estado.currentIndex) {
      iconDiv.innerHTML = `<img src="img/check.svg" height="9">`;
    } else if (idx > estado.currentIndex) {
      iconDiv.innerHTML = `<img src="img/lock.svg" height="15">`;
    } else {
      iconDiv.style.display = "none";
    }

    const p = document.createElement("p");
    p.className = (idx < estado.currentIndex) ? "" : "mb-0";
    p.textContent = `${idx + 1}. ${inst.step_title || 'Info'}`;

    card.appendChild(iconDiv);
    card.appendChild(p);
    stepsSliderContainer.appendChild(card);
  });

  // Re-inicializar slick
  $(stepsSliderContainer).slick({
    slidesToShow: 10.5,
    slidesToScroll: 1,
    infinite: false,
    arrows: false,
    dots: false,
    swipeToSlide: true,
    touchThreshold: 10,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 6.5 } },
      { breakpoint: 1400, settings: { slidesToShow: 8.5 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } }
    ]
  });

  // Ir al slide actual
  $(stepsSliderContainer).slick('slickGoTo', estado.currentIndex);
}

function RenderScreen() {
  const inst = estado.instances[estado.currentIndex];
  if (!inst) return;

  dbg("RENDERING_SCREEN", { index: estado.currentIndex, type: inst.type });

  // Hide all screens
  document.querySelectorAll(".trivia-screen").forEach(el => el.style.setProperty("display", "none", "important"));

  // Update progress
  progressCounterEl.textContent = `${estado.currentIndex + 1}/${estado.instances.length}`;

  // Handle Title
  if (inst.title) {
    mainTitleEl.textContent = inst.title;
    mainTitleEl.style.display = "block";
  } else {
    mainTitleEl.style.display = "none";
  }

  // Identify screen element
  let screenId = "";
  switch (inst.type) {
    case "text_image": screenId = "screen-text-image"; break;
    case "image_text": screenId = "screen-image-text"; break;
    case "text_video": screenId = "screen-text-video"; break;
    case "only_text": screenId = "screen-only-text"; break;
    case "only_image": screenId = "screen-only-image"; break;
    case "intro_trivia": screenId = "screen-intro-trivia"; break;
    case "question": screenId = "screen-question"; break;
    case "results": screenId = "screen-results"; break;
  }

  const screenEl = document.getElementById(screenId);
  if (screenEl) {
    // Reset animation
    screenEl.classList.remove("animate-in");
    void screenEl.offsetWidth; // Trigger reflow

    screenEl.style.setProperty("display", "flex", "important");
    screenEl.classList.add("animate-in");

    // Specific content injection
    PopulateScreenContent(inst, screenId);
  }

  UpdateNavigation();
  UpdateSliderClasses();
}

function PopulateScreenContent(inst, screenId) {
  if (screenId === "screen-text-image") {
    document.getElementById("text-image-content").innerHTML = inst.text || "";
    document.getElementById("text-image-img").style.backgroundImage = `url(${inst.image})`;
  } else if (screenId === "screen-image-text") {
    document.getElementById("image-text-content").innerHTML = inst.text || "";
    document.getElementById("image-text-img").style.backgroundImage = `url(${inst.image})`;
  } else if (screenId === "screen-text-video") {
    document.getElementById("text-video-content").innerHTML = inst.text || "";
    const videoEl = document.getElementById("text-video-src");
    const loaderEl = document.getElementById("video-loader");
    const containerEl = document.getElementById("video-container");

    // Reset container to loading state
    containerEl.style.background = "#fdfdfd";
    containerEl.style.border = "2px dashed #e0e0e0";
    loaderEl.style.display = "block";
    videoEl.style.display = "none";
    videoEl.src = inst.video || "";

    videoEl.oncanplay = () => {
      loaderEl.style.display = "none";
      videoEl.style.display = "block";
      // Remove loading box styles
      containerEl.style.background = "transparent";
      containerEl.style.border = "none";
    };
  } else if (screenId === "screen-only-text") {
    document.getElementById("only-text-content").innerHTML = inst.text || "";
  } else if (screenId === "screen-only-image") {
    document.getElementById("only-image-src").src = inst.image || "";
  } else if (screenId === "screen-intro-trivia") {
    document.getElementById("intro-trivia-title").textContent = inst.title || "Pon a prueba lo aprendido";
    document.getElementById("intro-trivia-desc").innerHTML = inst.text || "Responde las siguientes preguntas...";
  } else if (screenId === "screen-question") {
    document.getElementById("question-text").textContent = inst.question;
    const container = document.getElementById("options-container");
    container.innerHTML = "";

    inst.options.forEach((opt, idx) => {
      const div = document.createElement("div");
      div.className = "form-check border py-3 w-100 ps-5 rounded-3 mb-2 cursor-pointer";

      // Check if already answered or pending
      if (estado.userAnswers[estado.currentIndex]) {
        if (estado.userAnswers[estado.currentIndex].selected === idx) {
          div.classList.add("active");
        }
      } else if (estado.pendingAnswer === idx) {
        div.classList.add("active");
      }

      div.innerHTML = `
                <input class="form-check-input me-3" type="radio" name="trivia-opt" id="opt-${idx}" ${estado.userAnswers[estado.currentIndex]?.selected === idx ? 'checked' : ''}>
                <label class="form-check-label font14 cursor-pointer" for="opt-${idx}">
                    ${opt}
                </label>
            `;

      div.onclick = () => HandleSelectOption(idx);
      container.appendChild(div);
    });
  } else if (screenId === "screen-results") {
    RenderResults();
  }
}

function HandleSelectOption(idx) {
  // If already answered/submitted, do nothing
  if (estado.userAnswers[estado.currentIndex]) return;

  // Just update UI and pending state
  estado.pendingAnswer = idx;

  const container = document.getElementById("options-container");
  container.querySelectorAll(".form-check").forEach((el, i) => {
    if (i === idx) {
      el.classList.add("active");
      const input = el.querySelector("input");
      if (input) input.checked = true;
    } else {
      el.classList.remove("active");
      const input = el.querySelector("input");
      if (input) input.checked = false;
    }
  });
}

async function _SubmitAnswer() {
  const idx = estado.pendingAnswer;
  if (idx === null || idx === undefined) return false;

  dbg("SENDING_ANSWER", { index: idx });

  try {
    const formData = new URLSearchParams();
    formData.append("gid", estado.gid);
    formData.append("op", "check_answer");
    formData.append("index", estado.currentIndex);
    formData.append("selected", idx);

    const response = await fetch("ajax/action.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString()
    });
    const data = await response.json();

    if (data.success) {
      estado.userAnswers[estado.currentIndex] = {
        selected: idx,
        correct: data.correctIndex,
        isCorrect: data.isCorrect,
        points: data.points,
        explanation: data.explanation,
        question: estado.instances[estado.currentIndex].question
      };

      estado.pendingAnswer = null; // Clear pending

      // Lock UI
      const container = document.getElementById("options-container");
      container.querySelectorAll(".form-check").forEach(el => {
        el.style.pointerEvents = "none";
      });

      dbg("ANSWER_PROCESSED", { isCorrect: data.isCorrect });
      return true;
    } else {
      console.error("Error al validar respuesta:", data.error);
      return false;
    }
  } catch (error) {
    console.error("Error en _SubmitAnswer:", error);
    return false;
  }
}

function RenderResults() {
  let totalScore = 0;
  let correctCount = 0;
  let totalQuestions = 0;

  const cardsContainer = document.getElementById("results-cards-container");
  cardsContainer.innerHTML = "";

  estado.instances.forEach((inst, idx) => {
    if (inst.type === "question") {
      totalQuestions++;
      const ans = estado.userAnswers[idx];
      if (ans) {
        totalScore += ans.points;
        if (ans.isCorrect) correctCount++;

        const isWin = ans.isCorrect;
        const cardCol = document.createElement("div");
        cardCol.className = "col-12 col-md-6 col-lg-3 mt-4";
        cardCol.innerHTML = `
                    <div class="card rounded-4">
                        <div class="card-body p-3">
                            <div class="d-flex align-items-center">
                                <img src="img/${isWin ? 'ok.svg' : 'error.svg'}" height="35">
                                <p class="mb-0 ms-3 font14">${ans.question}</p>
                            </div>
                            <hr>
                            <div class="card rounded-2 p-3 bg-subtle mt-2">
                                <p class="font10 mb-0 fw-500 text-grey-500 text-uppercase">Tu respuesta</p>
                                <p class="text-black mb-0 fw-600 lh-sm">${inst.options[ans.selected]}</p>
                            </div>
                            <div class="d-flex align-items-center mt-3 bg-${isWin ? 'green' : 'red'}-100 fit-content rounded-2 p-2">
                                <img src="img/${isWin ? 'explicacion-ok.svg' : 'explicacion.svg'}" height="21">
                                <p class="mb-0 fw-600 ms-2 font11 text-${isWin ? 'green' : 'red'}-700 lh-sm">${isWin ? 'Tip de Seguridad' : 'Explicación'}</p>
                            </div>
                            <p class="mb-0 text-black font11 mt-3">${ans.explanation}</p>
                        </div>
                    </div>
                `;
        cardsContainer.appendChild(cardCol);
      }
    }
  });

  document.getElementById("results-score").textContent = `Sumaste ${totalScore} puntos`;
  document.getElementById("results-summary").textContent = `Respondiste ${correctCount} de ${totalQuestions}`;
}

function UpdateNavigation() {
  const isFirst = estado.currentIndex === 0;
  const isLast = estado.currentIndex === estado.instances.length - 1;

  btnPrev.style.visibility = isFirst ? "hidden" : "visible";

  if (isLast) {
    navStandard.classList.add("d-none");
    navFinish.classList.remove("d-none");
    navFinish.style.setProperty("display", "flex", "important");
  } else {
    navStandard.classList.remove("d-none");
    navFinish.classList.add("d-none");
    navFinish.style.setProperty("display", "none", "important");
  }
}

function UpdateSliderClasses() {
  const cards = stepsSliderContainer.querySelectorAll(".step-card");
  cards.forEach((card, idx) => {
    const inst = estado.instances[idx];
    const p = card.querySelector("p");
    if (p && inst) {
      p.textContent = `${idx + 1}. ${inst.step_title || 'Info'}`;
      p.className = (idx < estado.currentIndex) ? "" : "mb-0";
    }

    card.classList.remove("active", "success", "locked");
    if (idx === estado.currentIndex) card.classList.add("active");
    else if (idx < estado.currentIndex) card.classList.add("success");
    else card.classList.add("locked");

    // Update icons
    const iconDiv = card.querySelector(".icon-circle");
    if (iconDiv) {
      if (idx < estado.currentIndex) {
        iconDiv.style.display = "flex";
        iconDiv.innerHTML = `<img src="img/check.svg" height="9">`;
      } else if (idx > estado.currentIndex) {
        iconDiv.style.display = "flex";
        iconDiv.innerHTML = `<img src="img/lock.svg" height="15">`;
      } else {
        iconDiv.style.display = "none";
        iconDiv.innerHTML = "";
      }
    }
  });

  $(stepsSliderContainer).slick('slickGoTo', estado.currentIndex);
}

// Global Event Listeners
btnNext.onclick = async () => {
  const currentInst = estado.instances[estado.currentIndex];

  // Validation: If it's a question
  if (currentInst.type === "question") {
    // Check if already answered in DB/Memory
    if (!estado.userAnswers[estado.currentIndex]) {
      // Not confirmed yet. Check pending.
      if (estado.pendingAnswer !== null) {
        // Pending exists -> Submit it!
        const success = await _SubmitAnswer();
        if (!success) {
          // Handle error?
          return;
        }
        // If success, userAnswers[currentIndex] is now set.
      } else {
        // No pending answer -> Error flash
        const container = document.getElementById("options-container");
        const options = container.querySelectorAll(".form-check");

        options.forEach(opt => {
          opt.classList.add("error-flash");
          setTimeout(() => opt.classList.remove("error-flash"), 1000);
        });

        dbg("VALIDATION_FAILED", { index: estado.currentIndex });
        return;
      }
    }
  }

  if (estado.currentIndex < estado.instances.length - 1) {
    estado.currentIndex++;
    estado.pendingAnswer = null; // Clear any stale pending
    RenderScreen();
  }
};

btnPrev.onclick = () => {
  if (estado.currentIndex > 0) {
    estado.currentIndex--;
    RenderScreen();
  }
};

btnFinish.onclick = async (e) => {
  e.preventDefault();
  dbg("GAME_FINISHED");

  // Calcular puntos totales
  let totalScore = 0;
  Object.values(estado.userAnswers).forEach(ans => {
    totalScore += ans.points || 0;
  });

  try {
    const response = await fetch("ajax/game-over.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `gid=${estado.gid}&points=${totalScore}`
    });
    const data = await response.json();
    if (data.success) {
      dbg("GAME_OVER_SUCCESS", data);
      window.location.href = "index.html";
    } else {
      console.error("Error saving results:", data.error);
      window.location.href = "index.html";
    }
  } catch (err) {
    console.error("Error in game-over fetch:", err);
    window.location.href = "index.html";
  }
};

// Start
document.addEventListener("DOMContentLoaded", () => {
  IniciarJuego();
});
