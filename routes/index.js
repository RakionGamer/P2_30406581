const express = require('express');
const router = express.Router();
const sqlite3=require('sqlite3').verbose();
const http=require('http');
const path = require('path');
const { request } = require('https');
const req = require('express/lib/request');


//Creacion de la Base de Datos
const db_name=path.join(__dirname,"database","datab.db");
const db=new sqlite3.Database(db_name, err =>{ 
if (err){
	return console.error(err.message);
}else{
	console.log("Conexion exitosa en la BD");
}
})

//Creacion de la tabla
const sql_create="CREATE TABLE IF NOT EXISTS Contactos(email VARCHAR(20),nombre VARCHAR(20), comentario TEXT,fecha DATATIME,hora VARCHAR(17),ip VARCHAR(25));";



//Tabla creada correctamente
db.run(sql_create,err=>{
	if (err){
	return console.error(err.message);
}else{
	console.log("Tabla creada correctamente");
}
})

//ruta views
router.get('/contactos',(req,res)=>{
	const sql="SELECT * FROM Contactos;";
	db.all(sql, [],(err, rows)=>{
			if (err){
				return console.error(err.message);
			}else{
			res.render("contactos.ejs",{get:rows});
			}
	})
})





router.post('/',(req,res)=>{


  //Obtener la fecha/hora
  	let hoy = new Date();
  	let horas = hoy.getHours();
  	let minutos = hoy.getMinutes();
  	let segundos = hoy.getSeconds()
  	let formato = horas >= 12 ? 'PM' : 'AM'; 
  	horas = horas % 12; 
  	horas = horas ? horas : 12; 
  	minutos = minutos < 10 ? '0' + minutos : minutos;
  	let hora = horas + ':' + minutos + ':' + segundos + ' ' + formato;
  	let fecha = hoy.getDate() + '-' + ( hoy.getMonth() + 1 ) + '-' + hoy.getFullYear();

	//////////////////////////////////////

	//////////////Obtener la IP////////////////
	let ip_new = req.headers["x-forwarded-for"];
  	if (ip_new){
    	let list = ip_new.split(",");
    	ip_new = list[list.length-1];
 	 } else {
	ip_new = req.connection.remoteAddress;
  	}
	////////////////////////////////////////////
	const sql="INSERT INTO Contactos(email, nombre, comentario, fecha ,hora, ip) VALUES (?,?,?,?,?,?)";
	const nuevos_mensajes=[req.body.email, req.body.nombre, req.body.comentario,fecha,hora,ip_new];
	db.run(sql, nuevos_mensajes, err =>{
	if (err){
		return console.error(err.message);
	}
	else{
		res.redirect("/");
		}
	})
});


router.get('/',(req,res)=>{
	res.render('index.ejs',{get:{}})
});



module.exports = router;
