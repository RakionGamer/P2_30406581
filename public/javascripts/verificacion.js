function vf(){
    var in_name = document.getElementById('exampleFormControlInput1')
    var in_correo = document.getElementById('exampleFormControlInput2')
    var in_comentario = document.getElementById('exampleFormControlTextarea1')
     if (in_name.value == '' || in_correo.value == ''  || in_comentario.value == '') {
        return false;
    }
    else{
        alert('¡Su mensaje se envio con exito!');
        return true;
    }
}