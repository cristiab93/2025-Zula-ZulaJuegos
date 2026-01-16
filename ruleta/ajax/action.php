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
  // Logic to choose which question to hit
  // User says "una de las ocho... le van a tocar cuatro"
  // Let's pick an index 0-7 that hasn't been played in this session's rounds
  $available = [];
  for($i=0; $i<8; $i++) {
    if (!in_array($i, $s["played_indices"])) {
      $available[] = $i;
    }
  }

  if (empty($available)) {
    // Should not happen if rounds_to_play is 4 and we have 8
    $available = range(0,7);
  }

  $chosenIndex = $available[array_rand($available)];
  
  // Note: We don't mark it as played YET. We mark it after they answer.
  // Or do we? If they refresh, they might get another spin.
  // Let's store it as "current_spinning_index"
  $s["current_spinning_index"] = $chosenIndex;

  echo json_encode([
    "success" => 1,
    "chosen_index" => $chosenIndex
  ]);
  exit;
}

if ($op === "check_answer") {
  $index = (int)ObtenerParam("index", "-1");
  $selectedOptionIndex = (int)ObtenerParam("selected", "-1");

  if ($index < 0 || !isset($s["instances"][$index])) {
    echo json_encode(["success" => 0, "error" => "INVALID_INDEX"]);
    exit;
  }

  $inst = $s["instances"][$index];
  $correctIndex = (int)$inst["answer"]; // Assuming 0-based index
  $isCorrect = ($selectedOptionIndex === $correctIndex);
  $points = $isCorrect ? (int)($inst["points"] ?? 10) : 0;
  $explanation = $inst["explanation"] ?? "";

  // Update session
  $s["played_indices"][] = $index;
  $s["user_answers"][$index] = [
    "selected" => $selectedOptionIndex,
    "isCorrect" => $isCorrect,
    "points" => $points
  ];
  $s["score"] += $points;
  $s["current_round"]++;

  $isGameFinished = ($s["current_round"] >= $s["rounds_to_play"]);
  if ($isGameFinished) {
    $s["ended"] = 1;
  }

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
