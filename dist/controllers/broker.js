import catchAsync from "../utils/catchAsync.js";
import Mediciones from "../model/medicionesModel.js";
export const streamData = catchAsync(async (req, res, next) => {
    const streamData = req.body;
    if (streamData && streamData.length > 0) {
        streamData.forEach(async (medicion) => {
            const resultado = await Mediciones.create({ ...medicion, sensorID: medicion.sensorID || medicion.MAC });
            res.status(200).json({
                status: 'Sucess',
                medicion: resultado
            });
        });
    }
    else
        res.status(400).json({
            status: 'No se guardo nada',
        });
});
//# sourceMappingURL=broker.js.map