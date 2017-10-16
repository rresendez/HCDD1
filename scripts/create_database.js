/**
 * Created by barrett on 8/28/14.
 */
// require mysql library and database configuration file
var mysql = require('mysql');
var dbconfig = require('../config/database_2');
// This craeted the sql connection
var connection = mysql.createConnection(dbconfig.connection);
//Tells sql tu use time database
connection.query('USE ' + dbconfig.database);
//This will crate the schemma for the user and password
connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.users_table + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `username` VARCHAR(20) NOT NULL, \
    `password` CHAR(60) NOT NULL, \
        PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC), \
    UNIQUE INDEX `username_UNIQUE` (`username` ASC) \
)');
// Messaga that confirms the creation of the table
console.log('Success: Database Created!')

connection.end();
