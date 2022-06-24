const GoogleStrategy = require("passport-google-oauth2");
const passport = require("passport");
require("dotenv").config();
//Array/Lista de correos validos
const emails = ["arodu.test@gmail.com","30406581opsu@gmail.com"];

exports.googleLogin = passport.authenticate("google", { scope: ["email"] });
module.exports.configGoogle = () =>{
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_ID_SECRET,
        callbackURL: "https://rakiong-p2.herokuapp.com/google/callback",
        passReqToCallback: true
      },
      function (request, accessToken, refreshToken, profile, cb) {
        const response = emails.includes(profile.emails[0].value);
        if(response){
          cb(null,profile)
        }else{
          cb(null, false, request.flash('errors', '¡Acceso denegado! Usted no es un usuario valido'));
        }
      } 
    )
  );
}



