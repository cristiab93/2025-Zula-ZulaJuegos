<?php

class CustomQuery extends Query {

public $statement = "";

public function __construct($statement) {
    $this->statement = $statement;
}

function Run($print = null)
{
    global $conn;
    $sql = $this->statement;

    if($print == 1)
    {
        echo "<b>" .$sql . "</b><br><br>";
    }
    
    if($stmt = mysqli_prepare($conn, $sql))
    {    
        if(mysqli_stmt_execute($stmt))
        { 
            //success
        } 
        else
        {
            salir_mant("SQL_9");
        }
    }
    else
    {
        salir_mant("SQL_10");
    }
}
}

function CustomQuery($statement)
{
    return new CustomQuery($statement);
}