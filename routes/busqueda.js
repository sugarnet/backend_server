
var express = require('express');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

var app = express();


// ==============================================
// Búsqueda Específica
// ==============================================
app.get('/coleccion/:tabla/:busqueda', ( req, resp, next ) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    var promise;

    switch(tabla) {
        case 'usuarios':
                promise = buscarUsuarios(regex);
                break;

            case 'hospitales':
                promise = buscarHospitales(regex);
                break;

            case 'medicos':
                promise = buscarMedicos(regex);
                break;

            default:
                return resp.status(400).json({
                            ok: false,
                            message: 'Los tipos de búsqueda son usuarios, hospitales y médicos',
                            error: {message: 'Tipo de tabla/coleccion no válido'}
                        });
    }

    promise.then( result => {
        resp.status(200).json({
            ok: true,
            message: 'Petición realizada correctamente',
            [tabla]: result
        });
    } );


});

// ==============================================
// Búsqueda Completa
// ==============================================
app.get('/todo/:busqueda', ( req, resp, next ) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
            buscarHospitales(regex),
            buscarMedicos(regex),
            buscarUsuarios(regex)
        ])
        .then(respuestas => {
            resp.status(200).json({
                ok: true,
                message: 'Petición realizada correctamente',
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });


});

function buscarHospitales( regex ) {

    return new Promise((resolve, reject) => {

        Hospital.find({nombre: regex})
                .populate('usuario', 'nombre email img')
                .exec((error, hospitales) => {
                    if(error) {
                        reject('Error al obtener los hospitales', error);
                    } else {
                        resolve(hospitales);
                    }
                });

    });
}

function buscarMedicos( regex ) {

    return new Promise((resolve, reject) => {

        Medico.find({nombre: regex})
            .populate('usuario', 'nombre email img')
            .populate('hospital')
            .exec((error, medicos) => {
                if(error) {
                    reject('Error al obtener los médicos', error);
                } else {
                    resolve(medicos);
                }
            });

    });
}

function buscarUsuarios( regex ) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role img')
              .or([{ nombre: regex }, { email: regex }])
              .exec((error, usuarios) => {
                  if(error) {
                      reject('Error al obtener usuarios', error);
                  } else {
                      resolve(usuarios);
                  }
              });

    });
}

module.exports = app;