import express from "express";
import { generateRandomData, getAllMediciones } from "../controllers/mediciones.js";

const medicionesRouter = () => {
    const medicionesRouter = express.Router()

    medicionesRouter.post('/generar', generateRandomData)

    medicionesRouter.route('')
        .get(getAllMediciones)

    return medicionesRouter
}

export default medicionesRouter