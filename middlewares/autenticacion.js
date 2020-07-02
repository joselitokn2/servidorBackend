var jwt = require('jsonwebtoken');

var RAIZ = require('../config/config').RAIZ;


/*

Verificar token

*/
exports.verificaToken = function(req, res, next) {

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

/*

Verificar Administrador

*/
exports.verificaAdminRole = function(req, res, next) {

        var usuario = req.usuario;
        if (usuario.role === 'ADMIN_ROLE') {
            next();
            return;
        } else {
            return res.status(401).json({
                ok: false,
                mensaje: ' No eres Administrador ',
                errors: { message: 'No tienes privilegios de administrador' }
            });

        }

    }
    /*

    Verificar Administrador o Mismo Usuario

    */
exports.verificaAdminRoleOmismoUsuario = function(req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;
    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: ' No eres Administrador ni el mismo usuario',
            errors: { message: 'No tienes privilegios de administrador ni es el mismo usuario' }
        });

    }

}