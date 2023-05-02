import { NextFunction, Request, Response, RequestHandler } from "express"
import catchAsync from "../utils/catchAsync.js";
import APIFeatures from "../utils/apiFeatures.js";
import AppError from "../utils/appError.js";
import Mediciones from "../model/medicionesModel.js";

export const getAllMediciones = catchAsync(async (req: Request, res: Response) => {
    const features = new APIFeatures(Mediciones, req.query)
        .filtro()
        .limitFields()
        .sort()
        .paginar()
    const mediciones = await features.query

    //JSend format
    res.status(200).json({
        status: 'Sucess',
        size: mediciones.length,
        mediciones
    })
})

export const generateRandomData = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.rango || !Array.isArray(req.body.rango) || req.body?.rango?.length !== 2)
        return next(new AppError('No se proporciono un valor de rango adecuado', 400))

    const cantidad = req.body?.cantidad
    const [min, max] = req.body?.rango

    if (!cantidad || cantidad <= 0)
        return next(new AppError('No se proporciono numero adecuado de generaciones', 400))

    if (!req.body.fechaHora)
        return next(new AppError('No se proporciono una fecha', 400))

    let mediciones = []
    const sensorID = req.body.MAC || req.body.sensorID
    let fechaHora: Date = new Date(req.body.fechaHora)
    for (let index = 0; index < cantidad; index++) {
        fechaHora = new Date(fechaHora.getTime() + (1000 * 10))
        mediciones.push(await Mediciones.create({ ...req.body, fechaHora, sensorID, valor: Math.random() * (max - min) + min }))
    }

    res.status(200).json({
        status: 'Sucess',
        size: mediciones.length,
        mediciones
    })
})