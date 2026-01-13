<?php
include "../_general.php";
header("Content-Type: application/json; charset=utf-8");

$gid = isset($_POST["gid"]) ? trim($_POST["gid"]) : "";

if (!$gid || !isset($_SESSION["rosco"][$gid])) {
    echo json_encode(["success" => 0, "error" => "INVALID_SESSION"]);
    exit;
}

$game = &$_SESSION["rosco"][$gid];
$game["ended"] = 1;

// Calculate points etc if needed
$corrects = 0;
foreach($game["answers_status"] as $s) {
    if ($s === 'success') $corrects++;
}

echo json_encode([
    "success" => 1,
    "status" => $game["status"],
    "correct_count" => $corrects,
    "total_count" => count($game["items"])
]);
exit;
