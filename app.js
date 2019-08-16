// requires
var express = require('express');
var mongoose = require('mongoose');

// inicializar variables
var app = express();

// conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', ( error, response ) => {

    if (error) throw error;
    
    console.log('Base de datos \x1b[32m%s\x1b[0m', 'online');

});

// rutas
app.get('/', ( req, resp, next ) => {

    resp.status(200).json({
        ok: true,
        message: 'Petición realizada correctamente'
    });
});

// escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000 \x1b[32m%s\x1b[0m', 'online');
});