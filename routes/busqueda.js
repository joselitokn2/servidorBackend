var express = require('express');

var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');
//
// BUSQUEDA POR COLECCIONES
//
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Solo se puede buscar por usuarios, medicos y hospitales',
                error: { message: 'La collección no existe' }
            });
    }
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
                //resultado del campo tabla
        });
    })
});


//
// BUSQUEDA GENERAL
//
app.get('/todo/:busqueda', (req, res, next) => {


    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });

});

function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email imagen')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales');
                } else {
                    resolve(hospitales);
                }
            });

    });

}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email imagen')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar Medicos');
                } else {
                    resolve(medicos);
                }
            });

    });

}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role imagen')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuario) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuario);
                }
            })

    });

}

module.exports = app;