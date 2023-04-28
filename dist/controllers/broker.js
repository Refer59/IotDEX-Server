import catchAsync from "../utils/catchAsync.js";
import Mediciones from "../model/medicionesModel.js";
export const streamData = catchAsync(async (req, res, next) => {
    const streamData = req.body;
    /*
        MAC: 'E9:76:59:9B:AF:C9',
        estadoAlerta: 1,
        id: 'e00fce6868b49d25b541c0fb',
        ident: 'Mediciones',
        sensor: 1,
        timestamp: 1682639132,
        tipoMedicion: 'Temperatura',
        unidades: 'celsius',
        valor: 34.34
    */
    if (streamData && streamData.length > 0) {
        const resultado = await Mediciones.create({ ...req.body, sensorID: req.body.sensorID || req.body.MAC });
        res.status(200).json({
            status: 'Sucess',
            medicion: resultado
        });
    }
    res.status(400).json({
        status: 'No se guardo nada',
    });
});
//# sourceMappingURL=broker.js.map