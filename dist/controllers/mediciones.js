import catchAsync from "../utils/catchAsync.js";
import APIFeatures from "../utils/apiFeatures.js";
import Mediciones from "../model/medicionesModel.js";
export const getAllMediciones = catchAsync(async (req, res) => {
    const features = new APIFeatures(Mediciones, req.query)
        .filtro()
        .limitFields()
        .sort()
        .paginar();
    const mediciones = await features.query;
    //JSend format
    res.status(200).json({
        status: 'Sucess',
        size: mediciones.length,
        mediciones
    });
});
//# sourceMappingURL=mediciones.js.map