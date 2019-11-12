
var express = require('express');
var bcrypt = require('bcrypt');
var mdAuthentication = require('../middlewares/authentication');
var app = express();

var Usuario = require('../models/usuario');

// =====================================================
// Obtener todos los usuarios
// =====================================================
app.get('/', ( req, resp, next ) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google')
    .skip(desde)
    .limit(5)
    .exec(
        ( error, usuarios ) => {
            if (error) {
                return resp.status(500).json({
                    ok: false,
                    message: 'Error cargando usuarios!',
                    errors: error
                });
            }

            Usuario.count({}, (error, count) => {

                resp.status(200).json({
                    ok: true,
                    usuarios: usuarios,
                    total: count
                });
            });

    });


});


// =====================================================
// Actualizar usuario
// =====================================================
app.put('/:id', [mdAuthentication.verifyToken, mdAuthentication.verifyAdminOMismoUsuario], (req, resp) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (error, usuario) => {
        if(error) {
            return resp.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: error
            });
        }
        if(!usuario) {
            return resp.status(400).json({
                ok: false,
                message: `El usuario con id ${ id } no existe`,
                errors: { message: 'No existe el usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save( (error, product) => {
            if (error) {
                resp.status(400).json({
                    ok: false,
                    message: 'Error al actualizar usuario',
                    errors: error
                });
            }

            product.password = ':)';

            resp.status(200).json({
                ok: true,
                usuario: product
            });
        } );

    });
} );



// =====================================================
// Crear usuario
// =====================================================
app.post('/', (req, resp) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save( (error, product) => {
        if (error) {
            return resp.status(400).json({
                ok: false,
                message: 'Error al crear usuario!',
                errors: error
            });
        }

        resp.status(201).json({
            ok: true,
            usuario: product,
            usuarioToken: req.usuario
        });
    } );

});

// =====================================================
// Eliminar usuario
// =====================================================
app.delete('/:id', [mdAuthentication.verifyToken, mdAuthentication.verifyADMIN], (req, resp) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (error, product) => {
        if (error) {
            return resp.status(500).json({
                ok: false,
                message: 'Error al borrar usuario!',
                errors: error
            });
        }
        if (!product) {
            return resp.status(400).json({
                ok: false,
                message: 'Usuario inexistente!',
                errors: { message: 'No existe Usuario con ese id' }
            });
        }

        resp.status(200).json({
            ok: true,
            usuario: product
        });
    });

});

module.exports = app;