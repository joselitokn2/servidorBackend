var express = require('express');

var app = express();

var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var middAutenticacion = require('../middlewares/autenticacion');

//var RAIZ = require('../config/config').RAIZ;

var Usuario = require('../models/usuario');
/* 

Obtener todos los usuarios

 */

app.get('/', (req, res, next) => {

    var puntero = req.query.puntero || 0;
    puntero = Number(puntero);

    Usuario.find({}, 'nombre email imagen role')
        .skip(puntero)
        .limit(5)
        .exec(

            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: ' Error cargando usuarios ',
                        errors: err
                    });
                }
                Usuario.count({}, (err, contador) => {
                    res.status(200).json({
                        ok: true,
                        usuarios,
                        total: contador
                    });

                })

            });



});



/*

Actualizar usuario

*/

app.put('/:id', middAutenticacion.verificaToken, (req, res, next) => {

    var id = req.params.id;
    var body = req.body;


    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: ' Error al buscar usuario ',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: ' El usuario con el id' + id + 'no existe',
                errors: { message: 'No existe usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: ' Error al actualizar usuario',
                    errors: err
                });
            }
            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });


    });

});



/*
 
Crear un nuevo usuario
 
 */

app.post('/', (req, res, next) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        imagen: body.imagen,
        role: body.role
    });
    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: ' Error creando usuario ',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });


});

/*

Borrar un usuario por id

 */
app.delete('/:id', middAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: ' Error al borrar usuario ',
                errors: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: ' No existe un usuario con ese id ',
                errors: { message: ' No existe un usuario con ese id ' }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });
});


module.exports = app;