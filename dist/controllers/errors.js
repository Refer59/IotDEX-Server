import AppError from "../utils/appError.js";
const handleCastErrorDB = (error) => new AppError(`El valor ${error.path} es invalido: ${error.value}`, 400);
const handleDuplicatedFieldDB = (error) => {
    const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    return new AppError(`Campo repetido con el valor ${value}, Por favor elija uno diferente`, 400);
};
const handleValidationFieldDB = (error) => {
    const errors = Object.values(error.errors).map(el => el.message);
    const message = `Invalida entrada de datos: ${errors.join('. ')}`;
    return new AppError(message, 400);
};
const handleJWTError = (name) => new AppError(name === 'JsonWebTokenError' ?
    'Token Invalida, vuelva a iniciar sesion' :
    'La sesion ha expirado, vuelva a conectarse', 400);
const sendErrorDevelopment = (res, error) => {
    console.error(error);
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        stack: error.stack
    });
};
const sendErrorProduction = (res, error) => {
    // Operational, trusted error: send message to client
    if (error.isOperational)
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message
        });
    // Programming or other unknown error, don't leak error details
    else {
        // 1) Log error 
        console.error('ERROR 💥', error);
        //Respuesta para error generico que no hayamos declarado nosotros
        res.status(500).json({
            status: 'Error',
            message: 'Algo mal ha ocurrido en la solicitud',
        });
    }
};
export const errorHandler = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'Error';
    //Podemos separar el alcance que tiene nuestra aplicacion a la hora de mostrar mensajes o no, dependiendo en que estemos trabajando
    //O si queremos ocultar los detalles del error para que no los vea cualquiera
    if (process.env.NODE_ENV === 'development')
        sendErrorDevelopment(res, error);
    else if (process.env.NODE_ENV === 'production') {
        let err = error;
        if (error.name === 'CastError')
            err = handleCastErrorDB(err);
        else if (error.code === 11000)
            err = handleDuplicatedFieldDB(err);
        else if (error.name === 'ValidationError')
            err = handleValidationFieldDB(err);
        else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')
            err = handleJWTError(error.name);
        sendErrorProduction(res, err);
    }
};
//# sourceMappingURL=errors.js.map