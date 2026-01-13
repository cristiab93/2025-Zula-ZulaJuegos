<?php
include "../_general.php";
header("Content-Type: application/json; charset=utf-8");

function CargarConfigsActivas($cfg_key)
{
  $sel = SelectQuery("game_configs");
  $sel->Condition("cfg_key =", "s", $cfg_key);
  $sel->Condition("cfg_active =", "i", 1);
  $sel->Order("cfg_id", "DESC");
  $sel->NoSpecialChars();
  return $sel->SetIndex(-1)->Limit(1)->Run();
}

function ObtenerParam($k, $d = "")
{
  return isset($_POST[$k]) ? trim($_POST[$k]) : $d;
}

function LimpiarPartida()
{
  unset($_SESSION["rosco"], $_SESSION["rosco_current_gid"]);
}

function ArmarPartidaNueva($config, $cfg_key)
{
  $duration = (int)$config["cfg_duration"];
  $content = json_decode($config["cfg_content"], true);
  if (!$content || !isset($content["items"]) || !is_array($content["items"])) return null;
  
  $items = $content["items"];
  if (count($items) < 1) return null;

  $gid = bin2hex(random_bytes(16));
  $_SESSION["rosco"] = [];
  $_SESSION["rosco"][$gid] = [
    "cfg_key" => $cfg_key,
    "cfg_id" => (int)$config["cfg_id"],
    "duration" => $duration,
    "start_ts" => time(),
    "items" => $items,
    "current_index" => 0,
    "status" => "playing",
    "answers_status" => [], // index => 'success' | 'error'
    "skipped" => [], // indices to revisit
    "ended" => 0
  ];
  $_SESSION["rosco_current_gid"] = $gid;

  // Clean items for front (exclude answers)
  $frontItems = array_map(function($it) {
      return [
          "letter" => $it["letter"],
          "type" => $it["type"], // 'starts' | 'contains'
          "definition" => $it["definition"]
      ];
  }, $items);

  return [
    "success" => 1,
    "gid" => $gid,
    "duration" => $duration,
    "time_left" => $duration,
    "items" => $frontItems,
    "status" => "playing"
  ];
}

$cfg_key = ObtenerParam("cfg_key", "rosco");
LimpiarPartida();

$configs = CargarConfigsActivas($cfg_key);
if (!count($configs)) {
  echo json_encode(["success" => 0, "error" => "NO_CONFIGS"]);
  exit;
}

$res = ArmarPartidaNueva($configs[0], $cfg_key);
if (!$res) {
  echo json_encode(["success" => 0, "error" => "BAD_CFG_CONTENT"]);
  exit;
}

echo json_encode($res, JSON_UNESCAPED_UNICODE);
exit;
