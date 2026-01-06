<?php
/* =========================
   PARTE 1: DB / Conexión / Queries
   ========================= */
include "../_general.php";
header("Content-Type: application/json; charset=utf-8");

/* =========================
   PARTE 2: Lógica del endpoint (PHP puro)
   ========================= */
$resp = null;

function ObtenerParam($k, $d = "")
{
  return isset($_POST[$k]) ? trim($_POST[$k]) : $d;
}

function ValidarGid()
{
  if (!isset($_POST["gid"])) return null;
  $gid = trim($_POST["gid"]);
  if ($gid === "") return null;
  if (!isset($_SESSION["trivia"]) || !isset($_SESSION["trivia"][$gid])) return null;
  return $gid;
}

function TiempoRestante($s)
{
  $now = time();
  $duration = (int)$s["duration"];
  $elapsed = $now - (int)$s["start_ts"];
  if ($elapsed < 0) $elapsed = 0;
  if ($elapsed > $duration) $elapsed = $duration;
  $restante = $duration - $elapsed;
  if ($restante < 0) $restante = 0;
  return $restante;
}

$gid = ValidarGid();
if (!$gid) {
  $resp = ["success" => 0, "error" => "BAD_GID"];
  goto RESPOND;
}

$s =& $_SESSION["trivia"][$gid];
$op = ObtenerParam("op", "");

// 1. Si el juego ya terminó, no permitimos más acciones
if ((int)($s["ended"] ?? 0) === 1) {
    $resp = ["success" => 0, "error" => "GAME_ALREADY_ENDED"];
    goto RESPOND;
}

if ($op === "check_answer") {
  $index = (int)ObtenerParam("index", "-1");
  $selected = (int)ObtenerParam("selected", "-1");

  if ($index < 0 || !isset($s["instances"][$index])) {
    $resp = ["success" => 0, "error" => "INVALID_INDEX"];
    goto RESPOND;
  }

  // 3. Protección contra Re-Envío (Double-answer protection)
  if (isset($s["user_answers"][$index])) {
    $resp = ["success" => 0, "error" => "QUESTION_ALREADY_ANSWERED"];
    goto RESPOND;
  }

  $inst = $s["instances"][$index];
  if ($inst["type"] !== "question") {
    $resp = ["success" => 0, "error" => "NOT_A_QUESTION"];
    goto RESPOND;
  }

  $correctIndex = (int)$inst["correct"];
  $isCorrect = ($selected === $correctIndex);
  $points = $isCorrect ? (int)($inst["points"] ?? 10) : 0;
  $explanation = $inst["explanation"] ?? "";

  // Guardar en sesión para el conteo final seguro
  if (!isset($s["user_answers"])) {
    $s["user_answers"] = [];
  }
  $s["user_answers"][$index] = [
    "selected" => $selected,
    "points" => $points,
    "isCorrect" => $isCorrect
  ];

  $resp = [
    "success" => 1,
    "isCorrect" => $isCorrect,
    "correctIndex" => $correctIndex,
    "points" => $points,
    "explanation" => $explanation
  ];
  goto RESPOND;
}

$resp = ["success" => 0, "error" => "BAD_OP"];

/* =========================
   PARTE 3: Respuesta JSON
   ========================= */
RESPOND:
echo json_encode($resp, JSON_UNESCAPED_UNICODE);
exit;
