import mongoose, { Schema, SchemaType } from "mongoose"
import Types from 'mongoose'

/*
    {
        dispositivo: 'Particle-Boron2',
        id: 'e00fce6868b49d25b541c0fb',
        MAC: 'E9:B5:20:7D:80:A5',
        sensor: 'P TPROBE 0003DB',
        temperatura: 25.939999,
        ident: 'Temperatura',
        timestamp: 1681839386.213977
    }
*/

type SchemaTypes = {
    tipoMedicion: string
    id: string
    sensor: number
    valor: any
    fecha: Date
    MAC: string
}

const medicionesSchema = new mongoose.Schema<SchemaTypes>({
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
})

const Mediciones = mongoose.model('Mediciones', medicionesSchema)

export default Mediciones