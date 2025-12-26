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
  if (!isset($_SESSION["connect_words"]) || !isset($_SESSION["connect_words"][$gid])) return null;
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

function TilesResueltas($s)
{
  $gm = $s["group_map"];
  $solvedSet = [];
  foreach ($s["solved_groups"] as $gk) $solvedSet[$gk] = 1;

  $tiles = [];
  foreach ($s["board"] as $id) {
    $gk = isset($gm[$id]) ? $gm[$id] : "";
    $tiles[$id] = isset($solvedSet[$gk]) ? 1 : 0;
  }
  return $tiles;
}

function ResolverFilas(&$s)
{
  $gm = $s["group_map"];
  $nuevos = [];

  $cols = isset($s["cols"]) ? (int)$s["cols"] : 4;
  $rows = isset($s["rows"]) ? (int)$s["rows"] : 4;

  for ($fila = 0; $fila < $rows; $fila++) {
    $ini = $fila * $cols;
    $ids = array_slice($s["board"], $ini, $cols);
    if (count($ids) !== $cols) continue;

    $g0 = isset($gm[$ids[0]]) ? $gm[$ids[0]] : "";
    if ($g0 === "") continue;

    $ok = true;
    for ($i = 1; $i < $cols; $i++) {
      $gx = isset($gm[$ids[$i]]) ? $gm[$ids[$i]] : "";
      if ($gx !== $g0) { $ok = false; break; }
    }

    if ($ok && !in_array($g0, $s["solved_groups"], true)) {
      $s["solved_groups"][] = $g0;
      foreach ($ids as $tid) $nuevos[] = $tid;
    }
  }

  return $nuevos;
}

function AplicarSwap(&$s, $from, $to)
{
  if (!isset($s["board"][$from]) || !isset($s["board"][$to])) return [];

  $idFrom = $s["board"][$from];
  $idTo = $s["board"][$to];

  $solvedSet = [];
  foreach ($s["solved_groups"] as $gk) $solvedSet[$gk] = 1;

  $gm = $s["group_map"];
  $gFrom = isset($gm[$idFrom]) ? $gm[$idFrom] : "";
  $gTo = isset($gm[$idTo]) ? $gm[$idTo] : "";

  if (isset($solvedSet[$gFrom]) || isset($solvedSet[$gTo])) return [];

  $tmp = $s["board"][$from];
  $s["board"][$from] = $s["board"][$to];
  $s["board"][$to] = $tmp;

  return ResolverFilas($s);
}

$gid = ValidarGid();
if (!$gid) {
  $resp = ["success" => 0, "error" => "BAD_GID"];
  goto RESPOND;
}

$s =& $_SESSION["connect_words"][$gid];
$op = ObtenerParam("op", "");

$tl = TiempoRestante($s);
if ((int)$s["ended"] === 1 || $tl <= 0) {
  $s["ended"] = 1;
  $resp = [
    "success" => 1,
    "status" => "lost",
    "message" => "Perdiste",
    "time_left" => 0,
    "board" => $s["board"],
    "tiles_solved" => TilesResueltas($s),
    "new_solved_ids" => []
  ];
  goto RESPOND;
}

if ($op === "tick") {
  $resp = [
    "success" => 1,
    "status" => "playing",
    "message" => "",
    "time_left" => $tl,
    "board" => $s["board"],
    "tiles_solved" => TilesResueltas($s),
    "new_solved_ids" => []
  ];
  goto RESPOND;
}

if ($op === "swap") {
  $from = (int)ObtenerParam("from", "-1");
  $to = (int)ObtenerParam("to", "-1");

  $cols = isset($s["cols"]) ? (int)$s["cols"] : 4;
  $rows = isset($s["rows"]) ? (int)$s["rows"] : 4;
  $maxIndex = ($cols * $rows) - 1;

  if ($from < 0 || $from > $maxIndex || $to < 0 || $to > $maxIndex) {
    $resp = ["success" => 0, "error" => "BAD_INDEX"];
    goto RESPOND;
  }

  $nuevos = AplicarSwap($s, $from, $to);
  $status = "playing";
  $message = "";

  $expectedGroups = $cols;

  if (count($s["solved_groups"]) === $expectedGroups) {
    $s["ended"] = 1;
    $status = "won";
    $message = "Ganaste!";
  } elseif (count($nuevos) > 0) {
    $message = "Bien!";
  }

  $resp = [
    "success" => 1,
    "status" => $status,
    "message" => $message,
    "time_left" => TiempoRestante($s),
    "board" => $s["board"],
    "tiles_solved" => TilesResueltas($s),
    "new_solved_ids" => $nuevos
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
