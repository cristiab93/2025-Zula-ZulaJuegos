<?php

class InsertQuery extends Query {
    private $names = array();
    private $types = "";
    private $values = array();

    public function __construct($table) {
        $this->table = $table;
   }

   function Value($name, $type, $value) {
        array_push($this->names, $name);
        $this->types .= $type;
        array_push($this->values, $value);
        return $this;
    }

    function Run($print = null)
    {
        global $conn;

        $sql = "INSERT INTO ". $this->table . " (";

        $i = 1;
        foreach ($this->names as $name) {
            $sql .= $name;
            if($i != count($this->names))
            {
                $sql .= ", ";
            }
            $i++;
        }
        $sql .= ") VALUES (";

        $i = 1;
        foreach ($this->values as $value) {
            $sql .= "?";
            if($i != count($this->values))
            {
                $sql .= ", ";
            }
            $i++;
        }
        $sql .= ");";

        if($print == 1)
        {
            echo "<b>" .$sql . "</b><br><br>";
        }
        
        if($stmt = mysqli_prepare($conn, $sql))
        {    
            mysqli_stmt_bind_param($stmt, $this->types, ...$this->values);
            if(mysqli_stmt_execute($stmt))
            { 
                //success
                return mysqli_stmt_insert_id($stmt);
            } 
            else
            {
                salir_mant("SQL_3");
            }
        }
        else
        {
            salir_mant("SQL_4");
        }
    }

}

function InsertQuery($table)
{
     return new InsertQuery($table);
}