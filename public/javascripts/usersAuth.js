const jwt = require("jsonwebtoken");
require("dotenv").config();
const { promisify } = require("util");
const dbAdmin = require("../database/db");

exports.loginUser = async (req, res)=>{
  try {
      let password=req.body.password
      let username=req.body.name
      const sql_read="SELECT * FROM users where username='"+username+"' and password='"+password+"';";
          dbAdmin.all(sql_read,(err,data) => {
              if(!err){
                  if(data.length == 1){
                    const id = process.env.ID;
                    const token = jwt.sign({ id: id }, process.env.JWT_SECRET);
                    res.cookie('jwt',token)
                    res.render('login',{
                      get: {},
                      alert: true,
                      alertTitle: "Conexión exitosa",
                      alertMessage: "¡Usted ingreso de manera correcta!",
                      alertIcon:'success',
                      showConfirmButton:false,
                      timer:2000,
                      ruta:'contactos',
                      errores: req.flash('errors')
                    })
              }else{
                  //Si no coindice arroja error.
                  res.render('login', {
                    get:{},
                    alert: true,
                    alertTitle: "!Ha ocurrido un error¡",
                    alertMessage: "Usuario y/o Password Incorrectas",
                    alertIcon:'error',
                    showConfirmButton:false,
                    timer:2000,
                    ruta: 'login',
                    errores: req.flash('errors') 
                })
              }
          }else{
              //Errores de dbAdmin
              return res.send('error');
          }
      })
      } catch (error) {
          console.log(error)
      }
}


/*Autorizacion de la ruta..*/
exports.protectRoute = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const tokenAuthorized = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);
      if (tokenAuthorized) {
        return next();
      }
      req.user = process.env.ID;
    } catch (error) {
      console.log(error);
      return next();
    }
  } else {
    res.redirect("/login");
  }
};

/*Despues que el usuario ingresa no puede devolverse al login*/
exports.protectRouteLogOut = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const tokenAuthorized = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);
      if (tokenAuthorized) {
        res.redirect('/contactos')
      }
      req.user = process.env.ID;
    } catch (error) {
      console.log(error);
      res.redirect('/contactos')
    }
  } else {
    return next()
  }
};
/*Cerrar sesion*/
exports.logout = (req, res) => {
  res.clearCookie("jwt");
  return res.redirect("/login");
};
