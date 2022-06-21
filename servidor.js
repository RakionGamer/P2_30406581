const express = require("express");
const app = express();
const path = require("path");

app.use(express.static(__dirname + "/_styles"));
app.get('/', (request, response)=>{
	//Respuesta al servidor para que busque automaticamente desde la raiz el HTML
	response.sendFile(path.join(__dirname + "/index.html")); 
})
const server = app.listen(process.env.PORT || 3500); //Se abre el puerto
const portNumber = server.address().port;
console.log('port is running')
