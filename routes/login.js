var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var RAIZ = require('../config/config').RAIZ;

var app = express();

var middAutenticacion = require('../middlewares/autenticacion');

var Usuario = require('../models/usuario');
// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

/* RENOVAR TOKEN */

app.get('/renovartoken', middAutenticacion.verificaToken, (req, res) => {

    var token = jwt.sign({ usuario: req.usuario }, RAIZ, { expiresIn: 14400 }); // 4 horas

    res.status(200).json({
        ok: true,
        token: token
    });

});



/* AUTENTIFICACION DE GOOGLE */

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        imagen: payload.picture,
        google: true
    }
}


app.post('/google', async(req, res) => {

    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no válido'
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: ' Error al buscar usuarios',
                errors: err
            });
        }

        if (usuario) {
            if (usuario.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticación normal'
                });
            } else {
                var token = jwt.sign({ usuario: usuario }, RAIZ, { expiresIn: 14400 }) // 4 horas
                res.status(200).json({
                    ok: true,
                    usuario: usuario,
                    token: token,
                    id: usuario._id,
                    menu: obtenerMenu(usuario.role)

                });

            }
        } else {
            //No existe el usuario, lo creamos
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.imagen = googleUser.picture;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioBD) => {
                var token = jwt.sign({ usuario: usuarioBD }, RAIZ, { expiresIn: 14400 })
                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD._id,
                    menu: obtenerMenu(usuarioBD.role)

                });

            });
        }
    });


});



/* AUTENTIFICACION NORMAL */


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
            token: token,
            menu: obtenerMenu(usuarioBD.role)

        });
    });


});

function obtenerMenu(role) {
    var menu = [{
            titulo: 'Principal',

            icono: 'mdi mdi-hospital',
            /*   icono: 'mdi mdi-gauge', */
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Gráficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'Rxjs', url: '/rxjs' },
            ],
        },
        {
            titulo: 'Administrador',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                //  { titulo: 'Usuarios', url: '/usuarios' },
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Medicos', url: '/medicos' },
            ],
        },
    ];
    if (role === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }

    return menu;
}


module.exports = app;