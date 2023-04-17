import catchAsync from "../utils/catchAsync.js";
export const streamData = catchAsync(async (req, res, next) => {
    console.log(req.body);
    res.status(200).json({
        status: 'Sucess',
        message: 'Se ha recibido el mensaje desde flespi'
    });
});
//# sourceMappingURL=broker.js.map