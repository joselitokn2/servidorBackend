var express = require('express');

var app = express();

var middAutenticacion = require('../middlewares/autenticacion');

var Hospital = require('../models/hospital');
/*

Obtener todos los hospitales

 */

app.get('/', (req, res, next) => {

    var puntero = req.query.puntero || 0;
    puntero = Number(puntero);

    Hospital.find({})
        .skip(puntero)
        .limit(40)
        .populate('usuario', 'nombre email')
        .exec(

            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: ' Error cargando hospitales ',
                        errors: err
                    });
                }
                Hospital.count({}, (err, contador) => {
                    res.status(200).json({
                        ok: true,
                        hospitales,
                        total: contador
                    });
                })


            });



});
/*

Obtener un hospital por id

 */

app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre imagen email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + 'no existe',
                    errors: {
                        message: 'No existe un hospital con ese ID'
                    }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        })
});

/*

Actualizar hospital

*/

app.put('/:id', middAutenticacion.verificaToken, (req, res, next) => {

    var id = req.params.id;
    var body = req.body;


    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: ' Error al buscar hospital ',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: ' El hospital con el id' + id + 'no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;


        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: ' Error al actualizar hospital',
                    errors: err
                });
            }


            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });


    });

});



/*

Crear un nuevo hospital

 */

app.post('/', middAutenticacion.verificaToken, (req, res, next) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital


    });
    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: ' Error creando hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
        });

    });


});

/*

Borrar un hospital por id

 */
app.delete('/:id', middAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: ' Error al borrar hospital ',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: ' No existe un hospital con ese id ',
                errors: { message: ' No existe un hospital con ese id ' }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });
});


module.exports = app;