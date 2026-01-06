<?php

class UpdateQuery extends ConditionalQuery {
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

    function Condition($condition, $type, $value) {
        array_push($this->conditions, $condition . " ?");
        $this->types .= $type;
        array_push($this->values, $value);
        return $this;
    }

    function Run($print = null)
    {
        global $conn;
        
        $sql = "UPDATE ". $this->table . " SET ";

        $i = 1;
        foreach ($this->names as $name) {
            $sql .= $name . " = ?";
            if($i != count($this->names))
            {
                $sql .= ", ";
            }
            $i++;
        }

        if(count($this->conditions) > 0)
        {
            $sql .= " WHERE ";
            $i = 1;
            foreach ($this->conditions as $condition) {
                $sql .= $condition;
                if($i != count($this->conditions))
                {
                    $sql .= " AND ";
                }
                $i++;
            }
        }
        else
        {
            echo "Query needs at least 1 condition to execute. <br>";
            return null;
        }

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
            } 
            else
            {
                salir_mant("SQL_5");
            }
        }
        else
        {
            salir_mant("SQL_6");
        }
    }

}

function UpdateQuery($table)
{
     return new UpdateQuery($table);
}