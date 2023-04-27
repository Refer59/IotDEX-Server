import catchAsync from "../utils/catchAsync.js";
import APIFeatures from "../utils/apiFeatures.js";
import Devices from "../model/deviceModel.js";
import AppError from "../utils/appError.js";
export const getAllDevices = catchAsync(async (req, res) => {
    const features = new APIFeatures(Devices, req.query)
        .filtro()
        .limitFields()
        .sort()
        .paginar();
    const devices = await features.query;
    //JSend format
    res.status(200).json({
        status: 'Sucess',
        size: devices.length,
        devices
    });
});
export const createDevice = catchAsync(async (req, res) => {
    const resultado = await Devices.create(req.body);
    res.status(200).json({
        status: 'Sucess',
        message: `El dispositivo ${resultado.name} se ha registrado con exito`
    });
});
export const updateDevice = catchAsync(async (req, res, next) => {
    if (req.body.id || req.body.instalationDate)
        return next(new AppError('No esta permitido cambiar el ID ni la fecha de instalacion del dispositivo una vez creado', 400));
    const device = await Devices.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, runValidators: true });
    if (!device)
        return next(new AppError('El dispositivo que se quizo actualizar no existe', 404));
    res.status(200).json({
        status: 'Sucess',
        message: `Se actualizo el dispositivo ${device.name}`,
        device
    });
});
export const deleteDevice = catchAsync(async (req, res, next) => {
    const device = await Devices.findOneAndDelete({ id: req.params.id });
    if (!device)
        return next(new AppError('El dispositivo que se quizo eliminar no existe', 404));
    res.status(200).json({
        status: 'Sucess',
        message: `Se elimino el dispositivo ${device.name}`
    });
});
//# sourceMappingURL=devices.js.map