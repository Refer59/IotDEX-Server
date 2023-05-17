import { NextFunction, Request, Response } from "express"
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import Mediciones from "../model/medicionesModel.js";

export const getSensorModelBySensorID = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { sensores } = req.query

    if (!sensores)
        return next(new AppError('No se ha pasado ningun sensor por los query params del endpoint de la consulta', 400))

    let sensoresArray = []
    try {
        sensoresArray = sensores.toString().split(',')
    } catch (error: any) {
        return next(new AppError('No se pudo convertir a un array la lista de sensores proporcionada,' +
            'asegurese que haya una , despues de cada sensor', 400))
    }

    const sensorModels = await Mediciones.aggregate([
        { $match: { sensorID: { $in: sensoresArray } } },
        {
            $group: {
                _id: {
                    sensorID: "$sensorID",
                    modeloSensor: "$sensor",
                    tipo: "$tipoMedicion",
                    unidades: "$unidades"
                },
            }
        }
    ])

    res.status(200).json({
        status: 'Sucess',
        sensorModels: sensorModels.map(elemento => elemento._id)
    })
})