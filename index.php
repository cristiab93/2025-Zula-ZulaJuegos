<?php
include_once "_general.php";
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zula</title>
  <link rel="shortcut icon" type="image/x-icon" href="img/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="css/bootstrap.min.css" rel="stylesheet">
  <link href="css/style.css?v=<?php echo filemtime('css/style.css'); ?>" rel="stylesheet">
</head>
<body class="bg-lines">
  <!-- Floating game status notification -->
  <div id="game-notification" class="game-notification">
    <p id="message"></p>
    <button id="replay" style="display:none;">Jugar de nuevo</button>
  </div>
  
  <div class="container vh-100 position-relative">
    <div class="row align-items-center justify-content-center vh-100">
      <div class="col-xl-10 text-center">
        <p class="timer-game d-inline-block px-2 py-1 rounded-1 mb-4" id="time">01:00</p>
        <div id="board"></div>
      </div>
    </div>
  </div>

  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  <script src="js/bootstrap.bundle.min.js"></script>
  <script src="js/Sortable.min.js"></script>
  <script src="js/game.js?v=<?php echo filemtime('js/game.js'); ?>"></script>
</body>
</html>
