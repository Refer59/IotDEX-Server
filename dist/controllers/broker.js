import catchAsync from "../utils/catchAsync.js";
import Mediciones from "../model/medicionesModel.js";
export const streamData = catchAsync(async (req, res, next) => {
    if (Array.isArray(req.body) && req.body.length > 0) {
        console.log(req.body);
        await Mediciones.create(req.body);
        res.status(200).json({
            status: 'Sucess'
        });
    }
    else
        res.status(200).json({
            status: 'No se guardo nada'
        });
});
//# sourceMappingURL=broker.js.map