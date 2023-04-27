import { NextFunction, Request, Response, RequestHandler } from "express"
import catchAsync from "../utils/catchAsync.js"
import Mediciones from "../model/medicionesModel.js"

type jsonDataType = {
    id: string
    dispositivo: string
    [key: string]: any
}

export const streamData = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const streamData: jsonDataType[] = req.body

    if (streamData && streamData.length > 0) {
        console.log(req.body)
        await Mediciones.create(req.body)
    }

    res.status(200).json({
        status: 'Sucess',
    })
})