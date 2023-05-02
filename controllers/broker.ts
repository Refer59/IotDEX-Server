import { NextFunction, Request, Response, RequestHandler } from "express"
import catchAsync from "../utils/catchAsync.js"
import Mediciones from "../model/medicionesModel.js"

export const streamData = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (Array.isArray(req.body) && req.body.length > 0) {
        console.log(req.body)
        await Mediciones.create(req.body)

        res.status(200).json({
            status: 'Sucess'
        })
    } else
        res.status(200).json({
            status: 'No se guardo nada'
        })
})