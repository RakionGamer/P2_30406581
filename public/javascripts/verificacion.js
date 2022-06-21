function vf(){
    var in_name = document.getElementById('exampleFormControlInput1')
    var in_correo = document.getElementById('exampleFormControlInput2')
    var in_comentario = document.getElementById('exampleFormControlTextarea1')
    var response = grecaptcha.getResponse();
    if (in_name.value == '' || in_correo.value == ''  || in_comentario.value == '') {
        return false;
    }
    else if(response.length == 0){
        document.getElementById('verify_captcha').style.opacity = "1";
        return true;
    }
    else{
        document.getElementById('verify_great').style.opacity = "1";
        document.getElementById('verify_captcha').style.opacity = "0";
        return true
    }
}


