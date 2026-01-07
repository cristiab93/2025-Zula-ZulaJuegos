<?php

class Query {
    
    public $database_name = DBNAME;
    public $table = null;
}

class ConditionalQuery extends Query {
    public $conditions = array();
}

class SelectQuery extends ConditionalQuery {
    private $order = null;
    private $order_type = null;
    private $limit = 1000000;
    private $join = null;
    private $specialChars = false;

    public function __construct($table) {
        $this->table = $table;
   }

    function Order($order, $order_type = "ASC") {
      $this->order = $order;
      $this->order_type = $order_type;
      return $this;
    }

    function LeftJoin($table, $param1, $param2)
    {
        $this->join = [$table, $param1, $param2];
        return $this;
    }

    function SpecialChars()
    {
        $this->specialChars = true;
        return $this;
    }

    function Limit($limit) {
        $this->limit = $limit;
        return $this;
    }

    function Condition($condition, $type, $operator) {
        array_push($this->conditions, [$condition . " ?", $type, $operator]);
        return $this;
    }

    function GetFields($table, $database_name, $conn, &$fields)
    {
        $sql = "SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?";
        if($stmt = mysqli_prepare($conn, $sql))
        {
          mysqli_stmt_bind_param($stmt, "ss", $database_name, $table);
            if(mysqli_stmt_execute($stmt))
            {
              mysqli_stmt_bind_result($stmt, $column_name); 
              while(mysqli_stmt_fetch($stmt)) {
                  array_push($fields, $column_name);
              }
            }
        }
    }

    function Run($print = null)
    {
        $conn = $_SESSION["conn"];
        $result = array();
        $fields = array();
        
        $this->GetFields($this->table, $this->database_name, $conn, $fields);

        if($this->join != null)
        {
            $this->GetFields($this->join[0], $this->database_name, $conn, $fields);
        }
        
        $sql = "SELECT ";
        $i = 1;
        foreach ($fields as $field) {
            $sql .= $field;
            if($i != count($fields))
            {
                $sql .= ", ";
            }
            $i++;
        }
        

        $sql .= " FROM ". $this->table;
    
        if($this->join != null)
        {
            $sql .= " LEFT JOIN ". $this->join[0] . " ON " . $this->table . "." . $this->join[1] . " = " . $this->join[0] . "." . $this->join[2] . " ";
        }

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

        if($this->order == null)
        {
            $sql .= " ORDER BY " .$fields[0]. " ASC";
        }
        else
        {
            $sql .= " ORDER BY " .$this->order. " ". $this->order_type;
        }
        
    
        $sql .= " LIMIT " . $this->limit;
    
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
    
            if(count($this->conditions) > 0)
            {
                mysqli_stmt_bind_param($stmt, $types, ...$variables);
            }
            if(mysqli_stmt_execute($stmt)){
                mysqli_stmt_store_result($stmt);
                if(mysqli_stmt_num_rows($stmt) > 0){
                    $binded = array();
                    foreach ($fields as $field) {
                        array_push($binded, "");
                    }
                    mysqli_stmt_bind_result($stmt, ...$binded);
                    while(mysqli_stmt_fetch($stmt)) {
                        $array = array();
                        $i = 0;
                        foreach ($binded as $b) {
                            if($this->specialChars) $b = htmlspecialchars($b);
                            $array[$fields[$i]] = $b;
                            $i++;
                        }
                        array_push($result, $array);
                    }
    
                    if($print == 1)
                    {   $n= 0;
                        foreach ($result as $field) {
                            $i = 0;
                            echo "<b style='color: red;'>$n</b>: <br>";
                            foreach ($field as $f) {
                                echo "<b style='color: blue;'>" . $fields[$i] . "</b>: " . htmlspecialchars($f) ."<br>";
                                $i++;
                            }
                            $n++;
                            echo "<hr>";
                        }
                    }
                    return $result;
                }
    
                return $result;
            } 
            else
            {
                salir_mant();
            }
        }
        else
        {
            salir_mant();
        }
    }

}

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
        $conn = $_SESSION["conn"];
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
                $_SESSION["inserted_id"] = mysqli_stmt_insert_id($stmt);
                return mysqli_stmt_insert_id($stmt);
            } 
            else
            {
                salir_mant();
            }
        }
        else
        {
            salir_mant();
        }
    }

}

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
        $conn = $_SESSION["conn"];
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
                salir_mant();
            }
        }
        else
        {
            salir_mant();
        }
    }

}

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
        $conn = $_SESSION["conn"];
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
                salir_mant();
            }
        }
        else
        {
            salir_mant();
        }
    }

}

class CustomQuery extends Query {

    public $statement = "";

    public function __construct($statement) {
        $this->statement = $statement;
    }

    function Run($print = null)
    {
        $conn = $_SESSION["conn"];
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

function SelectQuery($table)
{
     return new SelectQuery($table);
}

function InsertQuery($table)
{
     return new InsertQuery($table);
}

function UpdateQuery($table)
{
     return new UpdateQuery($table);
}

function DeleteQuery($table)
{
     return new DeleteQuery($table);
}
