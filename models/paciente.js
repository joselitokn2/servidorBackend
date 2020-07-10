var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pacienteSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    imagen: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    medico: { type: Schema.Types.ObjectId, ref: 'Medico', required: [true, 'el id del medico es obligatorio'] }
});

module.exports = mongoose.model("Paciente", pacienteSchema);