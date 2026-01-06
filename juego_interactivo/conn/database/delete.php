<?php

class DeleteQuery extends ConditionalQuery {

    public function __construct($table) {
        $this->table = $table;
    }

    function Condition($condition, $type, $operator) {
        array_push($this->conditions, [$condition . " ?", $type, $operator]);
        return $this;
    }

    function Run($print = null)
    {
        global $conn;

        $sql = "DELETE FROM ". $this->table;

        if(count($this->conditions) > 0)
        {
            $sql .= " WHERE ";
            $i = 1;
            foreach ($this->conditions as $condition) {
                $sql .= $condition[0];
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
            $types = "";
            $variables = array();
            foreach ($this->conditions as $condition) {
                $types .= $condition[1];
                array_push($variables, $condition[2]);
            }
            mysqli_stmt_bind_param($stmt, $types, ...$variables);
            if(mysqli_stmt_execute($stmt))
            { 
                //success
            } 
            else
            {
                salir_mant("SQL_7");
            }
        }
        else
        {
            salir_mant("SQL_8");
        }
    }

}

function DeleteQuery($table)
{
     return new DeleteQuery($table);
}