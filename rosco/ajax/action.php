<?php
include "../_general.php";
header("Content-Type: application/json; charset=utf-8");

function ObtenerParam($k, $d = "") {
  return isset($_POST[$k]) ? trim($_POST[$k]) : $d;
}

function NormalizarRosco($str) {
    if (empty($str)) return "";
    $str = mb_strtolower($str, 'UTF-8');
    $str = strtr(utf8_decode($str), utf8_decode('àáâãäçèéêëìíîïñòóôõöùúûüýÿ'), 'aaaaaceeeeiiiinooooouuuuyy');
    $str = preg_replace('/[^a-z0-9]/', '', $str);
    return $str;
}

$gid = ObtenerParam("gid");
$op = ObtenerParam("op");

if (!$gid || !isset($_SESSION["rosco"][$gid])) {
    echo json_encode(["success" => 0, "error" => "INVALID_SESSION"]);
    exit;
}

$game = &$_SESSION["rosco"][$gid];
$now = time();
$elapsed = $now - $game["start_ts"];
$time_left = max(0, $game["duration"] - $elapsed);

if ($time_left <= 0 && $op !== "tick") {
    $game["ended"] = 1;
    $game["status"] = "lost";
}

if ($game["ended"]) {
    echo json_encode([
        "success" => 1,
        "status" => $game["status"],
        "time_left" => 0,
        "message" => "El juego ha terminado"
    ]);
    exit;
}

$resp = ["success" => 1, "time_left" => $time_left];

switch ($op) {
    case "answer":
        $userAnswer = ObtenerParam("answer");
        $idx = $game["current_index"];
        $item = $game["items"][$idx];
        
        // Normalize User Answer
        $normUser = NormalizarRosco($userAnswer);
        
        // Support for multiple correct answers (array or string)
        $correctAnswers = isset($item["answer"]) ? (is_array($item["answer"]) ? $item["answer"] : [$item["answer"]]) : [];
        
        $isCorrect = false;
        foreach ($correctAnswers as $ca) {
            if ($normUser === NormalizarRosco($ca)) {
                $isCorrect = true;
                break;
            }
        }

        if ($isCorrect) {
            $game["answers_status"][$idx] = 'success';
        } else {
            $game["answers_status"][$idx] = 'error';
        }

        MoveToNext($game);
        break;

    case "pasapalabra":
        $idx = $game["current_index"];
        if (!in_array($idx, $game["skipped"])) {
            $game["skipped"][] = $idx;
        }
        MoveToNext($game);
        break;

    case "tick":
        // Just return time_left
        break;
}

function MoveToNext(&$game) {
    $total = count($game["items"]);
    $startIdx = $game["current_index"];
    
    // Check if everything is solved
    $solvedCount = count($game["answers_status"]);
    if ($solvedCount === $total) {
        $game["ended"] = 1;
        $game["status"] = "won"; // Or check if all success
        return;
    }

    // Try to find next available in normal flow
    for ($i = 1; $i <= $total; $i++) {
        $next = ($startIdx + $i) % $total;
        // If not answered AND either:
        // 1. Not skipped yet
        // 2. We are revisiting (all non-skipped are answered)
        if (!isset($game["answers_status"][$next])) {
            // Check if there are any non-skipped left
            $anyNonSkippedLeft = false;
            for ($j = 0; $j < $total; $j++) {
                if (!isset($game["answers_status"][$j]) && !in_array($j, $game["skipped"])) {
                    $anyNonSkippedLeft = true;
                    break;
                }
            }

            if ($anyNonSkippedLeft) {
                if (!in_array($next, $game["skipped"])) {
                    $game["current_index"] = $next;
                    return;
                }
            } else {
                // Only skipped left, just take the next skipped available
                $game["current_index"] = $next;
                return;
            }
        }
    }
}

$resp["current_index"] = $game["current_index"];
$resp["answers_status"] = $game["answers_status"];
$resp["status"] = $game["status"];

echo json_encode($resp, JSON_UNESCAPED_UNICODE);
exit;
