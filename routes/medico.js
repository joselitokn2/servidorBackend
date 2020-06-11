var express = require('express');

var app = express();

var middAutenticacion = require('../middlewares/autenticacion');

var Medico = require('../models/medico');
/* 

Obtener todos los medicoes

 */

app.get('/', (req, res, next) => {
    var puntero = req.query.puntero || 0;
    puntero = Number(puntero);

    Medico.find({})
        .skip(puntero)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(

            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: ' Error cargando medicos ',
                        errors: err
                    });
                }
                Medico.count({}, (err, contador) => {
                    res.status(200).json({
                        ok: true,
                        medicos,
                        total: contador
                    });
                })


            });



});



/*

Actualizar medico

*/

app.put('/:id', middAutenticacion.verificaToken, (req, res, next) => {

    var id = req.params.id;
    var body = req.body;


    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: ' Error al buscar medico ',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: ' El medico con el id' + id + 'no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;


        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: ' Error al actualizar medico',
                    errors: err
                });
            }


            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });


    });

});



/*
 
Crear un nuevo medico
 
 */

app.post('/', middAutenticacion.verificaToken, (req, res, next) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital

    });
    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: ' Error creando medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
        });

    });


});

/*

Borrar un medico por id

 */
app.delete('/:id', middAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: ' Error al borrar medico ',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: ' No existe un medico con ese id ',
                errors: { message: ' No existe un medico con ese id ' }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });
});


module.exports = app;