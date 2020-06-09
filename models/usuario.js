var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un role permnitido'
}

var usuarioSchema = new Schema({

    nombre: { type: String, required: [true, "Se necesita el nombre"] },
    email: { type: String, unique: true, required: [true, "Se necesita la dirección de correo"] },
    password: { type: String, required: [true, "Se necesita la contraseña"] },
    imagen: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos }

});
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

module.exports = mongoose.model('Usuario', usuarioSchema);
