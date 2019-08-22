var express = require('express');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

app.post('/', (req, resp) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (error, product) => {

        if(error) {
            return resp.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: error
            });
        }

        if(!product) {
            return resp.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas - email',
                errors: error
            });
        }

        if(!bcrypt.compareSync(body.password, product.password)) {
            return resp.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas - password',
                errors: error
            });
        }

        // crear tokem
        var token = jwt.sign({usuario: product}, SEED, {expiresIn: 14400});

        product.password = ':)';
        resp.status(200).json({
            ok: true,
            usuario: product,
            token: token,
            id: product.id
        });
    });

});

module.exports = app;