<?php
$defaultW = 820;
$defaultH = 500;

$w = filter_input(INPUT_GET, 'w', FILTER_VALIDATE_INT);
$h = filter_input(INPUT_GET, 'h', FILTER_VALIDATE_INT);

if ($w === false || $w === null) $w = $defaultW;
if ($h === false || $h === null) $h = $defaultH;

$minW = 200;
$minH = 200;
$maxW = 3000;
$maxH = 3000;

$w = max($minW, min($maxW, $w));
$h = max($minH, min($maxH, $h));

$src = 'https://a0050875.ferozo.com/';
?>
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title></title>
    <style>
      html, body {
        width: 100%;
        height: 100%;
        margin: 0;
      }
      body {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      iframe {
        width: <?= (int)$w ?>px;
        height: <?= (int)$h ?>px;
        border: 0;
      }
    </style>
  </head>
  <body>
    <iframe src="<?= htmlspecialchars($src, ENT_QUOTES, 'UTF-8') ?>" width="<?= (int)$w ?>" height="<?= (int)$h ?>"></iframe>
  </body>
</html>
