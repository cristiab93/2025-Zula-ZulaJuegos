<?php

if($_SERVER['HTTP_HOST'] == 'localhost:82' || $_SERVER['HTTP_HOST'] == 'localhost' )
{
    define("DBSERVERNAME", "localhost");
	define("DBUSERNAME", "cristianb");
	define("DBPASSWORD", "511xpWgxUR4icML4");
	define("DBNAME", "zula_juegos");
	define("DEPURAR", 0);
	define("BASEURL", "http://localhost/zula_juegos/trivia/");
}
else
{
    /*define("DBSERVERNAME", "localhost");
	define("DBUSERNAME", "c2110196_sk");
	define("DBPASSWORD", "poGEve59wi");
	define("DBNAME", "c2110196_sk");
	define("DEPURAR", 0);
	define("BASEURL", "https://somoskahlo.com");*/
}
