import mongoose from "mongoose"

type SchemaTypes = {
    estadoAlerta: number
    unidades: string
    tipoMedicion: string
    id: string
    sensor: number
    valor: any
    fechaHora: Date
    sensorID: string
    generado: boolean
}

/*
   Invalida entrada de datos: La medición debe tener la fecha y hora en que fue realizada.
   La medición debe tener un valor.
   La medición debe tener el numero de referencia del sensor que lo senso.
   La medición no posee un ID de dispositivo el cual realizo la medición.
   Se le debe establecer el tipo de medición al cual corresponde
*/
const medicionesSchema = new mongoose.Schema<SchemaTypes>({
    estadoAlerta: Number,
    unidades: {
        type: String,
        lowercase: true
    },
    tipoMedicion: {
        type: String,
        lowercase: true,
        required: [true, 'Se le debe establecer el tipo de medición al cual corresponde']
    },
    id: {
        type: String,
        required: [true, 'La medición no posee un ID de dispositivo el cual realizo la medición']
    },
    sensor: {
        type: Number,
        required: [true, 'La medición debe tener el numero de referencia del sensor que lo senso']
    },
    valor: {
        type: {},
        required: [true, 'La medición debe tener un valor']
    },
    fechaHora: {
        type: Date,
        required: [true, 'La medición debe tener la fecha y hora en que fue realizada']
    },
    sensorID: {
        type: String,
        required: [true, 'El sensor de la medición debe tener un ID']
    },
    generado: Boolean
})

const Mediciones = mongoose.model('Mediciones', medicionesSchema)

export default Mediciones