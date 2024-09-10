const express = require("express");
const mysql = require("mysql");
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: './.env' });

const app = express();

//conecta con la base de datos
const DataBase = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    pasword: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})
//__dirname es una variable de nodejs que te da acseso a el directorio en el que estas.
const PublicDirectory = path.join(__dirname, './public');
app.use(express.static(PublicDirectory)); //indica a la aplicacion que utilice el directorio con el css y este mismo.

//Parse URL-encoded bodies (as sent by HTML forms) que significa eso? jsjsjs
app.use(express.urlencoded({ extended: false }));
//Parse JSON bodies (as sent by API clients)
app.use(express.json());

//establece el framework que vamos a usar para el HTML
app.set('view engine', 'hbs');
/*Es un sistema de plantillas Javascript basado en Mustache Templates. 
Mantiene separados el código y la vista. Permite generar HTML a partir de objetos con datos en formato JSON.
Preguntar al profe que caranchos es este bicho porque no le entinedo ni la definicion, yo aca no veo nigun objeto de nada.*/

DataBase.connect( (error) => {
    if(error) {
        console.log(error);                                                        
    }
    else {
        console.log("MySQL conected....");
    }
})

//define routes. Acordate de preguntar por lo de definir rutas
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

//establece el puerto en que ejecuta todo esto
app.listen(5001, ()=>{
    console.log("Server started on port 5001");
})