import { NextFunction, Request, Response, RequestHandler } from "express"
import catchAsync from "../utils/catchAsync.js"

export const streamData = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)

    res.status(200).json({
        status: 'Sucess',
        message: 'Se ha recibido el mensaje desde flespi'
    })
})