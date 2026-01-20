<?php
include "../_general.php";
header("Content-Type: application/json; charset=utf-8");

function ObtenerParam($k, $d = "")
{
  return isset($_POST[$k]) ? trim($_POST[$k]) : $d;
}

function ValidarGid()
{
  if (!isset($_POST["gid"])) return null;
  $gid = trim($_POST["gid"]);
  if ($gid === "") return null;
  if (!isset($_SESSION["ruleta"]) || !isset($_SESSION["ruleta"][$gid])) return null;
  return $gid;
}

$gid = ValidarGid();
if (!$gid) {
  echo json_encode(["success" => 0, "error" => "BAD_GID"]);
  exit;
}

$s =& $_SESSION["ruleta"][$gid];
$op = ObtenerParam("op", "");

if ((int)$s["ended"] === 1) {
  echo json_encode(["success" => 0, "error" => "GAME_ALREADY_ENDED"]);
  exit;
}

if ($op === "spin") {
  if ((int)$s["current_round"] >= (int)$s["rounds_to_play"]) {
    $s["ended"] = 1;
    echo json_encode(["success" => 0, "error" => "NO_MORE_ROUNDS"]);
    exit;
  }

  if (isset($s["current_spinning_index"])) {
    $idx = (int)$s["current_spinning_index"];
    if ($idx >= 0 && $idx < 8 && !isset($s["user_answers"][$idx])) {
      echo json_encode(["success" => 1, "chosen_index" => $idx]);
      exit;
    }
  }

  $played = isset($s["played_indices"]) && is_array($s["played_indices"]) ? $s["played_indices"] : [];
  $answered = isset($s["user_answers"]) && is_array($s["user_answers"]) ? array_keys($s["user_answers"]) : [];

  $blocked = array_unique(array_merge($played, array_map('intval', $answered)));

  $available = [];
  for ($i = 0; $i < 8; $i++) {
    if (!in_array($i, $blocked, true)) $available[] = $i;
  }

  if (empty($available)) {
    $available = [];
    for ($i = 0; $i < 8; $i++) {
      if (!in_array($i, $answered, true)) $available[] = $i;
    }
  }

  if (empty($available)) {
    echo json_encode(["success" => 0, "error" => "NO_AVAILABLE_INDEX"]);
    exit;
  }

  $chosenIndex = $available[array_rand($available)];
  $s["current_spinning_index"] = $chosenIndex;

  echo json_encode(["success" => 1, "chosen_index" => $chosenIndex]);
  exit;
}

if ($op === "check_answer") {
  $index = (int)ObtenerParam("index", "-1");
  $selectedOptionIndex = (int)ObtenerParam("selected", "-1");

  if ($index < 0 || $index > 7 || !isset($s["instances"][$index])) {
    echo json_encode(["success" => 0, "error" => "INVALID_INDEX"]);
    exit;
  }

  if (!isset($s["current_spinning_index"]) || (int)$s["current_spinning_index"] !== $index) {
    echo json_encode(["success" => 0, "error" => "BAD_CURRENT_INDEX"]);
    exit;
  }

  if (isset($s["user_answers"][$index])) {
    echo json_encode(["success" => 0, "error" => "ALREADY_ANSWERED"]);
    exit;
  }

  $inst = $s["instances"][$index];
  $correctIndex = (int)$inst["answer"];
  $isCorrect = ($selectedOptionIndex === $correctIndex);
  $points = $isCorrect ? (int)($inst["points"] ?? 10) : 0;
  $explanation = $inst["explanation"] ?? "";

  if (!isset($s["played_indices"]) || !is_array($s["played_indices"])) $s["played_indices"] = [];
  $s["played_indices"][] = $index;

  if (!isset($s["user_answers"]) || !is_array($s["user_answers"])) $s["user_answers"] = [];
  $s["user_answers"][$index] = [
    "selected" => $selectedOptionIndex,
    "isCorrect" => $isCorrect,
    "points" => $points
  ];

  $s["score"] = (int)($s["score"] ?? 0) + $points;
  $s["current_round"] = (int)($s["current_round"] ?? 0) + 1;

  unset($s["current_spinning_index"]);

  $isGameFinished = ((int)$s["current_round"] >= (int)$s["rounds_to_play"]);
  if ($isGameFinished) $s["ended"] = 1;

  echo json_encode([
    "success" => 1,
    "isCorrect" => $isCorrect,
    "points" => $points,
    "explanation" => $explanation,
    "totalScore" => $s["score"],
    "currentRound" => $s["current_round"],
    "isFinished" => $isGameFinished
  ]);
  exit;
}

echo json_encode(["success" => 0, "error" => "BAD_OP"]);
exit;
