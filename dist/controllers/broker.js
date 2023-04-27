import catchAsync from "../utils/catchAsync.js";
import Mediciones from "../model/medicionesModel.js";
export const streamData = catchAsync(async (req, res, next) => {
    const streamData = req.body;
    if (streamData && streamData.length > 0) {
        console.log(req.body);
        await Mediciones.create(req.body);
    }
    res.status(200).json({
        status: 'Sucess',
    });
});
//# sourceMappingURL=broker.js.map