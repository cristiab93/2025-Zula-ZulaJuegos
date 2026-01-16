<?php
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

function ObtenerParam($k, $d = "")
{
  return isset($_POST[$k]) ? trim($_POST[$k]) : $d;
}

function LimpiarPartida()
{
  unset($_SESSION["ruleta"], $_SESSION["ruleta_current_gid"]);
}

function LimpiarInstanciasParaFront($instances)
{
  return array_map(function($inst) {
    unset($inst["answer"], $inst["explanation"]);
    return $inst;
  }, $instances);
}

function ArmarPartidaNueva($config, $cfg_key)
{
  $duration = (int)$config["cfg_duration"];
  $content = json_decode($config["cfg_content"], true);
  if (!$content || !isset($content["instances"]) || !is_array($content["instances"])) return null;
  
  $all_instances = $content["instances"];
  if (count($all_instances) < 8) return null; // We need at least 8 for the roulette

  // Take exactly 8 for the roulette UI
  $roulette_instances = array_slice($all_instances, 0, 8);

  $gid = bin2hex(random_bytes(16));
  $_SESSION["ruleta"] = [];
  $_SESSION["ruleta"][$gid] = [
    "cfg_key" => $cfg_key,
    "cfg_id" => (int)$config["cfg_id"],
    "duration" => $duration,
    "start_ts" => time(),
    "instances" => $roulette_instances,
    "rounds_to_play" => 4,
    "current_round" => 0,
    "played_indices" => [],
    "score" => 0,
    "ended" => 0,
    "user_answers" => [] 
  ];
  $_SESSION["ruleta_current_gid"] = $gid;

  return [
    "success" => 1,
    "gid" => $gid,
    "duration" => $duration,
    "time_left" => $duration,
    "instances" => LimpiarInstanciasParaFront($roulette_instances),
    "rounds_to_play" => 4,
    "status" => "playing"
  ];
}

$cfg_key = ObtenerParam("cfg_key", "ruleta");
LimpiarPartida();

$configs = CargarConfigsActivas($cfg_key);
if (!count($configs)) {
  echo json_encode(["success" => 0, "error" => "NO_CONFIGS"]);
  exit;
}

$config = $configs[0];
$res = ArmarPartidaNueva($config, $cfg_key);
if (!$res) {
  echo json_encode(["success" => 0, "error" => "BAD_CFG_CONTENT"]);
  exit;
}

echo json_encode($res, JSON_UNESCAPED_UNICODE);
exit;
