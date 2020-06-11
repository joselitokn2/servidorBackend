var express = require('express');

var app = express();


const path = require('path');
const fs = require('fs');

app.get('/:tipo/:imagen', (req, res, next) => {

    var tipo = req.params.tipo;
    var imagen = req.params.imagen;

    pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${imagen}`);
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        var pathNoImagen = path.resolve(__dirname, '../assets/noimage.png');
        res.sendFile(pathNoImagen);
    }

});
module.exports = app;