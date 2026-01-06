<?php

function write($content)
{
    echo $content . "<br>";
}

function print_line($content)
{
    echo $content . "\n";
}

function print_array($array)
{
    echo "<pre>";
    var_dump($array);
    echo "</pre>";
}

function CalculateDateDiff($start, $end)
{
    $date1 = strtotime($start);
    $date2 = strtotime($end);
    $diff = abs($date2 - $date1);
    $days = $diff / (24*60*60);
    return $days;
}

function Script($file)
{
    echo '<script src="'.$file.'?v='.getdate()[0].'"></script>';
}

function CSS($file)
{
    echo '<link href="'.$file.'?v='.getdate()[0].'" rel="stylesheet">';
}

function salir_mant($text = "No comment") 
{
    $random = rand(1, 999999);
    error_log("SALIR MANT:" . $text . "(ID: ". $random . ")" . "(DNI: ". $_SESSION["user_id"] . ")");
    salir("¡Ups! Parece que algo salió mal. Intentá nuevamente más tarde." . "(ID: ". $random . ")");
}

function redirect($page)
{
  header("location: $page");
  die();
}


function salir($mensaje = NULL) 
{
  foreach ($_SESSION as $i => $v) 
  {
    unset($_SESSION[$i]);
  }
  if ($mensaje) die("<big><b>$mensaje</b></big>"); 
  else
  {
    if(file_exists("expired.php")) redirect("expired.php");
    else redirect("../expired.php");
  }
}

function IsExtern()
{
   return $_SESSION["user_id"] == 0;
}

function UploadImage($file_input, $n)
{
    $dir = "img/uploaded_images/test.jpg";
    if($file_input["tmp_name"] != "")
    {
        $compressedImage = compressImage($file_input["tmp_name"], $dir, 800, 80);
        if($compressedImage)
        {
            $file = base64_encode(file_get_contents($compressedImage));
            
            UpdateQuery("users")
            ->Value("user_pic", "s", $file)
            ->Condition("user_id =", "i", $n)
            ->Run();
        
            if (file_exists($dir)) unlink($dir);
        }
        else
        {
            $file = "";
        } 
    }
    else
    {
      $file = "";
    }

    $_SESSION["file"] = $file;
    return true;
}

function UploadImageBanner($file_input)
{
    $dir = "img/uploaded_images/".time().".jpg";
    if($file_input["tmp_name"] != "")
    {
        $compressedImage = compressImage($file_input["tmp_name"], $dir, 2000, 100);
        if($compressedImage)
        {
            $file = base64_encode(file_get_contents($compressedImage));
            
            InsertQuery("home_banners")
            ->Value("banner_pic", "s",$dir)
            ->Value("banner_pos", "i", time())
            ->Run();
        
            //if (file_exists($dir)) unlink($dir);
        }
        else
        {
            $file = "";
        } 
    }
    else
    {
      $file = "";
    }

    $_SESSION["file"] = $file;
    return true;
}

function compressImage($source, $destination, $image_size, $quality) 
{
  list($ancho, $altura, $type, $attr) = getimagesize($source);

  switch ($type) {
      case 1: {
          $image = false;
        break;
      }
      case 2: {
          $image = imagecreatefromjpeg($source);
        break;
      }
      case 3: {
          $image = imagecreatefrompng($source);
          break;
      }
      default: {
          $image = false;
        break;
      }
  }
  if ($image) {
    $image = resize_image($image, $ancho, $altura, $image_size, $image_size);
    imagejpeg($image, $destination, $quality);
  }

  if($image)
  {
      return $destination;
  }
  else
  {
      return "";
  }
}

function resize_image($src, $width, $height, $w, $h) 
{
  $r = $width / $height;
  if ($w/$h > $r) {
      $newwidth = $h*$r;
      $newheight = $h;
  } else {
      $newheight = $w/$r;
      $newwidth = $w;
  }
  $dst = imagecreatetruecolor($newwidth, $newheight);
  imagecopyresampled($dst, $src, 0, 0, 0, 0, $newwidth, $newheight, $width, $height);
  return $dst;
}

function validateDate($date, $format = 'Y-n-j')
{
    $d = DateTime::createFromFormat($format, $date);
    // The Y ( 4 digits year ) returns TRUE for any integer with any number of digits so changing the comparison from == to === fixes the issue.
    return $d && $d->format($format) === $date;
}

function getPreviousSemester($str) {
  $year = intval(substr($str, 0, 4));
  $letter = substr($str, 4);

  $prevYear = $year;
  $prevLetter = "";

  if ($letter === "A") {
      $prevYear = $year - 1;
      $prevLetter = "D";
  } else {
      $prevLetter = chr(ord($letter) - 1);
  }

  return $prevYear . $prevLetter;
}

function transformDateToDayAndMonth($dateString) {
  $date = DateTime::createFromFormat('d/m/Y', $dateString);
  $monthNames = [
      1 => 'enero', 2 => 'febrero', 3 => 'marzo', 4 => 'abril', 5 => 'mayo', 6 => 'junio',
      7 => 'julio', 8 => 'agosto', 9 => 'septiembre', 10 => 'octubre', 11 => 'noviembre', 12 => 'diciembre'
  ];

  $day = $date->format('j');
  $month = $date->format('m');

  $result = $day . ' de ' . $monthNames[(int)$month];
  return $result;
}












