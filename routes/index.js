const express = require('express');
const router = express.Router();
const sqlite3=require('sqlite3').verbose();
const path = require('path');
const XMLHttpRequest = require('xhr2');
const fetch = require('node-fetch'); 
const nodemailer = require('nodemailer'); //=>Modulo para enviar el correo.
require('dotenv').config()


//Creacion de la Base de Datos
const dbRoot=path.join(__dirname,"database","datab.db");
const dbAdmin=new sqlite3.Database(dbRoot, err =>{ 
if (err){
	return console.error(err.message);
}else{
	console.log("Database connection successful");
}
})

//Creacion de la tabla
const sqlCreateTable="CREATE TABLE IF NOT EXISTS Contactos(email VARCHAR(20),name VARCHAR(20), commentary TEXT,date DATETIME,hour VARCHAR(20),ipaddress VARCHAR(20),country VARCHAR(20));";
//Tabla creada correctamente
dbAdmin.run(sqlCreateTable,err=>{
	if (err){
	return console.error(err.message);
}else{
	console.log("Table created successfully");
}
})

//ruta views
router.get('/contactos',(req,res)=>{
	const sql="SELECT * FROM Contactos;";
	dbAdmin.all(sql, [],(err, rows)=>{
			if (err){
				return console.error(err.message);
			}else{
			res.render("contactos.ejs",{get:rows});
			}
	})
})

//Envio POST del Formulario.
router.post('/',(req,res)=>{
	const name = req.body.name;
  	const response_key_RV = req.body["g-recaptcha-response"];
  	const secret_key_RV = process.env.KEY_PRIVATE;
  	const url = 
	`https://www.google.com/recaptcha/api/siteverify?secret=${secret_key_RV}&response=${response_key_RV}`;
  	fetch(url, {
    	method: "post",
  	})
    	.then((response) => response.json())
    	.then((google_response) => {
	//Si se verifica el captcha, automaticamente se hace envia los datos a la Base de Datos
      	if (google_response.success == true) {
        	//Obtener la fecha/hora
  			let dateRV_30406581 = new Date();
  			let hoursRV = dateRV_30406581.getHours();
  			let minutesRV = dateRV_30406581.getMinutes();
  			let secondsRV = dateRV_30406581.getSeconds();
			//Reconversión a 12 horas.
  			let formatRV = hoursRV >= 12 ? 'PM' : 'AM'; 
  			hoursRV = hoursRV % 12; 
  			hoursRV = hoursRV ? hoursRV : 12; 
  			minutesRV = minutesRV < 10 ? '0' + minutesRV : minutesRV;
  			let timeToday = hoursRV + ':' + minutesRV + ':' + secondsRV + ' ' + formatRV; //=> Hora
  			let todayDate = dateRV_30406581.getDate() + '-' + ( dateRV_30406581.getMonth() + 1 ) + '-' + dateRV_30406581.getFullYear(); //=> Fecha
			//////////////Obtener la IP publica////////////////
			let ipRV = req.headers["x-forwarded-for"];
  			if (ipRV){
    			let list = ipRV.split(",");
    			ipRV = list[list.length-1];
 			} else {
				ipRV = req.connection.remoteAddress;
  			}
			///////////////////////////////////////////
			////////////Obtener el Pais//////////////
			let XMLHttp = new XMLHttpRequest();
			XMLHttp.onreadystatechange = function(){
			if(this.readyState == 4 && this.status == 200) {
				let ipwhois = JSON.parse(this.responseText); 
				let country = ipwhois.country 
				let countryCode = ipwhois.country_code
				let clientCountry = country + '(' + countryCode + ')'
			////////////////////////////////////////////
			//Obtener los datos que ingresa el usuario
				let email = req.body.email
				let name = req.body.name
				let commentary = req.body.commentary
			////////////////////////////////////////////
			//Ingreso de los registros hacia la Base de Datos
				const sqlCreateRecords="INSERT INTO Contactos(email,name,commentary,date,hour,ipaddress,country) VALUES (?,?,?,?,?,?,?)";
				const clientData=[email,name,commentary,todayDate,timeToday,ipRV,clientCountry];
				dbAdmin.run(sqlCreateRecords, clientData, err =>{
				if (err){
					return console.error(err.message); //=> Si existe un error retorna el error
				}
				else{
					setTimeout(function(){ //=>  Temporizador para mostrar el mensaje e ingresar a la ruta
						res.redirect("/"); //=>  Si no existe algún error,el mensaje se envia.
					}, 1800);
					}
				})

		//Conexion al servidor del correo electronico
			let transporter = nodemailer.createTransport({
			host: "smtp-mail.outlook.com",
    			secureConnection: false,
    			port: 587, 
    			tls: {
       				ciphers:'SSLv3'
    			},
				auth: {
					user: process.env.EMAIL,
					pass: process.env.PASS
				}
			});
				const customerMessage = `
					<p>Programacion P2</p>
					<h3>Información del Cliente/Contacto:</h3>
					<ul>
			  		<li>Email: ${email}</li>
			  		<li>Nombre: ${name}</li>
			  		<li>Comentario: ${commentary}</li>
			  		<li>Fecha: ${todayDate}</li>
					<li>Hora: ${timeToday}</li>
					<li>IP: ${ipRV}</li>
					<li>Pais: ${clientCountry}</li>
					</ul>`;

				const receiverAndTransmitter = {
					from: process.env.EMAIL,
					to: 'programacion2ais@dispostable.com',
					subject: 'Informacion del Contacto', 
					html: customerMessage
				};
				transporter.sendMail(receiverAndTransmitter,(err, info) => {
					if(err)
						console.log(err)
					else
						console.log(info);
					})
				}
			}; //=> Llave qué cierra el "if" para obtener el pais.
	//Obtener el Pais desde la API con la IP.
	XMLHttp.open('GET', 'https://ipwho.is/' + ipRV, true); //"Variable "ipRV" => IP Publica arriba.
	XMLHttp.send();
    }else{
	//Si hay error en el reCaptcha se recarga la pagina y muestra el mensaje de JS:)
        setTimeout(function(){ //=>  Temporizador para mostrar el mensaje e ingresar a la ruta
			res.redirect("/");				
		}, 1800);
    }
    })
	//Errores de syntaxis en el Recaptcha
    .catch((error) => {
    return res.json({ error });
    });
})

//Renderizar el "index.ejs" para mostrarse
router.get('/',(req,res) => {
	res.render('index.ejs',{get:{},
	ID_ANALYTICS:process.env.ANALYTICS,
	KEY_PUBLIC:process.env.KEY_PUBLIC
})
});

module.exports = router;
