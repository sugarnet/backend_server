
var express = require('express');
var fs = require('fs');

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

var app = express();

var fileUpload = require('express-fileupload');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', ( req, resp, next ) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    var coleccionesValidas = ['usuarios', 'hospitales', 'medicos'];
    if( coleccionesValidas.indexOf( tipo ) < 0 ) {
        return resp.status(400).json({
            ok: false,
            message: 'Debe indicar una colección válida',
            errors: {message: 'Colecciones permitidas: ' + coleccionesValidas.join(', ')}
        });

    }

    if( !req.files ) {
        return resp.status(400).json({
            ok: false,
            message: 'No hay archicos seleccionados',
            errors: {message: 'Debe seleccionar una imagen'}
        });
    }

    // obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombrePartido = archivo.name.split('.');
    var extension = nombrePartido[nombrePartido.length - 1];

    // extensiones permitidas
    var extensionesPermitidas = ['png', 'gif', 'jpeg', 'jpg'];

    if (extensionesPermitidas.indexOf(extension) < 0) {
        return resp.status(400).json({
            ok: false,
            message: 'Extensión no válida',
            errors: {message: 'Las extensiones permitidas son: ' + extensionesPermitidas.join(', ')}
        });
    }

    // definir nombre de archivo
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    // definir path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, error => {
        if (error) {
            return resp.status(500).json({
                ok: false,
                message: 'Error al mover el archivo',
                errors: error
            }); 
        }

        subirPorTipo(tipo, id, nombreArchivo, resp);

        
    });

    
});

function subirPorTipo( tipo, id, nombreArchivo, resp ) {

    switch( tipo ) {
        case 'usuarios':

            Usuario.findById(id, (error, usuario) => {

                if(!usuario) {
                    return resp.status(400).json({
                        ok: false,
                        message: 'Usuario no existe',
                        errors: {message: 'Usuario no encontrado'}
                    });
                }

                var oldPath = `./uploads/usuarios/${ usuario.img }`;

                // si existe imagen se elimina
                if( fs.existsSync(oldPath) ) {
                    fs.unlinkSync(oldPath);
                }

                usuario.img = nombreArchivo;

                usuario.save((err, usuarioUpd) => {

                    if( err ) {
                        return resp.status(500).json({
                            ok: false,
                            message: 'Error al actualizar el archivo en usuarios',
                            errors: error
                        }); 
                    }

                    usuarioUpd.password = ':)';
                    return resp.status(200).json({
                        ok: true,
                        message: 'Imagen de usuario actualizada',
                        usuario: usuarioUpd
                    });
                });
            });

            break;
        
        case 'hospitales':

            Hospital.findById(id, (error, hospital) => {
                if(!hospital) {
                    return resp.status(400).json({
                        ok: false,
                        message: 'Hospital no existe',
                        errors: {message: 'Hospital no encontrado'}
                    });
                }
                var oldPath = `./uploads/hospitales/${ hospital.img }`;

                // si existe imagen se elimina
                if( fs.existsSync(oldPath) ) {
                    fs.unlinkSync(oldPath);
                }

                hospital.img = nombreArchivo;

                hospital.save((err, hospitalUpd) => {

                    if( err ) {
                        return resp.status(500).json({
                            ok: false,
                            message: 'Error al actualizar el archivo en hospitales',
                            errors: error
                        }); 
                    }

                    return resp.status(200).json({
                        ok: true,
                        message: 'Imagen de hospital actualizada',
                        hospital: hospitalUpd
                    });
                });
            });
            
            break;

        case 'medicos':

            Medico.findById(id, (error, medico) => {
                if(!medico) {
                    return resp.status(400).json({
                        ok: false,
                        message: 'Médico no existe',
                        errors: {message: 'Médico no encontrado'}
                    });
                }
                var oldPath = `./uploads/medicos/${ medico.img }`;

                // si existe imagen se elimina
                if( fs.existsSync(oldPath) ) {
                    fs.unlinkSync(oldPath);
                }

                medico.img = nombreArchivo;

                medico.save((err, medicoUpd) => {

                    if( err ) {
                        return resp.status(500).json({
                            ok: false,
                            message: 'Error al actualizar el archivo en médicos',
                            errors: error
                        }); 
                    }

                    return resp.status(200).json({
                        ok: true,
                        message: 'Imagen de médico actualizada',
                        medico: medicoUpd
                    });
                });
            });

            break;
    }

}

module.exports = app;