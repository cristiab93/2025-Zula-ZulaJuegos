<?php

if($_SERVER['HTTP_HOST'] == 'localhost:82' || $_SERVER['HTTP_HOST'] == 'localhost' )
{
    define("DBSERVERNAME", "localhost");
	define("DBUSERNAME", "cristianb");
	define("DBPASSWORD", "511xpWgxUR4icML4");
	define("DBNAME", "zula_juegos");
	define("DEPURAR", 0);
	define("BASEURL", "http://localhost/zula_juegos/rosco/");
}
else
{
    define("DBSERVERNAME", "localhost");
	define("DBUSERNAME", "a0050875_testing");
	define("DBPASSWORD", "luriPUgi41");
	define("DBNAME", "a0050875_testing");
	define("DEPURAR", 0);
	define("BASEURL", "https://a0050875.ferozo.com/");
}
