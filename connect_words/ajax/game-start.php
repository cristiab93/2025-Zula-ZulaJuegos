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
  $sel->Order("cfg_id", "DESC");
  $sel->NoSpecialChars();
  return $sel->SetIndex(-1)->Limit(500)->Run();
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
  unset($_SESSION["connect_words"], $_SESSION["connect_words_current_gid"]);
}

function ElegirConfigRandom($rows)
{
  if (!is_array($rows) || !count($rows)) return null;
  return $rows[array_rand($rows)];
}

function ArmarPartidaNueva($config, $cfg_key)
{
  $duration = (int)$config["cfg_duration"];
  $puzzle = json_decode($config["cfg_content"], true);
  if (!$puzzle || !isset($puzzle["groups"]) || !is_array($puzzle["groups"])) return null;
  $groups = $puzzle["groups"];

  if (count($groups) < 1) return null;

  $numGroups = count($groups);
  $wordsPerGroup = null;

  foreach ($groups as $g) {
    if (!isset($g["key"]) || !isset($g["words"]) || !is_array($g["words"])) return null;
    $count = count($g["words"]);
    if ($count < 1) return null;
    if ($wordsPerGroup === null) {
      $wordsPerGroup = $count;
    } else if ($wordsPerGroup !== $count) {
      return null;
    }
  }

  if ($numGroups !== $wordsPerGroup) return null;

  $gridSize = $numGroups;
  $totalWords = $gridSize * $gridSize;

  $word_map = [];
  $group_map = [];
  $board = [];
  $idc = 1;

  foreach ($groups as $g) {
    $gk = (string)$g["key"];
    foreach ($g["words"] as $w) {
      $id = (string)$idc++;
      $word_map[$id] = (string)$w;
      $group_map[$id] = $gk;
      $board[] = $id;
    }
  }

  if (count($board) !== $totalWords) return null;

  $groupWords = [];
  foreach ($groups as $gIndex => $g) {
    $gk = (string)$g["key"];
    $groupWords[$gIndex] = [];
    foreach ($board as $id) {
      if ($group_map[$id] === $gk) {
        $groupWords[$gIndex][] = $id;
      }
    }
  }

  $newBoard = [];
  for ($row = 0; $row < $gridSize; $row++) {
    $rowWords = [];
    foreach ($groupWords as $words) {
      if (isset($words[$row])) {
        $rowWords[] = $words[$row];
      }
    }
    shuffle($rowWords);
    $newBoard = array_merge($newBoard, $rowWords);
  }

  $board = $newBoard;

  $gid = bin2hex(random_bytes(16));
  $_SESSION["connect_words"] = [];
  $_SESSION["connect_words"][$gid] = [
    "cfg_key" => $cfg_key,
    "cfg_id" => (int)$config["cfg_id"],
    "duration" => $duration,
    "start_ts" => time(),
    "board" => $board,
    "word_map" => $word_map,
    "group_map" => $group_map,
    "solved_groups" => [],
    "ended" => 0,
    "cols" => $gridSize,
    "rows" => $gridSize
  ];
  $_SESSION["connect_words_current_gid"] = $gid;

  $tiles_solved = [];
  foreach ($board as $id) { $tiles_solved[$id] = 0; }

  return [
    "success" => 1,
    "gid" => $gid,
    "duration" => $duration,
    "time_left" => $duration,
    "word_map" => $word_map,
    "board" => $board,
    "tiles_solved" => $tiles_solved,
    "groups" => $groups,
    "cols" => $gridSize,
    "rows" => $gridSize,
    "status" => "playing",
    "message" => ""
  ];
}

$cfg_key = ObtenerParam("cfg_key", "connect_words");
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
