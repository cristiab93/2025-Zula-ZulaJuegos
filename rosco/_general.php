<?php
if (session_status() !== PHP_SESSION_ACTIVE) {
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443);

    $sameSite = $isHttps ? 'None' : 'Lax';
    $secure = $isHttps ? true : false;

    if (PHP_VERSION_ID >= 70300) {
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'secure' => $secure,
            'httponly' => true,
            'samesite' => $sameSite
        ]);
    } else {
        ini_set('session.cookie_secure', $secure ? '1' : '0');
        ini_set('session.cookie_httponly', '1');
        ini_set('session.cookie_samesite', $sameSite);
        session_set_cookie_params(0, '/');
    }

    session_start();
}

require_once("conn/cfg.php");
require_once("conn/sql_latest.php");
require_once("conn/functions.php");
require_once("conn/load-globals.php");
require_once("conn/sed.php");
require_once("conn/get-time.php");

mysqli_report(MYSQLI_REPORT_ERROR);
($conn = mysqli_connect(DBSERVERNAME, DBUSERNAME, DBPASSWORD, DBNAME)) || salir_mant();
mysqli_set_charset($conn, 'utf8mb4');
mysqli_query($conn, "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
$_SESSION["conn"] = $conn;
