<?php
include "../_general.php";
if (session_status() !== PHP_SESSION_ACTIVE) session_start();
header("Content-Type: application/json; charset=utf-8");

function Responder($a){echo json_encode($a,JSON_UNESCAPED_UNICODE);exit;}
function ObtenerParam($k,$d=""){return isset($_POST[$k])?trim($_POST[$k]):$d;}

function LimpiarPartida(){
  unset($_SESSION["connect_words"], $_SESSION["connect_words_current_gid"]);
}

function CargarConfigsActivas($cfg_key){
  $sel=SelectQuery("game_configs");
  $sel->Condition("cfg_key =","s",$cfg_key);
  $sel->Condition("cfg_active =","i",1);
  $sel->Order("cfg_id","DESC");
  $sel->NoSpecialChars();
  return $sel->SetIndex(-1)->Limit(500)->Run();
}

function ElegirConfigRandom($rows){
  if(!is_array($rows)||!count($rows))return null;
  return $rows[array_rand($rows)];
}

function ArmarPartidaNueva($config,$cfg_key){
  $duration=(int)$config["cfg_duration"];
  $puzzle=json_decode($config["cfg_content"],true);
  if(!$puzzle||!isset($puzzle["groups"])||!is_array($puzzle["groups"]))return null;
  $groups=$puzzle["groups"];
  
  // Debe haber al menos 1 grupo
  if(count($groups) < 1) return null;
  
  $numGroups = count($groups);
  $wordsPerGroup = null;
  
  // Verificar que todos los grupos tengan la misma cantidad de palabras
  foreach($groups as $g){
    if(!isset($g["key"])||!isset($g["words"])||!is_array($g["words"])) return null;
    $count = count($g["words"]);
    if($count < 1) return null;
    if($wordsPerGroup === null){
      $wordsPerGroup = $count;
    } else if($wordsPerGroup !== $count){
      return null; // Todos los grupos deben tener la misma cantidad de palabras
    }
  }
  
  // Para una grilla cuadrada: numGroups debe ser igual a wordsPerGroup
  if($numGroups !== $wordsPerGroup) return null;
  
  $gridSize = $numGroups; // 3x3, 4x4, 5x5, etc.
  $totalWords = $gridSize * $gridSize;

  $word_map=[];$group_map=[];$board=[];$idc=1;
  foreach($groups as $g){
    $gk=(string)$g["key"];
    foreach($g["words"] as $w){
      $id=(string)$idc++;
      $word_map[$id]=(string)$w;
      $group_map[$id]=$gk;
      $board[]=$id;
    }
  }
  
  if(count($board)!==$totalWords)return null;
  
  // Smart distribution: place one word from each group in each row
  // This guarantees no row is complete from the start
  $groupWords = []; // Array of arrays: groupWords[groupIndex] = [word1, word2, word3]
  
  foreach($groups as $gIndex => $g){
    $gk = (string)$g["key"];
    $groupWords[$gIndex] = [];
    foreach($board as $id) {
      if($group_map[$id] === $gk) {
        $groupWords[$gIndex][] = $id;
      }
    }
  }
  
  // Build board row by row, taking one word from each group
  $newBoard = [];
  for($row = 0; $row < $gridSize; $row++) {
    $rowWords = [];
    foreach($groupWords as $gIndex => $words) {
      if(isset($words[$row])) {
        $rowWords[] = $words[$row];
      }
    }
    // Shuffle columns within this row for randomness
    shuffle($rowWords);
    $newBoard = array_merge($newBoard, $rowWords);
  }
  
  $board = $newBoard;

  $gid=bin2hex(random_bytes(16));
  $_SESSION["connect_words"]=[];
  $_SESSION["connect_words"][$gid]=[
    "cfg_key"=>$cfg_key,
    "cfg_id"=>(int)$config["cfg_id"],
    "duration"=>$duration,
    "start_ts"=>time(),
    "board"=>$board,
    "word_map"=>$word_map,
    "group_map"=>$group_map,
    "solved_groups"=>[],
    "ended"=>0,
    "cols"=>$gridSize,
    "rows"=>$gridSize
  ];
  $_SESSION["connect_words_current_gid"]=$gid;

  $tiles_solved=[]; foreach($board as $id){ $tiles_solved[$id]=0; }

  return [
    "success"=>1,
    "gid"=>$gid,
    "duration"=>$duration,
    "time_left"=>$duration,
    "word_map"=>$word_map,
    "board"=>$board,
    "tiles_solved"=>$tiles_solved,
    "groups"=>$groups,
    "cols"=>$gridSize,
    "rows"=>$gridSize,
    "status"=>"playing",
    "message"=>""
  ];
}

$cfg_key=ObtenerParam("cfg_key","connect_words");
LimpiarPartida();
$configs=CargarConfigsActivas($cfg_key);
if(!count($configs)) Responder(["success"=>0,"error"=>"NO_CONFIGS"]);

$config=ElegirConfigRandom($configs);
if(!$config) Responder(["success"=>0,"error"=>"RANDOM_FAIL"]);

$res=ArmarPartidaNueva($config,$cfg_key);
if(!$res) Responder(["success"=>0,"error"=>"BAD_CFG_CONTENT"]);

Responder($res);
