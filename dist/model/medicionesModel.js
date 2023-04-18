import mongoose from "mongoose";
const medicionesSchema = new mongoose.Schema({
    tipoMedicion: {
        type: String,
        lowercase: true,
        require: true
    },
    id: {
        type: String,
        require: true
    },
    sensor: {
        type: Number,
        require: true
    },
    valor: {
        type: {},
        require: true
    },
    fechaHora: {
        type: Date,
        require: true
    },
    MAC: {
        type: String,
        required: true
    }
});
const Mediciones = mongoose.model('Mediciones', medicionesSchema);
export default Mediciones;
//# sourceMappingURL=medicionesModel.js.map