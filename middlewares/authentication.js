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

