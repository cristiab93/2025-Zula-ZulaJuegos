<?php

function GetSecret($key)
{
  return array_values(SelectQuery("secrets")
  ->Condition("secret_key =", "s", $key)
  ->Run())[0]["secret_value"];
}