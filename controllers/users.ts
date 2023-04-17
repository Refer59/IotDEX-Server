import { NextFunction, Request, Response } from "express"
import User from "../model/userModel.js"
import APIFeatures from "../utils/apiFeatures.js"
import AppError from "../utils/appError.js"
import catchAsync from "../utils/catchAsync.js"
import Email from "../utils/email/email.js"

const usersController = () => {

    const getUser = (req: Request, res: Response) => {
        res.status(500).json({
            status: 'Error',
            message: 'Esta ruta aun no esta definida'
        })
    }

    return {
        getUser,
    }
}

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const userFeatures = new APIFeatures(User, req.query)
        .filtro()
        .limitFields()
        .sort()
        .paginar()
    let users = await userFeatures.query

    res.status(200).json({
        status: 'Success',
        users
    })
})

export const createUser = catchAsync(async (req: Request, res: Response) => {
    //El admin de la empresa crea un nuevo usuario
    const newUser = await User.create(req.body)

    try {
        //Se crean ambos tokens y se pasa el token no encriptado al link de confirmacion de creacion
        const creationToken = newUser.createCreationToken()
        const webUrl = 'localhost:3000'
        const url = `${req.protocol}://${webUrl}/password_creation/${creationToken}`
        await new Email(newUser, url).sendWelcome()

        res.status(200).json({
            status: 'Sucess',
            message: `El usuario ${req.body.email} ha inicializado, se le ha enviado un correo electronico a su correo para terminar el proceso de creacion`,
        })
    } catch (error) {
        await newUser.delete()
        res.status(500).json({
            status: 'Error',
            message: `Creación de cuenta cancelada, no se pudo enviar el correo de confirmación a ${req.body.email}`
        })
    }
})

export const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true, })

    if (!user)
        return next(new AppError('No se encontro el usuario que se desea editar', 404))

    res.status(200).json({
        status: 'Sucess',
        message: `Usuario ${user.name} editado`
    })
})

export const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id)

    if (!user)
        return next(new AppError('El usuario que se intenta eliminar no existe', 404))

    if (user.role === 'ADMIN')
        return next(new AppError('No se puede eliminar a otro administrador', 400))

    await user.delete()
    res.status(200).json({
        status: 'Sucess',
        message: 'Usuario Eliminado'
    })
})

//Actualiza el usuario actualmente autenticado
export const updateAuthUserPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1) Check if want to change the password, don't allow to
    if (req.body.password)
        return next(new AppError('No se puede actualizar la contraseña del usuario aqui', 400))

    // 2) Crear un nuevo objecto que tenga los fields que el array onlyFieldsAllowed tenga
    const dataFiltrada = filterObject(req.body, 'email', 'name')

    // 3) Update user document
    const updated = await User.findByIdAndUpdate(req.body.user.id, dataFiltrada, {
        new: true,
        runValidators: true, //Habilitar los validadores del modelo
    })

    res.status(200).json({
        status: 'Sucess',
        message: 'Se han actualizado los campos',
        updatedUser: updated
    })
})

export const deleteAuthUser = catchAsync(async (req: Request, res: Response) => {
    const userDisabled = await User.findByIdAndUpdate(req.body.user.id, { enabled: false })

    res.status(200).json({
        status: 'Sucess',
        message: `El usuario ${userDisabled.email} se ha desactivado`
    })
})

// El ...onlyFieldsAllowed es un ...rest parameter que permite pasar tantos strings como queramos como argumentos, solo que en la funcion
// interpretaran como array
const filterObject = (object: object, ...onlyFieldsAllowed: string[]) => {
    const filteredObject = {}
    Object.entries(object).forEach(value => {
        if (onlyFieldsAllowed.includes(value[0]))
            filteredObject[value[0]] = value[1]
    })

    return filteredObject
}

export default usersController