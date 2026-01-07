<?php

class SelectQuery extends ConditionalQuery {
    private $order = null;
    private $order_type = null;
    private $limit = 1000000;
    private $join = null;
    private $specialChars = true;
    private $leftJoins = array();
    private $ignored_fields = array();
    private $index = 0;
    private $condition_type = "AND";
    private $customQuery = "";

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
        array_push($this->leftJoins, [$table, $param1, $param2]);
        return $this;
    }

    function ResetJoins()
    {
        $this->leftJoins = array();
        return $this;
    }

    function NoSpecialChars()
    {
        $this->specialChars = false;
        return $this;
    }

    function SetIndex($index)
    {
        $this->index = $index;
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

    function ConditionType($type)
    {
        $this->condition_type = $type;
    }

    function IgnoreField($field) {
        array_push($this->ignored_fields, $field);
        return $this;
    }

    function Custom($query)
    {
        $this->customQuery = $query;
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
        global $conn;

        $result = array();
        $fields = array();
        
        $this->GetFields($this->table, $this->database_name, $conn, $fields);

        if(count($this->leftJoins) != 0)
        {
            foreach($this->leftJoins as $join)
            {
                $this->GetFields($join[0], $this->database_name, $conn, $fields);
            }
            
        }
        
        $sql = "SELECT ";
        $i = 1;
        $fields = array_values(array_diff($fields, $this->ignored_fields));
        $fields_text = "";
        foreach ($fields as $field) 
        {
            $fields_text .= $field;
            if($i != count($fields))
            {
                $fields_text .= ", ";
            }
            $i++;
        }

        $sql .= $fields_text;

        $sql .= " FROM ". $this->table;
    
        if(count($this->leftJoins) != 0)
        {
            foreach ($this->leftJoins as $join) 
            {
                $sql .= " LEFT JOIN ". $join[0] . " ON " . $join[1] . " = " . $join[2] . " ";
            }
        }

        if(count($this->conditions) > 0)
        {
            $sql .= " WHERE ";
            $i = 1;
            foreach ($this->conditions as $condition) {
                $sql .= $condition[0];
                if($i != count($this->conditions))
                {
                    $sql .= " $this->condition_type ";
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
    
        if($this->customQuery != "")
        {
            $sql = $this->customQuery;
            $sql = str_replace("*", $fields_text, $sql);
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
                            if($this->specialChars) $b = htmlspecialchars($b ?? '');
                            $array[$fields[$i]] = $b;
                            $i++;
                        }
                        

                        if($this->index == -1)
                            array_push($result, $array);
                        else
                            $result[$array[$fields[$this->index]]] = $array;
                    }
    
                    if($print == 1)
                    {   
                        foreach ($result as $key => $field) {
                            $i = 0;
                            echo "<b style='color: red;'>$key</b>: <br>";
                            foreach ($field as $f) {
                                echo "<b style='color: blue;'>" . $fields[$i] . "</b>: " . htmlspecialchars($f ?? '') ."<br>";
                                $i++;
                            }
                            echo "<hr>";
                        }
                    }
                    return $result;
                }
    
                return $result;
            } 
            else
            {
                salir_mant("SQL_1");
            }
        }
        else
        {
            salir_mant("SQL_2");
        }
    }

}

function SelectQuery($table)
{
     return new SelectQuery($table);
}