import catchAsync from "../utils/catchAsync.js";
import Mediciones from "../model/medicionesModel.js";
export const streamData = catchAsync(async (req, res, next) => {
    /*
    {
        dispositivo: 'Particle-Boron2',
        id: 'e00fce6868b49d25b541c0fb',
        MAC: 'E9:B5:20:7D:80:A5',
        sensor: 'P TPROBE 0003DB',
        temperatura: 25.939999,
        ident: 'Temperatura',
        timestamp: 1681839386.213977
    }
    */
    const streamData = req.body;
    if (streamData && streamData.length > 0)
        await Mediciones.create(req.body);
    res.status(200).json({
        status: 'Sucess',
    });
});
//# sourceMappingURL=broker.js.map