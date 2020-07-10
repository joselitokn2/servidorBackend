var express = require('express');

var app = express();



var Paciente = require('../models/paciente');


/*

Crear un nuevo paciente

 */

app.post('/', (req, res, next) => {

    var body = req.body;

    var paciente = new Paciente({
        nombre: body.nombre,
        usuario: body.usuario,
        medico: body.medico

    });
    paciente.save((err, pacienteGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: ' Error creando paciente',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            paciente: pacienteGuardado,
        });

    });


});
module.exports = app;