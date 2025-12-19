<?php

// SED
define('SED_METHOD','AES-256-CBC');
define('SED_SK','hY21233Prm#d*');
define('SED_SI','932640');
$SED_KEY = "";
$SED_IV = "";

function sed_encryption($string) {
  global $SED_KEY, $SED_IV;
  if (empty($SED_KEY) || empty($SED_IV)) {
    $SED_KEY = hash('sha256', SED_SK);
    $SED_IV = substr(hash('sha256', SED_SI), 0, 16);
  }
  return base64_encode(openssl_encrypt($string, SED_METHOD, $SED_KEY, 0, $SED_IV));
}

function sed_decryption($string) {
  global $SED_KEY, $SED_IV;
  if (empty($SED_KEY) || empty($SED_IV)) {
    $SED_KEY = hash('sha256', SED_SK);
    $SED_IV = substr(hash('sha256', SED_SI), 0, 16);
  }
  return openssl_decrypt(base64_decode($string), SED_METHOD, $SED_KEY, 0, $SED_IV);
}