import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import validator from 'validator'
import jwt from 'jsonwebtoken'
import cryto from 'crypto'
import { NextFunction, Request, Response } from "express"

type userSchemaTypes = {
    name: string
    email: string
    photo: string
    phone: number
    role: string
    workingDays: number[]
    workingTime: { from: string, to: string }
    password: string
    passwordChangeDate: Date
    passwordResetToken: string
    passwordResetExpires: Date
    accountCreationToken: string
    enabled: boolean
    correctPassword: (candidatePassword: string, userPassword: string) => Promise<boolean>
    userChangedPassword: (JWTokenDate: number) => boolean
    createToken: (message: string, res: Response, expiresIn?: string) => void
    createResetPasswordToken: () => Promise<string>
    createCreationToken: () => string
}

const userSchema = new mongoose.Schema<userSchemaTypes>({
    name: {
        type: String,
        required: [true, 'Ingrese un nombre de usuario']
    },
    email: {
        type: String,
        required: [true, 'Ingrese un correo electronico'],
        unique: true,
        lowercase: true,
        validate: {
            validator: (value: string) => validator.default.isEmail(value),
            message: 'Debe ingresar un formato de correo valido'
        }
    },
    photo: String,
    phone: Number,
    role: {
        type: String,
        uppercase: true,
        enum: ['INDEFINIDO', 'CHOFER', 'MECANICO', 'ELECTRICO', 'ADMINISTRADOR', 'SUPER-ADMIN'],
        default: 'INDEFINIDO'
    },
    workingDays: {
        type: [Number],
        default: undefined
    },
    workingTime: {
        from: String,
        to: String
    }
    , password: {
        type: String,
        //required: [true, 'Ingrese una contraseña'],
        minLength: [8, 'La contraseña debe tener al menos 8 caracteres'],
        select: false,
    },
    passwordChangeDate: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    accountCreationToken: String,
    enabled: {
        type: Boolean,
        default: false,
        select: false,
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

// /^find/ para todas las consultas que empiecen con el nombre find
// Hace que a la hora de consultar un usuario solo se muestren los que estan activados
userSchema.pre(/^find/, async function (next) {
    // Solo retornara el documento si la cuenta esta habilitada o si esta en proceso de creacion 
    // (tiene un token de creacion pendiente de consumir)
    //@ts-ignore
    this.find({ $or: [{ enabled: true }, { accountCreationToken: { $exists: true, $ne: null } }] })
    next()
})

//Este middleware funciona cuando se usa create() o save()
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next()

    this.password = await bcrypt.hash(this.password.toString(), 12)
    next()
})

userSchema.pre('save', function (next) {
    if (this.isModified('password') && this.accountCreationToken) {
        this.accountCreationToken = undefined
        return next()
    }

    if (!this.isModified('password') || this.isNew)
        return next()

    this.passwordChangeDate = new Date(Date.now() - 1000)
    next()
})

userSchema.methods.correctPassword = async (candidatePassword: string, userPassword: string) =>
    await bcrypt.compare(candidatePassword, userPassword)

userSchema.methods.userChangedPassword = function (JWTokenDate: number) {
    if (this.passwordChangeDate) {
        const changeTime = this.passwordChangeDate.getTime() / 1000 | 0
        return JWTokenDate < changeTime
    }
    //Retorna falso SI NO se cambio la contraseña
    return false
}

userSchema.methods.createToken = function (message: string, res: Response, expiresIn?: string) {
    //Crea el token
    const token = jwt.sign({ id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: expiresIn || process.env.JWT_EXPIRES_IN })

    const cookieOptions: any = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: 'none'
    }
    this.password = undefined
    this.__v = undefined
    if (process.env.NODE_ENV === 'production')
        cookieOptions.secure = true
    res.cookie('jwt', token, {})

    const sendObject = {
        status: 'Success',
        message: message || undefined
    }
    res.status(200).json({
        ...sendObject,
        user: this,
        token
    })
}

userSchema.methods.createCreationToken = function () {
    let creationToken = ''

    if (!this.enabled) {
        creationToken = cryto.randomBytes(32).toString('hex')
        this.accountCreationToken = cryto.createHash('sha256').update(creationToken).digest('hex')
        this.save()
    }

    return creationToken
}

userSchema.methods.createResetPasswordToken = function () {
    return new Promise<string>(async (resolve, reject) => {
        //passwordResetToken No encriptado
        const resetToken = cryto.randomBytes(32).toString('hex')
        //passwordResetToken encriptado
        this.passwordResetToken = cryto.createHash('sha256').update(resetToken).digest('hex')

        this.passwordResetExpires = new Date(Date.now() + ((1000 * 60 * 10) | 0))
        await this.save()

        //Se envia el token no encriptado
        resolve(resetToken)
    })
}

const User = mongoose.model<userSchemaTypes>('User', userSchema)

export default User