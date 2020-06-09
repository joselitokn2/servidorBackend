var jwt = require('jsonwebtoken');

var RAIZ = require('../config/config').RAIZ;


/*

Verificar token

*/
exports.verificaToken = function (req, res, next) {

    var token = req.query.token;

    jwt.verify(token, RAIZ, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: ' El token no es válido ',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();
        // res.status(200).json({
        //     ok: true,
        //     decoded: decoded
        // });
    });
}
