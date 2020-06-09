
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var RAIZ = require('../config/config').RAIZ;

var app = express();

var Usuario = require('../models/usuario');

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: ' Error al buscar usuarios',
                errors: err
            });
        }
        if (!usuarioBD) {

            return res.status(400).json({
                ok: false,
                mensaje: ' Email incorrecto ',
                errors: err
            });

        }
        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: ' Contraseña incorrecta ',
                errors: err
            });
        }

        // Crear Token /60
        usuarioBD.password = ':)';
        var token = jwt.sign({ usuario: usuarioBD }, RAIZ, { expiresIn: 14400 })



        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token

        });
    });


});


module.exports = app;