import mongoose from "mongoose"

type SchemaTypes = {
    tipoMedicion: string
    id: string
    sensor: number
    valor: any
    fecha: Date
    MAC: string
    sensorID: string,
}

/*
type SchemaTypes = {
    MAC: string
    dispositivo: string
    estadoAlerta: number
    timestamp: number
    sensor: number
    tipoMedicion: string
    unidades: string
    valor: any
}
*/

const medicionesSchema = new mongoose.Schema<SchemaTypes>({
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
    MAC: String,
    sensorID: String,
})

const Mediciones = mongoose.model('Mediciones', medicionesSchema)

export default Mediciones