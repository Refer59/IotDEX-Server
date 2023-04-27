import mongoose from "mongoose"

type SchemaTypes = {
    name: string
    id: string
    portador: string
    instalationDate: Date
    enabled: boolean
    reason: string
    sensors: string[]
}

const devicesSchema = new mongoose.Schema<SchemaTypes>({
    name: {
        type: String,
        required: [true, 'El dispositivo debe tener un nombre']
    },
    id: {
        type: String,
        unique: true,
        required: [true, 'El dispositivo debe tener un ID']
    },
    portador: {
        type: String,
        required: [true, 'El dispositivo debe tener el nombre del portador al cual fue instalado']
    },
    instalationDate: {
        type: Date,
        required: [true, 'El dispositivo debe tener una fecha de instalación']
    },
    enabled: {
        type: Boolean,
        default: false,
    },
    reason: String,
    sensors: {
        type: [String],
        default: []
    }
})

const Devices = mongoose.model('Devices', devicesSchema)

export default Devices