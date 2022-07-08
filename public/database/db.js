const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const dbRoot = path.join(__dirname, "../database", "dbAdmin.db");
const dbAdmin = new sqlite3.Database(dbRoot, (err) => {
  if (err) {
    return console.error(err.message);
  } else {
    console.log("Database connection successful");
  }
});
//Creacion de la tabla
const sqlCreateTableUsers ="CREATE TABLE IF NOT EXISTS users(username VARCHAR(20),password VARCHAR(20));";
const sqlCreateTable ="CREATE TABLE IF NOT EXISTS Contactos(email VARCHAR(20),name VARCHAR(20), commentary TEXT,date DATETIME,hour VARCHAR(20),ipaddress VARCHAR(20),country VARCHAR(20));";
//Tabla Contactos correctamente
dbAdmin.run(sqlCreateTable, (err) => {
  if (err) {
    return console.error(err.message);
  } else {
    console.log("Table Contacts Success");
  }
});
//Tabla users correctamente
dbAdmin.run(sqlCreateTableUsers, (err) => {
  if (err) {
    return console.error(err.message);
  } else {
    console.log("Table User Success");
  }
});

module.exports = dbAdmin;
