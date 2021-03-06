var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var medicoSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    imagen: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: [true, 'el id del hospital es obligatorio'] },
    paciente: { type: Array, ref: 'Paciente', required: false }
});

module.exports = mongoose.model("Medico", medicoSchema);