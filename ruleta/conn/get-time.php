<?php

date_default_timezone_set('America/Argentina/Buenos_Aires');
$info = getdate();

$year = $info['year'];
$month = $info['mon'];
$day = $info['mday'];
$hour = $info['hours'];
$min = $info['minutes'];
$sec = $info['seconds'];
$current_date = "$year-$month-$day $hour:$min:$sec";

define("TODAY", "$year-$month-$day");
//define("TODAY", "2023-03-17");

$now_timestamp = $info[0];
$initial_ms = microtime(true);