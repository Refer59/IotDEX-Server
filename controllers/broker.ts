import { NextFunction, Request, Response, RequestHandler } from "express"
import catchAsync from "../utils/catchAsync.js"
import Mediciones from "../model/medicionesModel.js"

export const streamData = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    //Flesbi manda el buffer de jsons en un array
    if (Array.isArray(req.body) && req.body.length > 0) {
        let jsonBuffer = req.body
        console.log(jsonBuffer)
        jsonBuffer = jsonBuffer.map((objeto: any) => ({ ...objeto, sensorID: objeto.MAC || objeto.sensorID }))
        await Mediciones.create(jsonBuffer)

        res.status(200).json({
            status: 'Sucess'
        })
    } else
        res.status(200).json({
            status: 'No se guardo nada'
        })
})