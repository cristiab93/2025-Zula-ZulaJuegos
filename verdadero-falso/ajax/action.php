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
  if (!isset($_SESSION["verdadero_falso"]) || !isset($_SESSION["verdadero_falso"][$gid])) return null;
  return $gid;
}

$gid = ValidarGid();
if (!$gid) {
  $resp = ["success" => 0, "error" => "BAD_GID"];
  goto RESPOND;
}

$s =& $_SESSION["verdadero_falso"][$gid];
$op = ObtenerParam("op", "");

// 1. Si el juego ya terminó, no permitimos más acciones
if ((int)($s["ended"] ?? 0) === 1) {
    $resp = ["success" => 0, "error" => "GAME_ALREADY_ENDED"];
    goto RESPOND;
}

if ($op === "check_answer") {
  $index = (int)ObtenerParam("index", "-1");
  // Esperamos "1" para Verdadero, "0" para Falso.
  // Pero ojo, JS envía strings.
  $val = ObtenerParam("selected", "");
  
  if ($index < 0 || !isset($s["instances"][$index])) {
    $resp = ["success" => 0, "error" => "INVALID_INDEX"];
    goto RESPOND;
  }

  // 3. Protección contra Re-Envío
  if (isset($s["user_answers"][$index])) {
    $resp = ["success" => 0, "error" => "QUESTION_ALREADY_ANSWERED"];
    goto RESPOND;
  }

  $inst = $s["instances"][$index];
  
  // Validar respuesta
  // La configuración debe tener "answer": true/false (booleano) o 1/0
  $correctAnswer = (bool)$inst["answer"]; 
  $userSelected = ($val === "true" || $val === "1");

  $isCorrect = ($userSelected === $correctAnswer);
  $points = $isCorrect ? (int)($inst["points"] ?? 10) : 0;
  $explanation = $inst["explanation"] ?? "";

  // Guardar en sesión
  if (!isset($s["user_answers"])) {
    $s["user_answers"] = [];
  }
  $s["user_answers"][$index] = [
    "selected" => $userSelected,
    "points" => $points,
    "isCorrect" => $isCorrect
  ];
  
  // Actualizar score total en sesión
  if (!isset($s["score"])) $s["score"] = 0;
  $s["score"] += $points;

  $resp = [
    "success" => 1,
    "isCorrect" => $isCorrect,
    "points" => $points,
    "explanation" => $explanation, // Devolvemos explanation aquí si queremos mostrarla
    "totalScore" => $s["score"]
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
