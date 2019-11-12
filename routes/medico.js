
var express = require('express');
var mdAuthentication = require('../middlewares/authentication');
var Medico = require('../models/medico');

var app = express();


// =====================================================
// Obtener todos los médicos
// =====================================================
app.get('/', ( req, resp, next ) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .populate('hospital')
    .exec(
        ( error, medicos ) => {
            if (error) {
                return resp.status(500).json({
                    ok: false,
                    message: 'Error cargando médicos!',
                    errors: error
                });
            }

            Medico.count({}, (error, count) => {

                resp.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: count
                });
            });

    });


});

// =====================================================
// Obtener médico
// =====================================================
app.get('/:id', (req, resp) => {
	var id = req.params.id;

	Medico.findById(id)
		.populate('usuario', 'nombre email img')
		.populate('hospital')
		.exec((error, medico) => {
			if(error) {
	            return resp.status(500).json({
	                ok: false,
	                message: 'Error al buscar el médico',
	                errors: error
	            });
	        }
	        if(!medico) {
	            return resp.status(400).json({
	                ok: false,
	                message: `El médico con id ${ id } no existe`,
	                errors: { message: 'No existe el médico con ese ID' }
	            });
	        }

	        return resp.status(200).json({
	                ok: true,
	                medico: medico
	            });
		});
});
// =====================================================
// Actualizar médico
// =====================================================
app.put('/:id', mdAuthentication.verifyToken, (req, resp) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (error, medico) => {
        if(error) {
            return resp.status(500).json({
                ok: false,
                message: 'Error al buscar el médico',
                errors: error
            });
        }
        if(!medico) {
            return resp.status(400).json({
                ok: false,
                message: `El médico con id ${ id } no existe`,
                errors: { message: 'No existe el médico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save( (error, product) => {
            if (error) {
                resp.status(400).json({
                    ok: false,
                    message: 'Error al actualizar el médico',
                    errors: error
                });
            }

            resp.status(200).json({
                ok: true,
                medico: product,
                usuarioToken: req.usuario
            });
        } );

    });
} );



// =====================================================
// Crear médico
// =====================================================
app.post('/', mdAuthentication.verifyToken, (req, resp) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save( (error, product) => {
        if (error) {
            return resp.status(400).json({
                ok: false,
                message: 'Error al crear el médico!',
                errors: error
            });
        }

        resp.status(201).json({
            ok: true,
            medico: product,
            usuarioToken: req.usuario
        });
    } );

});


// =====================================================
// Eliminar medico
// =====================================================
app.delete('/:id', mdAuthentication.verifyToken, (req, resp) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (error, product) => {
        if (error) {
            return resp.status(500).json({
                ok: false,
                message: 'Error al borrar el médico!',
                errors: error
            });
        }
        if (!product) {
            return resp.status(400).json({
                ok: false,
                message: 'médico inexistente!',
                errors: { message: 'No existe el médico con ese id' }
            });
        }

        resp.status(200).json({
            ok: true,
            medico: product,
            usuarioToken: req.usuario
        });
    });

});

module.exports = app;