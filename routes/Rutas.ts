import express from "express"
import catchAsync from "../utils/catchAsync.js"

const RutasRouter = () => {
    const RutasRouter = express.Router()

    RutasRouter.route('')
        .post(
            catchAsync(async (req, res, next) => {
                const ruta = {
                    nombre: "FernandoRuelas",
                    promedio: "100%",
                    calificacionRuta: "99",
                    viaje: "Mexico-Ensenada",
                    distancia: "50",
                    distanciaRecorrida: "50"
                }

                res.status(200).json(ruta)
            })
        )

    return RutasRouter
}

export default RutasRouter 