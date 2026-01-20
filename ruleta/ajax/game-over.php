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

$user_answers = isset($s["user_answers"]) && is_array($s["user_answers"]) ? $s["user_answers"] : [];
$correct_count = count(array_filter($user_answers, function($a){ return isset($a["isCorrect"]) && $a["isCorrect"]; }));
$total_count = (int)($s["current_round"] ?? 0);

$start_ts = (int)($s["start_ts"] ?? 0);
$now = time();
$time_spent = $start_ts > 0 ? max(0, $now - $start_ts) : 0;

$duration = (int)($s["duration"] ?? 0);
if ($duration > 0) $time_spent = min($time_spent, $duration);

echo json_encode([
  "success" => 1,
  "score" => (int)($s["score"] ?? 0),
  "correct_count" => $correct_count,
  "total_count" => $total_count,
  "time_spent" => $time_spent,
  "duration" => $duration
], JSON_UNESCAPED_UNICODE);
exit;
