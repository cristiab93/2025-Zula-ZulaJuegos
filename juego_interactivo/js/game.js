const DEBUG = false;

const estado = {
  gid: null,
  instances: [],
  currentIndex: 0,
  userAnswers: {}, // index -> { selected, correct, points }
  pendingAnswer: null, // Stores selected index before submission
  score: 0,
  juegoTerminado: false,
  videoCompleted: {}, // index -> boolean
  maxIndexReached: 0
};

// DOM Elements
const progressCounterEl = document.getElementById("progress-counter");

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
    console.log("[BACKEND_RESPONSE] game-start.php:", data);

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

  // Listener para pausar video si cambia de pestaña
  document.addEventListener('visibilitychange', () => {
    const videoEl = document.getElementById('text-video-src');
    if (document.hidden && videoEl && !videoEl.paused) {
      videoEl.pause();
      dbg("VIDEO_PAUSED_BY_VISIBILITY");
    }
  });
}

function RenderSlider() {
  dbg("RENDERING_SLIDER");
  if (!stepsSliderContainer) return;

  // Destruir slick si ya existe para re-renderizar
  try {
    if (typeof $.fn.slick === 'function' && $(stepsSliderContainer).hasClass('slick-initialized')) {
      $(stepsSliderContainer).slick('unslick');
    }
  } catch (e) {
    console.warn("Error unslicking:", e);
  }

  stepsSliderContainer.innerHTML = "";
  estado.instances.forEach((inst, idx) => {
    const card = document.createElement("div");
    card.className = "step-card";
    if (idx === estado.currentIndex) card.classList.add("active");
    else if (idx < estado.currentIndex) card.classList.add("success");
    else card.classList.add("locked");

    const p = document.createElement("p");
    p.className = (idx < estado.currentIndex) ? "" : "mb-0";
    p.textContent = `${idx + 1}. ${inst.step_title || 'Info'}`;

    card.appendChild(p);

    // Click handler for backward/visited navigation
    card.onclick = () => {
      if (idx <= estado.maxIndexReached) {
        IrASeccion(idx);
      } else {
        dbg("SECTION_LOCKED", { index: idx });
      }
    };

    stepsSliderContainer.appendChild(card);
  });

  // Re-inicializar slick
  if (typeof $.fn.slick === 'function') {
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
  } else {
    console.warn("Slick not loaded yet");
  }
}

function RenderScreen() {
  const inst = estado.instances[estado.currentIndex];
  if (!inst) return;

  dbg("RENDERING_SCREEN", { index: estado.currentIndex, type: inst.type });

  // Hide all screens
  document.querySelectorAll(".trivia-screen").forEach(el => el.style.setProperty("display", "none", "important"));

  // Update progress
  progressCounterEl.textContent = `${estado.currentIndex + 1}/${estado.instances.length}`;

  // Handle Title logic moved after screen identification

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

    // Update Title specific to this screen
    const titleEl = screenEl.querySelector(".game-main-title");
    if (titleEl) {
      if (inst.title) {
        titleEl.textContent = inst.title;
        titleEl.style.display = "block";
      } else {
        titleEl.style.display = "none";
      }
    }
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
    const playBtn = document.getElementById("video-play-btn");

    // Reset container to loading state
    containerEl.style.background = "#fdfdfd";
    containerEl.style.border = "2px dashed #e0e0e0";
    loaderEl.style.display = "block";
    videoEl.style.display = "none";
    playBtn.style.setProperty("display", "none", "important");
    videoEl.src = inst.video || "";

    videoEl.oncanplay = () => {
      loaderEl.style.display = "none";
      videoEl.style.display = "block";
      // Si el video ya se vio, no mostramos el play grande de nuevo si no queremos, 
      // pero para consistencia lo mostramos
      playBtn.style.setProperty("display", "flex", "important");
      // Remove loading box styles
      containerEl.style.background = "transparent";
      containerEl.style.border = "none";
    };

    videoEl.onplay = () => {
      playBtn.style.setProperty("display", "none", "important");
    };

    playBtn.onclick = () => {
      videoEl.play();
    };

    // Bloqueo de avance hasta terminar video
    if (!estado.videoCompleted[estado.currentIndex]) {
      btnNext.classList.add("disabled");
      btnNext.style.pointerEvents = "none";
      btnNext.style.opacity = "0.5";
    }

    videoEl.onended = () => {
      dbg("VIDEO_ENDED", { index: estado.currentIndex });
      estado.videoCompleted[estado.currentIndex] = true;
      btnNext.classList.remove("disabled");
      btnNext.style.pointerEvents = "auto";
      btnNext.style.opacity = "1";
    };

    // Anti-seeking (evitar adelantar)
    let supposedCurrentTime = 0;
    videoEl.ontimeupdate = () => {
      if (!videoEl.seeking) {
        supposedCurrentTime = videoEl.currentTime;
      }
    };
    videoEl.onseeking = () => {
      const delta = videoEl.currentTime - supposedCurrentTime;
      if (delta > 0.01) {
        videoEl.currentTime = supposedCurrentTime;
        dbg("SEEKING_BLOCKED");
      } else if (delta < -0.01) {
        supposedCurrentTime = videoEl.currentTime;
      }
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
    // Si llegamos a resultados, enviamos todo
    _SubmitAllAnswers();
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

async function _SubmitAllAnswers() {
  dbg("SUBMITTING_ALL_ANSWERS");

  try {
    const formData = new URLSearchParams();
    formData.append("gid", estado.gid);
    formData.append("op", "submit_all_answers");
    formData.append("answers", JSON.stringify(estado.userAnswers));

    const response = await fetch("ajax/action.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString()
    });
    const data = await response.json();
    console.log("[BACKEND_RESPONSE] action.php (submit_all_answers):", data);

    if (data.success) {
      dbg("SUBMIT_ALL_SUCCESS", data);
      RenderResults(data);
    } else {
      console.error("Error al enviar todas las respuestas:", data.error);
    }
  } catch (error) {
    console.error("Error en _SubmitAllAnswers:", error);
  }
}

function RenderResults(data) {
  if (!data) return;

  const cardsContainer = document.getElementById("results-cards-container");
  cardsContainer.innerHTML = "";

  Object.values(data.details).forEach((detail) => {
    const inst = estado.instances[detail.index];
    const isWin = detail.isCorrect;
    const cardCol = document.createElement("div");
    cardCol.className = "col-12 col-md-6 col-lg-3 mt-4";
    cardCol.innerHTML = `
                    <div class="card rounded-4">
                        <div class="card-body p-3">
                            <div class="d-flex align-items-center">
                                <img src="img/${isWin ? 'ok.svg' : 'error.svg'}" height="35">
                                <p class="mb-0 ms-3 font12">${inst.question}</p>
                            </div>
                            <hr>
                            <div class="card rounded-2 px-3 py-2 bg-subtle mt-2">
                                <p class="font10 mb-0 fw-500 text-grey-500 text-uppercase">Tu respuesta</p>
                                <p class="text-black mb-0 fw-600 font13 lh-sm">${detail.selected !== -1 ? inst.options[detail.selected] : 'No respondida'}</p>
                            </div>
                            
                                
                                <p class="mb-0 fw-600 mt-3 font11 text-${isWin ? 'green' : 'red'}-700 lh-sm">${isWin ? 'Tip de Seguridad' : 'Explicación'}</p>
                           
                            <p class="mb-0 text-black font11 mt-2">${detail.explanation}</p>
                        </div>
                    </div>
                `;
    cardsContainer.appendChild(cardCol);
  });

  document.getElementById("results-score").textContent = `Sumaste ${data.totalScore} puntos`;
  document.getElementById("results-summary").textContent = `Respondiste ${data.correctCount} de ${data.totalQuestions}`;
}

function UpdateNavigation() {
  const inst = estado.instances[estado.currentIndex];
  const isFirst = estado.currentIndex === 0;
  const isLast = estado.currentIndex === estado.instances.length - 1;

  btnPrev.style.visibility = isFirst ? "hidden" : "visible";

  // Reset btnNext states by default
  btnNext.classList.remove("disabled");
  btnNext.style.pointerEvents = "auto";
  btnNext.style.opacity = "1";

  // If it's a video and not completed, mark as disabled but keep clickable for feedback
  if (inst && inst.type === "text_video" && !estado.videoCompleted[estado.currentIndex]) {
    btnNext.classList.add("disabled");
    btnNext.style.opacity = "0.5";
    // Keep pointerEvents = "auto" (default) to catch the click
  }

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
    if (idx === estado.currentIndex) {
      card.classList.add("active");
    } else if (idx <= estado.maxIndexReached) {
      card.classList.add("success");
    } else {
      card.classList.add("locked");
    }


  });

  $(stepsSliderContainer).slick('slickGoTo', estado.currentIndex);
}

function ResetAndPauseVideo() {
  const videoEl = document.getElementById('text-video-src');
  if (videoEl) {
    videoEl.currentTime = 0; // Reiniciar al inicio
    videoEl.pause(); // Pausar
    dbg("VIDEO_RESET_AND_PAUSED");
  }
}

// Global Event Listeners
btnNext.onclick = async () => {
  const currentInst = estado.instances[estado.currentIndex];

  // Validation: If it's a question
  if (currentInst.type === "question") {
    // Check if answered
    if (estado.pendingAnswer !== null) {
      // Just save to local estado
      estado.userAnswers[estado.currentIndex] = estado.pendingAnswer;
    } else if (estado.userAnswers[estado.currentIndex] === undefined) {
      // No answer and not previously answered -> Error flash
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

  // Validation: If it's a video screen
  if (currentInst.type === "text_video") {
    if (!estado.videoCompleted[estado.currentIndex]) {
      // Trigger visual feedback
      const videoContainer = document.getElementById("video-container");
      if (videoContainer) {
        videoContainer.classList.remove("video-error");
        void videoContainer.offsetWidth; // trigger reflow
        videoContainer.classList.add("video-error");
        setTimeout(() => videoContainer.classList.remove("video-error"), 800);
      }
      dbg("VIDEO_NOT_FINISHED_FEEDBACK");
      return;
    }
  }

  if (estado.currentIndex < estado.instances.length - 1) {
    IrASeccion(estado.currentIndex + 1);
  }
};

btnPrev.onclick = () => {
  if (estado.currentIndex > 0) {
    IrASeccion(estado.currentIndex - 1);
  }
};

function IrASeccion(idx) {
  dbg("CAMBIANDO_SECCION", { from: estado.currentIndex, to: idx });

  // Reiniciar y pausar el video al cambiar de sección
  ResetAndPauseVideo();

  estado.currentIndex = idx;
  if (idx > estado.maxIndexReached) {
    estado.maxIndexReached = idx;
  }
  estado.pendingAnswer = null; // Clear any stale pending
  RenderScreen();
}

btnFinish.onclick = (e) => {
  e.preventDefault();
  // Redirección directa al finalizar, ya que se guardó todo en el paso anterior (results)
  window.location.href = "index.html";
};

// Start
document.addEventListener("DOMContentLoaded", () => {
  IniciarJuego();
});
