<?php
/* =========================
   PARTE 1: DB / Conexión / Queries
   ========================= */
include "../_general.php";
header("Content-Type: application/json; charset=utf-8");

function CargarConfigsActivas($cfg_key)
{
  $sel = SelectQuery("game_configs");
  $sel->Condition("cfg_key =", "s", $cfg_key);
  $sel->Condition("cfg_active =", "i", 1);
  $sel->Order("RAND()", "");
  $sel->NoSpecialChars();
  return $sel->SetIndex(-1)->Limit(1)->Run();
}

/* =========================
   PARTE 2: Lógica del endpoint (PHP puro)
   ========================= */
$resp = null;

function ObtenerParam($k, $d = "")
{
  return isset($_POST[$k]) ? trim($_POST[$k]) : $d;
}

function LimpiarPartida()
{
  unset($_SESSION["trivia"], $_SESSION["trivia_current_gid"]);
}

function ElegirConfigRandom($rows)
{
  if (!is_array($rows) || !count($rows)) return null;
  return $rows[array_rand($rows)];
}

function LimpiarInstanciasParaFront($instances)
{
  return array_map(function($inst) {
    if ($inst["type"] === "question") {
      unset($inst["correct"], $inst["explanation"]);
    }
    return $inst;
  }, $instances);
}

function ArmarPartidaNueva($config, $cfg_key)
{
  $duration = (int)$config["cfg_duration"];
  $content = json_decode($config["cfg_content"], true);
  if (!$content || !isset($content["instances"]) || !is_array($content["instances"])) return null;
  
  $instances = $content["instances"];
  if (count($instances) < 1) return null;

  $gid = bin2hex(random_bytes(16));
  $_SESSION["trivia"] = [];
  $_SESSION["trivia"][$gid] = [
    "cfg_key" => $cfg_key,
    "cfg_id" => (int)$config["cfg_id"],
    "duration" => $duration,
    "start_ts" => time(),
    "instances" => $instances,
    "current_index" => 0,
    "ended" => 0
  ];
  $_SESSION["trivia_current_gid"] = $gid;

  return [
    "success" => 1,
    "gid" => $gid,
    "duration" => $duration,
    "time_left" => $duration,
    "instances" => LimpiarInstanciasParaFront($instances),
    "status" => "playing",
    "message" => ""
  ];
}

$cfg_key = ObtenerParam("cfg_key", "juego_interactivo");
LimpiarPartida();

$configs = CargarConfigsActivas($cfg_key);
if (!count($configs)) {
  $resp = ["success" => 0, "error" => "NO_CONFIGS"];
  goto RESPOND;
}

$config = ElegirConfigRandom($configs);
if (!$config) {
  $resp = ["success" => 0, "error" => "RANDOM_FAIL"];
  goto RESPOND;
}

$res = ArmarPartidaNueva($config, $cfg_key);
if (!$res) {
  $resp = ["success" => 0, "error" => "BAD_CFG_CONTENT"];
  goto RESPOND;
}

$resp = $res;


/* =========================
   PARTE 3: Respuesta JSON
   ========================= */
RESPOND:
echo json_encode($resp, JSON_UNESCAPED_UNICODE);
exit;
