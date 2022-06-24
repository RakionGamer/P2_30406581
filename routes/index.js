const express = require('express');
const router = express.Router();
const fetch = require('node-fetch'); 
const nodemailer = require('nodemailer'); //=>Modulo para enviar el correo.
//Modulos-Carpetas para la Autenticación y Validación de los Usuarios
const rootFilesApi = require("../public/javascripts/usersAuth");
const googlePassport = require("../public/javascripts/googleAuth");
const passport = require("passport");
const jwt = require("jsonwebtoken");
require('dotenv').config()
const dbAdmin = require("../public/database/db");
const flash = require('connect-flash');
router.use(flash());
/*---------------------------------------*/
/*----------------LOGIN------------------*/
/*---------------------------------------*/
/*Serialize y Deserialize*/

passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
  });

googlePassport.configGoogle();
router.get("/google", googlePassport.googleLogin);
router.get("/google/callback",
  passport.authenticate("google", {
    //Si falla la authenticacion se redirige al login:
    failureRedirect: "/login",
	failureFlash: true,
  }),
  async (req, res) => {
    const id = process.env.ID;
    const token = jwt.sign({ id: id }, process.env.JWT_SECRET);
    res.cookie("jwt", token);
    res.redirect("/contactos");
  }
);

//Renderizar el "login.ejs" para mostrarse
router.get("/login",rootFilesApi.protectRouteLogOut,(req, res) => {
	res.render("login", {
		get: {},
		alert:false,
		errores: req.flash('errors')
	});
});

//Envio POST del Login
router.post("/login", rootFilesApi.loginUser);
//Logout
router.get("/logout", rootFilesApi.logout);
/*-----------------------------------------------*/
//Envio POST del Formulario.
router.post('/', async (req,res)=>{
	/*Obtener la IP*/
	let ipRV = req.headers["x-forwarded-for"];
  	if (ipRV){
    	let list = ipRV.split(",");
    	ipRV = list[list.length-1];
 	} else {
		ipRV = undefined
  	}
	/*Obtener el Pais*/
	const getApi = await fetch(`https://ipwho.is/${ipRV}`);
	const ipwhois = await getApi.json();
	let country = ipwhois.country;
	let countryCode = ipwhois.country_code;
	let clientCountry = country + '(' + countryCode + ')'
	/*Obtener la fecha/hora*/
	let dateRV_30406581 = new Date();
	let hoursRV = dateRV_30406581.getHours();
	let minutesRV = dateRV_30406581.getMinutes();
	let secondsRV = dateRV_30406581.getSeconds();
  	/*Reconversión a 12 horas*/
	let formatRV = hoursRV >= 12 ? 'PM' : 'AM'; 
	hoursRV = hoursRV % 12; 
	hoursRV = hoursRV ? hoursRV : 12; 
	minutesRV = minutesRV < 10 ? '0' + minutesRV : minutesRV;
	let timeToday = hoursRV + ':' + minutesRV + ':' + secondsRV + ' ' + formatRV; //=> Hora
	let todayDate = dateRV_30406581.getDate() + '-' + ( dateRV_30406581.getMonth() + 1 ) + '-' + dateRV_30406581.getFullYear(); //=> Fecha
	const name = req.body.name;
  	const response_key_RV = req.body["g-recaptcha-response"];
  	const secret_key_RV = process.env.KEY_PRIVATE;
  	const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key_RV}&response=${response_key_RV}`;
	try {
		const getRecaptcha = await fetch(url, {method: "post",});
		const google_response = await getRecaptcha.json();
		//Si se verifica el captcha, automaticamente se hace envia los datos a la Base de Datos
      	if (google_response.success == true) {
				let email = req.body.email
				let name = req.body.name
				let commentary = req.body.commentary
			//Ingreso de los registros hacia la Base de Datos
				const sqlCreateRecords="INSERT INTO Contactos(email,name,commentary,date,hour,ipaddress,country) VALUES (?,?,?,?,?,?,?)";
				const clientData=[email,name,commentary,todayDate,timeToday,ipRV,clientCountry];
				dbAdmin.run(sqlCreateRecords, clientData, err =>{
				if (err){
					return console.error(err.message); //=> Si existe un error retorna el error
				}
				else{
					console.log('Mensaje enviado')
				}
				//
				res.render('index',{
					get:{},
					alert: true,
					alertTitle: "¡Tu mensaje se ha enviado!",
					alertMessage: "¿Quieres iniciar sesión?",
					alertIcon:'success',
					showConfirmButton: true,
					showCancelButton:true,
					confirmButtonColor: '#1363DF',
					cancelButtonColor: '#d33',
					confirmButtonText: 'Yes',
					timer: false,
					ruta: 'login',
					ID_ANALYTICS:process.env.ANALYTICS,
					KEY_PUBLIC:process.env.KEY_PUBLIC,
				})
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
    		}else{
				res.render('index',{
					get:{},
					alert: true,
					alertTitle: "¡Error!",
					alertMessage: "Completa el reCAPTCHA para enviar tú mensaje",
					alertIcon:'error',
					showConfirmButton: false,
  					confirmButtonText: '',
  					showCancelButton:'',
  					confirmButtonColor: '',
  					cancelButtonColor:'',
  					timer: 2300,
					ruta: '/',
					ID_ANALYTICS:process.env.ANALYTICS,
					KEY_PUBLIC:process.env.KEY_PUBLIC,
				})
    			}
	} catch (error) {
		console.log(error)
	}
})
//Renderizar el "contactos.ejs" para mostrarse
router.get('/contactos',rootFilesApi.protectRoute,(req,res)=>{
	const sql="SELECT * FROM Contactos;";
	dbAdmin.all(sql, [],(err, rows)=>{
			if (err){
			return console.error(err.message);
			}else{
			res.render("contactos.ejs",{get:rows});
			}
	})
})
//Renderizar el archivo raiz "index" para mostrarse
router.get('/',(req,res) => {
	res.render('index.ejs',{
	get:{},
	ID_ANALYTICS:process.env.ANALYTICS,
	KEY_PUBLIC:process.env.KEY_PUBLIC,
	alert:false
})});

module.exports = router;
