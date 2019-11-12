
var express = require('express');
var mdAuthentication = require('../middlewares/authentication');
var Hospital = require('../models/hospital');

var app = express();


// =====================================================
// Obtener todos los hospitales
// =====================================================
app.get('/', ( req, resp, next ) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .exec(
        ( error, hospitales ) => {
            if (error) {
                return resp.status(500).json({
                    ok: false,
                    message: 'Error cargando hospitales!',
                    errors: error
                });
            }

            Hospital.count({}, (error, count) => {
                resp.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: count
                });

            });

    });


});


// =====================================================
// Actualizar hospital
// =====================================================
app.put('/:id', mdAuthentication.verifyToken, (req, resp) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (error, hospital) => {
        if(error) {
            return resp.status(500).json({
                ok: false,
                message: 'Error al buscar el hospital',
                errors: error
            });
        }
        if(!hospital) {
            return resp.status(400).json({
                ok: false,
                message: `El hospital con id ${ id } no existe`,
                errors: { message: 'No existe el hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save( (error, product) => {
            if (error) {
                resp.status(400).json({
                    ok: false,
                    message: 'Error al actualizar el hospital',
                    errors: error
                });
            }

            resp.status(200).json({
                ok: true,
                hospital: product,
                usuarioToken: req.usuario
            });
        } );

    });
} );



// =====================================================
// Crear hospital
// =====================================================
app.post('/', mdAuthentication.verifyToken, (req, resp) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save( (error, product) => {
        if (error) {
            return resp.status(400).json({
                ok: false,
                message: 'Error al crear el hospital!',
                errors: error
            });
        }

        resp.status(201).json({
            ok: true,
            hospital: product,
            usuarioToken: req.usuario
        });
    } );

});


// =====================================================
// Eliminar hospital
// =====================================================
app.delete('/:id', mdAuthentication.verifyToken, (req, resp) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (error, product) => {
        if (error) {
            return resp.status(500).json({
                ok: false,
                message: 'Error al borrar el hospital!',
                errors: error
            });
        }
        if (!product) {
            return resp.status(400).json({
                ok: false,
                message: 'Hospital inexistente!',
                errors: { message: 'No existe el Hospital con ese id' }
            });
        }

        resp.status(200).json({
            ok: true,
            hospital: product,
            usuarioToken: req.usuario
        });
    });

});

// ==========================================
//  Obtener Hospital por ID
// ==========================================
app.get('/:id', (req, res) => {

	var id= req.params.id;

	Hospital.findById(id).populate('usuario', 'nombre img email').exec((err, hospital) => {
		if(err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar hospital',
				errors: err });
		}

		if(!hospital) {
			return res.status(400).json({
				ok: false,
				mensaje: 'El hospital con el id '+ id + ' no existe',
				errors: { message:'No existe un hospital con ese ID' }
			});
		}
		res.status(200).json({ ok:true, hospital: hospital });
	})
});

module.exports = app;