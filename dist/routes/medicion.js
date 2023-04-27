import express from "express";
import { getAllMediciones } from "../controllers/mediciones.js";
const medicionesRouter = () => {
    const medicionesRouter = express.Router();
    medicionesRouter.route('')
        .get(getAllMediciones);
    return medicionesRouter;
};
export default medicionesRouter;
//# sourceMappingURL=medicion.js.map