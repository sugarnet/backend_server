var express = require('express');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// Google
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = require('../config/config').CLIENT_ID;

var app = express();

var Usuario = require('../models/usuario');

// =============================
// Login google
// =============================
var client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  // const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];

  return {
      nombre: payload.name,
      email: payload.email,
      img: payload.picture,
      google: true
  };
}

app.post('/google', async(req, resp) => {

    var token = req.body.token;

    var googleUser = await verify(token).catch(e => {
        return resp.status(403).json({
            ok: false,
            message: 'Token no válido!'
        });
    });

    Usuario.findOne( {email: googleUser.email}, (error, product) => {

        if(error) {
            return resp.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: error
            });
        }

        if( product ) {
            
            if( !product.google ) {
                return resp.status(400).json({
                    ok: false,
                    message: 'Debe usar la autenticación normal'
                });
            } else {
                // crear tokem
                var token = jwt.sign({usuario: product}, SEED, {expiresIn: 14400});

                resp.status(200).json({
                    ok: true,
                    usuario: product,
                    token: token,
                    id: product.id
                });
            }
        } else {
            // el user no existe, hay que crearlo...
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save( (error, product) => {
                if(error) {
                    return resp.status(500).json({
                        ok: false,
                        message: 'Error al buscar usuario',
                        errors: error
                    });
                }

                // crear tokem
                var token = jwt.sign({usuario: product}, SEED, {expiresIn: 14400});

                resp.status(200).json({
                    ok: true,
                    usuario: product,
                    token: token,
                    id: product.id
                });
            } );
        }
    } );
});

// =============================
// Login normal
// =============================
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