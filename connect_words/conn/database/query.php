<?php

class Query {
    
    public $database_name = DBNAME;
    public $table = null;
}

class ConditionalQuery extends Query {
    public $conditions = array();
}