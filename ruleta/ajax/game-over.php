<?php
include "../_general.php";
header("Content-Type: application/json; charset=utf-8");

$gid = isset($_POST["gid"]) ? trim($_POST["gid"]) : "";
if (!$gid || !isset($_SESSION["ruleta"][$gid])) {
  echo json_encode(["success" => 0, "error" => "BAD_GID"]);
  exit;
}

$s =& $_SESSION["ruleta"][$gid];
$s["ended"] = 1;

echo json_encode([
  "success" => 1,
  "score" => $s["score"],
  "correct_count" => count(array_filter($s["user_answers"], function($a){ return $a["isCorrect"]; })),
  "total_count" => $s["current_round"]
]);
exit;
