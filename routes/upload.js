var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //Tipos de colecciones

    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: ' Tipo de colección no válida ',
            errors: { message: 'El tipo de colección no es válida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: ' No selecciono nada ',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener nombre de archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //Extensiones permitidas

    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg', 'svg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: ' Extension no valida ',
            errors: { message: 'La extensiones validas son ' + extensionesValidas.join(',') }
        });
    }
    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // Movemos el archivo a un path especifico
    var path = `./uploads/${tipo}/${nombreArchivo}`

    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            })
        }
        subirPorTipo(tipo, id, nombreArchivo, res)

    })


});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: ' No existe ese usuario',
                    errors: { message: 'No existe ese usuario' }
                });
            }
            var pathUsado = './uploads/usuarios/' + usuario.imagen;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathUsado)) {
                fs.unlink(pathUsado);
            }
            usuario.imagen = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: ' Imagen de usuario actualizada ',
                    usuario: usuarioActualizado
                });
            });
        });

    }
    if (tipo === 'medicos') {


        Medico.findById(id, (err, medico) => {
            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    mensaje: ' No existe ese medico',
                    errors: { message: 'No existe ese medico' }
                });
            }
            var pathUsado = './uploads/medicos/' + medico.imagen;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathUsado)) {
                fs.unlink(pathUsado);
            }
            medico.imagen = nombreArchivo;
            medico.save((err, medicoActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: ' Imagen de medico actualizada ',
                    medico: medicoActualizado
                });
            });
        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    mensaje: ' No existe ese hospital',
                    errors: { message: 'No existe ese hospital' }
                });
            }
            var pathUsado = './uploads/hospitales/' + hospital.imagen;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathUsado)) {
                fs.unlink(pathUsado);
            }
            hospital.imagen = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {

                return res.status(200).json({
                    ok: true,
                    hospital: hospitalActualizado,
                    mensaje: ' Imagen de hospital actualizada ',

                });
            });
        });
    }

}
module.exports = app;