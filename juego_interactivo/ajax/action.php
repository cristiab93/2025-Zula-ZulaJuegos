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

function GuardarResultado($s, $gid, $outcome, $finishSecond, $points)
{
  $ins = InsertQuery("player_results");
  $ins->Value("res_game_config_id", "i", (int)$s["cfg_id"]);
  $ins->Value("res_player_id", "i", 0); // No hay sistema de usuarios por ahora
  $ins->Value("res_game_id", "s", $gid);
  $ins->Value("res_outcome", "s", $outcome);
  $ins->Value("res_points", "i", $points);
  $ins->Value("res_finish_second", "i", $finishSecond);
  return $ins->Run();
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

if ($op === "submit_all_answers") {
  $userAnswers = json_decode(ObtenerParam("answers", "{}"), true);
  if (!$userAnswers) {
    $resp = ["success" => 0, "error" => "INVALID_ANSWERS_FORMAT"];
    goto RESPOND;
  }

  $details = [];
  $totalScore = 0;
  $correctCount = 0;
  $totalQuestions = 0;

  foreach ($s["instances"] as $idx => $inst) {
    if ($inst["type"] !== "question") continue;

    $totalQuestions++;
    $selected = isset($userAnswers[$idx]) ? (int)$userAnswers[$idx] : -1;
    $correctIndex = (int)$inst["correct"];
    $isCorrect = ($selected === $correctIndex);
    $points = $isCorrect ? (int)($inst["points"] ?? 10) : 0;
    $explanation = $inst["explanation"] ?? "";

    if ($isCorrect) {
      $correctCount++;
      $totalScore += $points;
    }

    $details[$idx] = [
      "index" => (int)$idx,
      "selected" => $selected,
      "correctIndex" => $correctIndex,
      "isCorrect" => $isCorrect,
      "points" => $points,
      "explanation" => $explanation
    ];
  }

  // Guardar el detalle en sesión
  $s["user_answers_detail"] = $details;
  $s["total_score"] = $totalScore;
  $s["correct_count"] = $correctCount;
  $s["total_questions"] = $totalQuestions;
  $s["ended"] = 1; // Marcar como finalizado

  // Guardar resultado en DB final una sola vez
  $timeLeft = TiempoRestante($s);
  $elapsed = (int)$s["duration"] - $timeLeft;
  if ($elapsed < 0) $elapsed = 0;
  
  GuardarResultado($s, $gid, "finished", $elapsed, $totalScore);

  $resp = [
    "success" => 1,
    "totalScore" => $totalScore,
    "correctCount" => $correctCount,
    "totalQuestions" => $totalQuestions,
    "details" => $details
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
