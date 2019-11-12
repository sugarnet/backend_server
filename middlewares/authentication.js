var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// =====================================================
// Revisar token
// =====================================================
exports.verifyToken = function(req, resp, next) {
    var token = req.query.token;

    jwt.verify(token, SEED, (error, decoded) => {
        if (error) {
            return resp.status(401).json({
                ok: false,
                message: 'Token incorrecto!',
                errors: error
            });
        }

        req.usuario = decoded.usuario;
        next();

        
    });
};

// =====================================================
// Revisar ADMIN
// =====================================================
exports.verifyADMIN = function(req, resp, next) {

    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
       
        return resp.status(401).json({
            ok: false,
            message: 'Token incorrecto - No es ADMINISTRADOR',
            errors: { message: 'No es Administrador, no puede hacer eso' }
        });
           
    }

};


// =====================================================
// Revisar ADMIN o mismo usuario
// =====================================================
exports.verifyAdminOMismoUsuario = function(req, resp, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
       
        return resp.status(401).json({
            ok: false,
            message: 'Token incorrecto - No es ADMINISTRADOR',
            errors: { message: 'No es Administrador, no puede hacer eso' }
        });
           
    }


    
};

