<?php
/* =========================
   PARTE 1: DB / Conexión / Queries
   ========================= */
include "../_general.php";
header("Content-Type: application/json; charset=utf-8");

function GuardarResultado($s, $gid, $outcome, $finishSecond, $points)
{
  $ins = InsertQuery("player_results");
  $ins->Value("res_game_config_id", "i", (int)$s["cfg_id"]);
  $ins->Value("res_player_id", "i", 0);
  $ins->Value("res_game_id", "s", $gid);
  $ins->Value("res_outcome", "s", $outcome);
  $ins->Value("res_points", "i", $points);
  $ins->Value("res_finish_second", "i", $finishSecond);
  return $ins->Run();
}

/* =========================
   PARTE 2: Lógica del endpoint (PHP puro)
   ========================= */
$resp = null;

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

function ValidarGid()
{
  if (!isset($_POST["gid"])) return null;
  $gid = trim($_POST["gid"]);
  if ($gid === "") return null;
  if (!isset($_SESSION["trivia"]) || !isset($_SESSION["trivia"][$gid])) return null;
  return $gid;
}

$gid = ValidarGid();
if (!$gid) {
  $resp = ["success" => 0, "error" => "BAD_GID"];
  goto RESPOND;
}

$s =& $_SESSION["trivia"][$gid];

$timeLeft = TiempoRestante($s);
$elapsed = (int)$s["duration"] - $timeLeft;
if ($elapsed < 0) $elapsed = 0;

// Calcular puntos desde la sesión para mayor seguridad
$points = 0;
if (isset($s["user_answers"]) && is_array($s["user_answers"])) {
  foreach ($s["user_answers"] as $ans) {
    if (isset($ans["points"])) $points += (int)$ans["points"];
  }
}

// Si el juego ya terminó, no guardamos de nuevo, solo devolvemos el estado
if (isset($s["ended"]) && (int)$s["ended"] === 1) {
  $resp = [
    "success" => 1,
    "status" => "already_finished",
    "points" => $points,
    "finish_second" => $elapsed
  ];
  goto RESPOND;
}

$outcome = "finished";
$s["ended"] = 1;

GuardarResultado($s, $gid, $outcome, $elapsed, $points);

$resp = [
  "success" => 1,
  "status" => $outcome,
  "points" => $points,
  "finish_second" => $elapsed
];


/* =========================
   PARTE 3: Respuesta JSON
   ========================= */
RESPOND:
echo json_encode($resp, JSON_UNESCAPED_UNICODE);
exit;
