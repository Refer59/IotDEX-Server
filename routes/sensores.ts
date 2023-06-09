import express from "express";
import { getSensorModelBySensorID } from "../controllers/sensores.js";

const sensoresRouter = () => {
    const sensoresRouter = express.Router()

    sensoresRouter.get('/getSensorModelBySensorID', getSensorModelBySensorID)

    return sensoresRouter
}



export default sensoresRouter