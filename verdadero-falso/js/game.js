const DEBUG = true;

const estado = {
  gid: null,
  board: [],
  wordMap: {},
  tilesSolved: {},
  juegoTerminado: false,
  envioGameOver: false,
  tiempoRestante: 60,
  initialDuration: 60,
  intervalo: null,
  syncIntervalo: null,
  animationFrameId: null,
  timerStartTime: null,
  timerInitialTimeLeft: null,
  cols: null,
  rows: null,
  sortables: [],
  boardAntesDrag: [],
  draggingId: null,
  lastTargetId: null,
  groups: [],
  groupByTile: {},
  groupTitle: {},
  groupWordsNorm: {},
  groupStyle: {},
  solvedRowStyle: {},
  solvedRowGroup: {},
  paletteStyles: [
    { rowClass: "seguridad-active", titleBg: "bg-violeta" },
    { rowClass: "contrasenas-active", titleBg: "bg-turquesa" },
    { rowClass: "dispositivos-active", titleBg: "bg-verde" },
    { rowClass: "malware-active", titleBg: "bg-naranja" }
  ],
  lastPlayerAction: null
};

const boardEl = document.getElementById("board");
const mensajeEl = document.getElementById("message");
const tiempoEl = document.getElementById("time");
const replayEl = document.getElementById("replay");
const notificationEl = document.getElementById("game-notification");

function dbg(event, data, level) {
  if (!DEBUG) return;
  const fn = level === "warn" ? console.warn : level === "error" ? console.error : console.log;
  if (data === undefined) fn(`[CW] ${event}`);
  else fn(`[CW] ${event}`, data);
}

function ShowNotification() {
  if (notificationEl) notificationEl.classList.add("active");
}

function HideNotification() {
  if (notificationEl) notificationEl.classList.remove("active");
}

function groupStart(name, data) {
  if (!DEBUG) return;
  console.groupCollapsed(`[CW] ${name}`);
  if (data !== undefined) console.log(data);
}

function groupEnd() {
  if (!DEBUG) return;
  console.groupEnd();
}

function EnDosFrames(fn) {
  requestAnimationFrame(() => requestAnimationFrame(fn));
}

function LimpiarBasuraDrag() {
  const sel = [
    ".sortable-fallback",
    ".cw-fallback",
    ".sortable-ghost",
    ".sortable-chosen",
    ".sortable-drag"
  ].join(",");

  document.querySelectorAll(sel).forEach(el => {
    const inside = boardEl && boardEl.contains(el);
    if (!inside) {
      try { el.remove(); } catch (e) { }
      return;
    }
    el.classList.remove("sortable-fallback", "cw-fallback", "sortable-ghost", "sortable-chosen", "sortable-drag");
  });

  document.querySelectorAll(".cw-swap-target").forEach(el => {
    el.classList.remove("cw-swap-target");
  });
  document.querySelectorAll(".cw-dragging-source").forEach(el => {
    el.classList.remove("cw-dragging-source");
  });
  document.querySelectorAll(".cw-swap-flash").forEach(el => {
    el.classList.remove("cw-swap-flash");
  });
  document.querySelectorAll(".cw-cancel").forEach(el => {
    el.classList.remove("cw-cancel");
  });

  document.body.classList.remove("sortable-dragging");
}

function CapturarRects() {
  const rects = {};
  boardEl.querySelectorAll('.col[data-tile-id]').forEach(el => {
    const id = String(el.dataset.tileId || "");
    if (!id) return;
    rects[id] = el.getBoundingClientRect();
  });
  return rects;
}

function AplicarFlip(prevRects) {
  if (!prevRects) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const movers = [];
  boardEl.querySelectorAll('.col[data-tile-id]').forEach(el => {
    const id = String(el.dataset.tileId || "");
    const prev = prevRects[id];
    if (!prev) return;
    const next = el.getBoundingClientRect();
    const dx = prev.left - next.left;
    const dy = prev.top - next.top;
    if (!dx && !dy) return;
    movers.push({ el, dx, dy });
  });

  if (!movers.length) return;

  movers.forEach(m => {
    m.el.style.transition = "transform 0s";
    m.el.style.willChange = "transform";
    m.el.style.transform = `translate(${m.dx}px, ${m.dy}px)`;
  });

  EnDosFrames(() => {
    movers.forEach(m => {
      m.el.style.transition = "transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1)";
      m.el.style.transform = "translate(0px, 0px)";
    });
    setTimeout(() => {
      movers.forEach(m => {
        m.el.style.transition = "";
        m.el.style.transform = "";
        m.el.style.willChange = "";
      });
    }, 320);
  });
}

function SwapArray(arr, i, j) {
  const a = arr.slice();
  const tmp = a[i];
  a[i] = a[j];
  a[j] = tmp;
  return a;
}

function CoordsFromSortableEvent(evt) {
  const e = evt && evt.originalEvent ? evt.originalEvent : null;
  if (!e) return null;
  const t = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : (e.touches && e.touches[0] ? e.touches[0] : e);
  if (!t || typeof t.clientX !== "number" || typeof t.clientY !== "number") return null;
  return { x: t.clientX, y: t.clientY };
}

function TargetIdDesdePunto(dragEl, coords) {
  if (!dragEl || !coords) return null;

  const prevDisplay = dragEl.style.display;
  const prevPointerEvents = dragEl.style.pointerEvents;

  dragEl.style.display = "none";
  dragEl.style.pointerEvents = "none";

  const el = document.elementFromPoint(coords.x, coords.y);

  dragEl.style.display = prevDisplay;
  dragEl.style.pointerEvents = prevPointerEvents;

  if (!el || !el.closest) return null;
  let col = el.closest('.col[data-tile-id]');

  if (col && col.dataset && col.dataset.tileId) {
    return String(col.dataset.tileId);
  }

  const allCards = boardEl.querySelectorAll('.col[data-tile-id]');
  let closest = null;
  let minDist = 100;

  allCards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dist = Math.sqrt(Math.pow(coords.x - centerX, 2) + Math.pow(coords.y - centerY, 2));

    if (dist < minDist) {
      minDist = dist;
      closest = card;
    }
  });

  if (closest && closest.dataset && closest.dataset.tileId) {
    return String(closest.dataset.tileId);
  }

  return null;
}

function TileElById(id) {
  const v = String(id || "");
  if (!v) return null;
  return boardEl.querySelector(`.col[data-tile-id="${v}"]`);
}

function ClearHoverTarget() {
  document.querySelectorAll(".cw-swap-target").forEach(el => {
    el.classList.remove("cw-swap-target");
  });
  estado.lastTargetId = null;
}

function SetHoverTarget(id) {
  const v = String(id || "");
  if (!v) {
    ClearHoverTarget();
    return;
  }
  if (estado.lastTargetId && String(estado.lastTargetId) === v) return;
  ClearHoverTarget();
  const el = TileElById(v);
  if (!el) return;
  el.classList.add("cw-swap-target");
  estado.lastTargetId = v;
}

function SetDraggingSource(id, on) {
  if (on) {
    document.querySelectorAll(".cw-dragging-source").forEach(el => {
      el.classList.remove("cw-dragging-source");
    });
    const el = TileElById(id);
    if (el) el.classList.add("cw-dragging-source");
  } else {
    document.querySelectorAll(".cw-dragging-source").forEach(el => {
      el.classList.remove("cw-dragging-source");
    });
  }
}

function FlashSwap(a, b) {
  const elA = TileElById(a);
  const elB = TileElById(b);
  [elA, elB].forEach(el => {
    if (!el) return;
    el.classList.add("cw-swap-flash");
  });
  setTimeout(() => {
    [elA, elB].forEach(el => {
      if (!el) return;
      el.classList.remove("cw-swap-flash");
    });
  }, 260);
}

function FlashCancel(id) {
  const el = TileElById(id);
  if (!el) return;
  el.classList.add("cw-cancel");
  setTimeout(() => {
    el.classList.remove("cw-cancel");
  }, 260);
}

function FormatearTiempo(seg) {
  const s = Math.max(0, parseInt(seg || 0, 10));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function NormalizarTexto(v) {
  return String(v || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\s+/g, " ");
}

function NormalizarClave(v) {
  return NormalizarTexto(v).replace(/[^a-z0-9]/g, "");
}

function TituloDesdeKey(key) {
  const map = {
    seguridad_internet: "SEGURIDAD EN INTERNET",
    contrasenas: "CONTRASEÑAS",
    dispositivos_datos: "DISPOSITIVOS Y DATOS",
    dispositivos: "DISPOSITIVOS",
    riesgos_basicos: "RIESGOS BÁSICOS",
    protecciones_basicas: "PROTECCIONES BÁSICAS",
    wifi_hogar: "WIFI EN CASA",
    malware: "MALWARE"
  };
  if (map[key]) return map[key];
  return String(key || "").replace(/_/g, " ").trim().toUpperCase();
}

function DetenerTimer() {
  if (estado.intervalo) {
    clearInterval(estado.intervalo);
    estado.intervalo = null;
  }
  if (estado.animationFrameId) {
    cancelAnimationFrame(estado.animationFrameId);
    estado.animationFrameId = null;
  }
}

function DetenerSync() {
  if (estado.syncIntervalo) {
    clearInterval(estado.syncIntervalo);
    estado.syncIntervalo = null;
  }
}

function ActualizarTiempo() {
  const displayTime = Math.ceil(estado.tiempoRestante);
  tiempoEl.textContent = FormatearTiempo(displayTime);

  const circle = document.querySelector(".progress-ring__circle");
  if (circle) {
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    circle.style.strokeDasharray = circumference;

    const totalDuration = estado.initialDuration || 60;
    const elapsed = totalDuration - estado.tiempoRestante;
    const offset = (elapsed / totalDuration) * circumference;
    circle.style.strokeDashoffset = offset;
  }

  const clockIcon = document.getElementById("clock-icon");
  if (clockIcon) {
    if (estado.juegoTerminado) {
      clockIcon.style.display = "none";
      clockIcon.style.visibility = "hidden";
      clockIcon.style.opacity = "0";
    } else {
      clockIcon.style.display = "inline";
      clockIcon.style.visibility = "visible";
      clockIcon.style.opacity = "1";
    }
  }
}

function IniciarTimer() {
  DetenerTimer();

  if (!estado.initialDuration) estado.initialDuration = estado.tiempoRestante;
  estado.timerStartTime = performance.now();
  estado.timerInitialTimeLeft = estado.tiempoRestante;

  function animate(timestamp) {
    if (estado.juegoTerminado) return;

    const elapsedMs = timestamp - estado.timerStartTime;
    const newTiempoRestante = Math.max(0, estado.timerInitialTimeLeft - elapsedMs / 1000);

    estado.tiempoRestante = newTiempoRestante;
    ActualizarTiempo();

    if (newTiempoRestante <= 0) {
      estado.tiempoRestante = 0;
      ActualizarTiempo();
      estado.juegoTerminado = true;
      mensajeEl.textContent = "Perdiste";
      ShowNotification();
      dbg("GAME_OVER_TIMER", { gid: estado.gid }, "warn");
      FinalizarJuego();
      Renderizar();
      return;
    }

    estado.animationFrameId = requestAnimationFrame(animate);
  }

  estado.animationFrameId = requestAnimationFrame(animate);
}

function IniciarSync() {
  DetenerSync();
  estado.syncIntervalo = setInterval(() => {
    if (estado.juegoTerminado) {
      DetenerSync();
      return;
    }
    EnviarAccion("tick", {}, true);
  }, 2000);
}

function ResetEstado() {
  DetenerTimer();
  DetenerSync();
  HideNotification();
  estado.gid = null;
  estado.board = [];
  estado.wordMap = {};
  estado.tilesSolved = {};
  estado.juegoTerminado = false;
  estado.envioGameOver = false;
  estado.tiempoRestante = 60;
  estado.cols = null;
  estado.rows = null;
  estado.sortables.forEach(s => { try { s.destroy(); } catch (e) { } });
  estado.sortables = [];
  estado.boardAntesDrag = [];
  estado.draggingId = null;
  estado.lastTargetId = null;
  estado.groups = [];
  estado.groupByTile = {};
  estado.groupTitle = {};
  estado.groupWordsNorm = {};
  estado.groupStyle = {};
  estado.solvedRowStyle = {};
  estado.solvedRowGroup = {};
  estado.lastPlayerAction = null;
  mensajeEl.textContent = "";
  replayEl.style.display = "none";
  const clockIcon = document.getElementById("clock-icon");
  if (clockIcon) clockIcon.style.display = "inline";
  boardEl.innerHTML = "";
}

function ParseDimsString(v) {
  if (typeof v !== "string") return null;
  const m = v.trim().match(/^(\d+)\s*x\s*(\d+)$/i);
  if (!m) return null;
  const c = parseInt(m[1], 10);
  const r = parseInt(m[2], 10);
  if (!Number.isFinite(c) || !Number.isFinite(r) || c <= 0 || r <= 0) return null;
  return { cols: c, rows: r };
}

function DetectarDims(data) {
  let cols = null;
  let rows = null;

  if (data && Number.isFinite(data.cols)) cols = parseInt(data.cols, 10);
  if (data && Number.isFinite(data.rows)) rows = parseInt(data.rows, 10);

  if ((!cols || !rows) && data) {
    const candidates = [data.dim, data.dims, data.dimension, data.dimensions, data.grid_size, data.board_size];
    for (let i = 0; i < candidates.length; i++) {
      const parsed = ParseDimsString(candidates[i]);
      if (parsed) {
        cols = cols || parsed.cols;
        rows = rows || parsed.rows;
        break;
      }
    }
  }

  if ((!cols || !rows) && data && Array.isArray(data.board)) {
    const n = data.board.length;
    const s = Math.sqrt(n);
    if (Number.isInteger(s)) {
      cols = cols || s;
      rows = rows || s;
    }
  }

  if (!cols || cols <= 0) cols = 4;
  if (!rows || rows <= 0) {
    const n = data && Array.isArray(data.board) ? data.board.length : 0;
    rows = n ? Math.ceil(n / cols) : cols;
  }

  return { cols, rows };
}

function MapearGruposDesdeRespuesta(data) {
  estado.groups = Array.isArray(data.groups) ? data.groups : [];
  estado.groupByTile = {};
  estado.groupTitle = {};
  estado.groupWordsNorm = {};

  if (!estado.groups.length) {
    dbg("GROUPS_EMPTY", {}, "warn");
    return;
  }

  const wordToKey = {};
  estado.groups.forEach(g => {
    const key = String(g.key || "");
    if (!key) return;
    const title = String(g.title || "") || TituloDesdeKey(key);
    estado.groupTitle[key] = title;
    const words = Array.isArray(g.words) ? g.words : [];
    const normWords = words.map(w => NormalizarClave(w)).filter(Boolean).sort();
    estado.groupWordsNorm[key] = normWords;
    normWords.forEach(w => { wordToKey[w] = key; });
  });

  const unmapped = [];
  Object.keys(estado.wordMap || {}).forEach(id => {
    const w = estado.wordMap[id];
    const nw = NormalizarClave(w);
    const key = wordToKey[nw] || "";
    if (key) estado.groupByTile[String(id)] = key;
    else unmapped.push({ id: String(id), word: w, norm: nw });
  });

  if (unmapped.length) {
    dbg("GROUPS_UNMAPPED_WORDS", { count: unmapped.length, sample: unmapped.slice(0, 8) }, "warn");
  }
}

function ElegirStyleRandom() {
  const usados = new Set(Object.values(estado.solvedRowStyle).map(s => s.rowClass));
  const disponibles = estado.paletteStyles.filter(s => !usados.has(s.rowClass));
  const pool = disponibles.length ? disponibles : estado.paletteStyles;
  return pool[Math.floor(Math.random() * pool.length)];
}

function StyleForGroupKey(groupKey) {
  const key = String(groupKey || "");
  if (!key) return ElegirStyleRandom();
  if (estado.groupStyle[key]) return estado.groupStyle[key];

  const usados = new Set(Object.values(estado.groupStyle).map(s => s.rowClass));
  const disponibles = estado.paletteStyles.filter(s => !usados.has(s.rowClass));
  const pool = disponibles.length ? disponibles : estado.paletteStyles;
  const style = pool[Object.keys(estado.groupStyle).length % pool.length];

  estado.groupStyle[key] = style;
  return style;
}

function AplicarEstiloFilaResuelta(rowIndex, groupKey) {
  estado.solvedRowStyle[rowIndex] = StyleForGroupKey(groupKey);
  estado.solvedRowGroup[rowIndex] = groupKey;
}

function RowWordsFor(ids) {
  return ids.map(id => estado.wordMap[String(id)] || "");
}

function RowKeysFor(ids) {
  return ids.map(id => estado.groupByTile[String(id)] || "");
}

function RowMatchesGroup(ids) {
  if (!ids) return null;
  if (!estado.cols || ids.length !== estado.cols) return null;

  const keys = ids.map(id => estado.groupByTile[String(id)] || "");
  const key0 = keys[0];
  if (!key0) return null;
  if (!keys.every(k => k === key0)) return null;

  const target = estado.groupWordsNorm[key0] || [];
  if (!estado.cols || target.length !== estado.cols) return null;

  const rowWords = ids.map(id => NormalizarClave(estado.wordMap[String(id)] || "")).filter(Boolean).sort();
  if (rowWords.length !== target.length) return null;

  for (let i = 0; i < target.length; i++) {
    if (target[i] !== rowWords[i]) return null;
  }
  return key0;
}

function RowIdsByIndex(r) {
  const start = r * estado.cols;
  return estado.board.slice(start, start + estado.cols).map(String);
}

function RowIndexByBoardPos(pos) {
  if (!Number.isFinite(pos) || pos < 0) return null;
  return Math.floor(pos / estado.cols);
}

function ChequearFilasImpactadasPorAccion() {
  const a = estado.lastPlayerAction;
  if (!a || a.type !== "swap") return;

  const impacted = new Set();
  const r1 = RowIndexByBoardPos(a.from);
  const r2 = RowIndexByBoardPos(a.to);
  if (r1 !== null) impacted.add(r1);
  if (r2 !== null) impacted.add(r2);

  impacted.forEach(r => {
    const rr = String(r);
    const ids = RowIdsByIndex(r);
    const words = RowWordsFor(ids);
    const keys = RowKeysFor(ids);

    if (estado.solvedRowGroup[rr]) {
      dbg("ROW_ALREADY_SOLVED", { row: r, group: estado.solvedRowGroup[rr], words });
      return;
    }

    const key = RowMatchesGroup(ids);
    if (key) {
      ids.forEach(id => { estado.tilesSolved[String(id)] = 1; });
      AplicarEstiloFilaResuelta(rr, key);
      dbg("ROW_SOLVED", { row: r, groupKey: key, title: estado.groupTitle[key] || TituloDesdeKey(key), words });
    } else {
      dbg("ROW_NOT_SOLVED", {
        row: r,
        words,
        keys,
        cols: estado.cols,
        idsLength: ids.length,
        groupByTile: ids.map(id => ({ id, key: estado.groupByTile[String(id)] }))
      });
    }
  });
}

function RecalcularFilasResueltas() {
  const rows = Math.max(1, estado.rows);
  const cols = Math.max(1, estado.cols);

  for (let r = 0; r < rows; r++) {
    const rr = String(r);
    const ids = RowIdsByIndex(r);
    if (ids.length !== cols) {
      delete estado.solvedRowGroup[rr];
      delete estado.solvedRowStyle[rr];
      continue;
    }

    const allSolved = ids.every(id => estado.tilesSolved[String(id)] === 1);
    if (!allSolved) {
      delete estado.solvedRowGroup[rr];
      delete estado.solvedRowStyle[rr];
      continue;
    }

    const key = RowMatchesGroup(ids);
    if (key) {
      AplicarEstiloFilaResuelta(rr, key);
      continue;
    }

    const keys = ids.map(id => estado.groupByTile[String(id)] || "");
    const k0 = keys[0] || "";
    const sameKey = k0 && keys.every(k => k === k0);
    if (sameKey) {
      AplicarEstiloFilaResuelta(rr, k0);
      continue;
    }

    delete estado.solvedRowGroup[rr];
    delete estado.solvedRowStyle[rr];
  }
}

function CrearEstructura() {
  boardEl.innerHTML = "";
  const rows = Math.max(1, estado.rows);

  for (let r = 0; r < rows; r++) {
    const titleRow = document.createElement("div");
    titleRow.className = "row justify-content-center cw-title-row";
    titleRow.dataset.rowIndex = String(r);
    titleRow.style.minHeight = "0px";
    titleRow.style.height = "0px";
    titleRow.style.marginBottom = "1rem";
    titleRow.style.overflow = "hidden";
    titleRow.style.transition = "all 0.3s ease";

    const titleCol = document.createElement("div");
    titleCol.className = "col-auto";

    const title = document.createElement("div");
    title.className = "title-words py-1 px-2 rounded-1";
    title.dataset.rowIndex = String(r);
    title.style.display = "none";
    title.textContent = "";

    titleCol.appendChild(title);
    titleRow.appendChild(titleCol);

    const row = document.createElement("div");
    row.className = "js-sortable row gy-3 justify-content-center";
    row.id = `fila-${r}`;
    row.dataset.rowIndex = String(r);

    if (estado.cols >= 1 && estado.cols <= 6) row.classList.add(`row-cols-${estado.cols}`);

    boardEl.appendChild(titleRow);
    boardEl.appendChild(row);
  }
}

function AplicarDecoracionFila(r) {
  const rowIndex = String(r);
  const fila = document.getElementById(`fila-${rowIndex}`);
  const titleRow = boardEl.querySelector(`.cw-title-row[data-row-index="${rowIndex}"]`);
  const title = boardEl.querySelector(`.title-words[data-row-index="${rowIndex}"]`);
  const key = estado.solvedRowGroup[rowIndex];
  const style = estado.solvedRowStyle[rowIndex];

  dbg("APLICAR_DECORACION", {
    row: r,
    filaExists: !!fila,
    titleExists: !!title,
    key,
    style,
    hasKeyAndStyle: !!(key && style)
  });

  if (!fila || !title) return;

  estado.paletteStyles.forEach(s => {
    fila.classList.remove(s.rowClass);
    title.classList.remove(s.titleBg);
  });

  if (key && style) {
    fila.classList.add(style.rowClass);
    if (titleRow) {
      titleRow.style.minHeight = "35px";
      titleRow.style.height = "auto";
      titleRow.style.marginBottom = "0.25rem";
    }
    title.style.display = "inline-block";
    title.classList.add(style.titleBg);
    title.textContent = estado.groupTitle[key] || TituloDesdeKey(key);
    fila.style.marginBottom = "0.5rem";

    dbg("DECORACION_APPLIED", {
      row: r,
      rowClass: style.rowClass,
      titleBg: style.titleBg,
      titleText: estado.groupTitle[key] || TituloDesdeKey(key)
    });
  } else {
    if (titleRow) {
      titleRow.style.minHeight = "0px";
      titleRow.style.height = "0px";
      titleRow.style.marginBottom = "1rem";
    }
    title.style.display = "none";
    title.textContent = "";
    fila.style.marginBottom = "";
  }
}

function Renderizar() {
  const prevRects = CapturarRects();
  CrearEstructura();

  const rows = Math.max(1, estado.rows);
  const cols = Math.max(1, estado.cols);

  for (let r = 0; r < rows; r++) {
    AplicarDecoracionFila(r);
    const fila = document.getElementById(`fila-${r}`);
    const start = r * cols;
    const slice = estado.board.slice(start, start + cols);

    slice.forEach(id => {
      const col = document.createElement("div");
      col.className = "col mb-3";
      col.dataset.tileId = String(id);

      const solved = estado.tilesSolved[String(id)] === 1;
      if (solved) col.classList.add("is-solved");

      const card = document.createElement("div");
      card.className = "card sortable-item";

      const body = document.createElement("div");
      body.className = "card-body text-center py-2 d-flex align-items-center justify-content-center";
      body.textContent = estado.wordMap[String(id)] || "";

      card.appendChild(body);
      col.appendChild(card);
      fila.appendChild(col);
    });
  }

  AplicarFlip(prevRects);

  const isDragging = document.body.classList.contains("sortable-dragging");
  if (!isDragging) {
    estado.sortables.forEach(s => {
      try {
        if (s && typeof s.destroy === 'function') {
          s.destroy();
        }
      } catch (e) { }
    });
    estado.sortables = [];
  }

  boardEl.querySelectorAll(".js-sortable").forEach(el => {
    const sortable = new Sortable(el, {
      group: { name: "shared", pull: true, put: true },
      sort: false,
      animation: 150,
      easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      draggable: ".col",
      filter: ".is-solved",
      preventOnFilter: true,
      chosenClass: "sortable-chosen",
      ghostClass: "sortable-ghost",
      dragClass: "sortable-drag",
      onStart: evt => {
        LimpiarBasuraDrag();
        ClearHoverTarget();

        document.body.classList.add("sortable-dragging");
        estado.boardAntesDrag = estado.board.slice();
        estado.draggingId = evt.item ? String(evt.item.dataset.tileId || "") : null;
        estado.lastTargetId = null;

        if (estado.draggingId) SetDraggingSource(estado.draggingId, true);
      },
      onMove: evt => {
        const dragId = estado.draggingId;
        if (!dragId) {
          ClearHoverTarget();
          return false;
        }

        const coords = CoordsFromSortableEvent(evt);
        if (!coords) {
          ClearHoverTarget();
          return false;
        }

        const targetId = TargetIdDesdePunto(evt.dragged, coords);

        if (!targetId) {
          ClearHoverTarget();
          return false;
        }

        if (estado.tilesSolved[String(targetId)] === 1) {
          ClearHoverTarget();
          return false;
        }

        SetHoverTarget(targetId);
        return false;
      },
      onEnd: evt => {
        document.body.classList.remove("sortable-dragging");

        if (estado.juegoTerminado) {
          LimpiarBasuraDrag();
          estado.draggingId = null;
          estado.lastTargetId = null;
          return;
        }

        const before = estado.boardAntesDrag.slice();
        const dragId = estado.draggingId;

        ClearHoverTarget();
        if (dragId) SetDraggingSource(dragId, false);

        estado.draggingId = null;
        estado.lastTargetId = null;

        LimpiarBasuraDrag();

        if (!dragId) {
          estado.board = before.slice();
          Renderizar();
          return;
        }

        const coords = CoordsFromSortableEvent(evt);
        const targetId = TargetIdDesdePunto(evt.item, coords);

        if (!targetId) {
          estado.board = before.slice();
          Renderizar();
          requestAnimationFrame(() => FlashCancel(dragId));
          return;
        }

        if (estado.tilesSolved[String(targetId)] === 1) {
          estado.board = before.slice();
          Renderizar();
          requestAnimationFrame(() => FlashCancel(dragId));
          return;
        }

        const fromIdx = before.findIndex(x => String(x) === String(dragId));
        const toIdx = before.findIndex(x => String(x) === String(targetId));

        if (fromIdx < 0 || toIdx < 0) {
          estado.board = before.slice();
          Renderizar();
          requestAnimationFrame(() => FlashCancel(dragId));
          return;
        }

        estado.lastPlayerAction = {
          type: "swap",
          from: fromIdx,
          to: toIdx,
          dragId: String(dragId),
          targetId: String(targetId),
          beforeBoard: before.slice()
        };

        estado.board = SwapArray(before, fromIdx, toIdx);
        ChequearFilasImpactadasPorAccion();
        Renderizar();

        requestAnimationFrame(() => FlashSwap(dragId, targetId));

        EnviarAccion("swap", { from: fromIdx, to: toIdx }, false);
      }
    });

    estado.sortables.push(sortable);
  });
}

function EnviarAccion(op, payload, silent) {
  if (!estado.gid) {
    dbg("API_NO_GID", { op, payload }, "warn");
    return;
  }

  const data = Object.assign({ gid: estado.gid, op }, payload || {});

   console.log("[CW] action.php payload =>", data);
  if (!silent) dbg("API_SEND", data);

  $.post("ajax/action.php", data, resp => {
    let parsed = resp;

    console.log(resp);
    if (typeof parsed === "string") {
      try { parsed = JSON.parse(parsed); } catch (e) { parsed = {}; }
    }

    if (!parsed || !parsed.success) {
      dbg("API_FAIL", { op, payload, resp: parsed }, "warn");
      if (op === "swap" && estado.lastPlayerAction && Array.isArray(estado.lastPlayerAction.beforeBoard)) {
        estado.board = estado.lastPlayerAction.beforeBoard.slice();
      }
      estado.lastPlayerAction = null;
      Renderizar();
      return;
    }

    if (!silent) dbg("API_OK", { op, message: parsed.message, status: parsed.status, time_left: parsed.time_left });

    AplicarRespuesta(parsed);
  }).fail((jq, text, e) => {
    dbg("API_HTTP_FAIL", { op, payload, text, e }, "error");
    if (op === "swap" && estado.lastPlayerAction && Array.isArray(estado.lastPlayerAction.beforeBoard)) {
      estado.board = estado.lastPlayerAction.beforeBoard.slice();
    }
    estado.lastPlayerAction = null;
    Renderizar();
  });
}

function AplicarRespuesta(resp) {
  if (Array.isArray(resp.board)) {
    estado.board = resp.board;
    if (estado.cols > 0) estado.rows = Math.max(1, Math.ceil(estado.board.length / estado.cols));
  }
  if (resp.word_map) estado.wordMap = resp.word_map;
  if (resp.tiles_solved) estado.tilesSolved = resp.tiles_solved;
  if (Array.isArray(resp.groups) && resp.groups.length) MapearGruposDesdeRespuesta(resp);

  if (typeof resp.time_left === "number") {
    estado.tiempoRestante = resp.time_left;
    estado.timerStartTime = performance.now();
    estado.timerInitialTimeLeft = estado.tiempoRestante;
    ActualizarTiempo();
  }

  if (resp.message != null) mensajeEl.textContent = String(resp.message);

  ChequearFilasImpactadasPorAccion();
  RecalcularFilasResueltas();

  if (resp.status === "won" || resp.status === "lost") {
    estado.juegoTerminado = true;

    if (!mensajeEl.textContent || !mensajeEl.textContent.trim()) {
      mensajeEl.textContent = resp.status === "won" ? "Ganaste" : "Perdiste";
    }

    ShowNotification();
    dbg("GAME_FINISHED_BY_SERVER", { status: resp.status }, "warn");
    FinalizarJuego(resp);
  }

  Renderizar();
  estado.lastPlayerAction = null;
}

function FinalizarJuego() {
  DetenerTimer();
  DetenerSync();

  ShowNotification();
  replayEl.style.display = "inline-block";
  replayEl.onclick = () => IniciarJuego();

  const clockIcon = document.getElementById("clock-icon");
  if (clockIcon) {
    clockIcon.style.display = "none";
    clockIcon.style.visibility = "hidden";
    clockIcon.style.opacity = "0";
  }

  if (estado.envioGameOver || !estado.gid) return;

  estado.envioGameOver = true;
  dbg("API_SEND_GAME_OVER", { gid: estado.gid });

  $.post("ajax/game-over.php", { gid: estado.gid }, () => {
    dbg("GAME_OVER_SENT_OK", { gid: estado.gid });
  }).fail((jq, text, e) => {
    dbg("GAME_OVER_SENT_FAIL", { text, e }, "error");
  });
}

function IniciarJuego() {
  ResetEstado();
  dbg("GAME_START_SEND", { cfg_key: "connect_words" });

  $.post("ajax/game-start.php", { cfg_key: "connect_words" }, data => {
    let parsed = data;
    if (typeof parsed === "string") {
      try { parsed = JSON.parse(parsed); } catch (e) { parsed = {}; }
    }
    
    console.log (parsed);

    if (!parsed || !parsed.success) {
      mensajeEl.textContent = (parsed && parsed.error) ? parsed.error : "No hay configuración activa";
      ShowNotification();
      dbg("GAME_START_FAIL", { error: parsed && parsed.error }, "error");
      return;
    }

    const dims = DetectarDims(parsed);
    estado.cols = dims.cols;
    estado.rows = dims.rows;

    estado.gid = parsed.gid;
    estado.board = Array.isArray(parsed.board) ? parsed.board : [];
    estado.rows = Math.max(1, Math.ceil(estado.board.length / estado.cols));
    estado.wordMap = parsed.word_map || {};
    estado.tilesSolved = parsed.tiles_solved || {};
    estado.tiempoRestante = parsed.time_left || parsed.duration || 60;

    MapearGruposDesdeRespuesta(parsed);
    RecalcularFilasResueltas();

    ActualizarTiempo();
    Renderizar();

    dbg("GAME_START_OK", {
      gid: estado.gid,
      cols: estado.cols,
      rows: estado.rows,
      boardLen: estado.board.length,
      wordsCount: Object.keys(estado.wordMap || {}).length,
      groupsCount: Array.isArray(parsed.groups) ? parsed.groups.length : 0,
      status: parsed.status
    });

    if (parsed.status === "won" || parsed.status === "lost") {
      estado.juegoTerminado = true;
      if (!mensajeEl.textContent || !mensajeEl.textContent.trim()) {
        mensajeEl.textContent = parsed.status === "won" ? "Ganaste" : "Perdiste";
      }
      ShowNotification();
      dbg("GAME_ALREADY_FINISHED_ON_LOAD", { status: parsed.status }, "warn");
      FinalizarJuego(parsed);
    } else {
      estado.initialDuration = parsed.duration || estado.tiempoRestante || 60;
      IniciarTimer();
      IniciarSync();
    }
  }).fail((jq, text, e) => {
    dbg("GAME_START_HTTP_FAIL", { text, e }, "error");
    mensajeEl.textContent = "Error iniciando el juego";
    ShowNotification();
  });
}

IniciarJuego();
