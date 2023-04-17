import User from "../model/userModel.js";
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import Email from "../utils/email/email.js";
import crypto from 'crypto';
export const signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        email: req.body.email,
        name: req.body.name,
        password: req.body.password,
        photo: req.body.photo,
        role: req.body.role ? req.body.role.toUpperCase() : 'USER'
    });
    try {
        //Se crean ambos tokens y se pasa el token no encriptado al link de confirmacion de creacion
        const creationToken = newUser.createCreationToken();
        const url = `${req.protocol}://${req.socket.remoteAddress}/password_creation/${creationToken}`;
        await new Email(newUser, url).sendWelcome();
        res.status(200).json({
            status: 'Sucess',
            message: 'El correo de creación de cuenta ha sido enviado a su bandeja de correos'
        });
    }
    catch (error) {
        await newUser.delete();
        res.status(500).json({
            status: 'Error',
            message: 'Creación de cuenta cancelada, no se pudo enviar el correo de confirmación'
        });
    }
});
export const signUpConfirmation = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.userId);
    if (!user && !user.accountCreationToken)
        return next(new AppError('Usuario del token no encontrado', 404));
    // Elimina el token para que ya no sirva la confirmacion de creacion de usuario 
    user.password = req.body.password;
    // Habilita la cuenta
    user.enabled = true;
    await user.save();
    user.createToken('Creación de cuenta exitosa', res);
});
export const signIn = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    // 1) Check of the user exists fields
    if (!email || !password)
        return next(new AppError('Proporcione un correo y una contraseña', 400)); //Al llamar la funcion next debemos asegurarnos que
    //la funcion signUp termina forzandola terminar con return
    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    if (user?.accountCreationToken)
        return next(new AppError('Esta cuenta aun no ha terminado su proceso de verificacion para su creacion, vaya a su bandeja de correos y busque el link', 400));
    if (user && !user.password)
        return next(new AppError('Error: Este usuario no posee contraseña, contacte con IotDEX Didcom', 500));
    if (!user || !(await user.correctPassword(password.toString(), user.password)))
        return next(new AppError('Correo o Contraseña incorrecta', 401));
    // 3 ) If everything is okay send token to the client
    user.createToken('Inicio de sesion exitosa', res);
});
export const signOut = catchAsync(async (req, res, next) => {
    const cookieOptions = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production')
        cookieOptions.secure = true;
    res.clearCookie('jwt', cookieOptions);
    res.status(200).json({
        status: 'Sucess',
        message: 'Se ha cerrado sesion'
    });
});
export const protectRoute = (onlyForRoles) => catchAsync(async (req, res, next, dataForCallback) => {
    const authorizationString = req.headers.authorization;
    let token;
    // 1) Getting the token and check if exists and if is Bearer
    if (authorizationString && authorizationString.startsWith('Bearer'))
        token = authorizationString.split(' ')[1];
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token)
        return next(new AppError('No estas conectado por favor inicie sección', 401));
    // 2 ) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    // 3) Check if the user exists, TODO Check if the Payload IP match the current req IP adress
    if (!user)
        return next(new AppError('Usuario no encontrado, se requiere de un usuario existente para acceder a esta ruta', 401));
    // 3.2 ) Check if the user has authorization to user this route <------------
    if (dataForCallback && dataForCallback.length > 0 && !dataForCallback.includes(user.role))
        return next(new AppError('Acción no autorizada', 401));
    // 4) Check if user changed password after the token was issued (expedido, publicado, enviado)
    if (user.userChangedPassword(decoded.iat))
        return next(new AppError('Recientemente se cambio la contraseña, vuelva a iniciar sesion', 401));
    req.body.user = user;
    next();
}, onlyForRoles);
export const actionPasswordConfirmation = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.body.user._id).select('+password');
    const isPasswordCorrect = await user.correctPassword(req.params.candidatePassword, user.password);
    if (!isPasswordCorrect)
        return next(new AppError('Contraseña incorrecta', 400));
    res.status(200).json({
        status: 'Sucess',
        message: 'Contraseña correcta'
    });
});
//Middleware para la confirmación de contraseña
export const passwordConfirmation = catchAsync(async (req, res, next) => {
    if (!req.body.passwordConfirm && !req.body.password)
        next(new AppError('Por favor, asegurese que haya ingresado la confirmacion de contraseña y la contraseña', 400));
    else if (req.body.passwordConfirm !== req.body.password)
        next(new AppError('Por favor asegurese que la contraseña y la confirmacion de contraseña sean iguales', 400));
    else
        next();
});
export const forgotPassword = catchAsync(async (req, res, next) => {
    // 1) check if email is given
    if (!req.body.email)
        return next(new AppError('Por favor ingrese un email', 400));
    // 2) Get user based on the given email
    const user = await User.findOne({ email: req.body.email });
    if (!user)
        return next(new AppError(`No se encontro al usuario con correo \"${req.body.email}\"`, 404));
    // 3) Generate the random reset token
    const resetToken = await user.createResetPasswordToken();
    const webUrl = 'localhost:3000';
    const resetUrl = `${req.protocol}://${webUrl}/password_reset/${resetToken}`;
    try {
        await new Email(user, resetUrl).sendPasswordForgot();
        res.status(200).json({
            status: 'Success',
            message: 'El link de cambio de contraseña se ha enviado a su correo'
        });
    }
    catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        return next(new AppError('Hubo un error al mandar la confirmacion de correo, vuelva a intentarlo mas tarde', 500));
    }
});
export const resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the userID
    const user = await User.findById(req.params.userId).select('+password');
    // 2) If token has not expired, and the user exists, set the new password
    if (!user)
        return next(new AppError('Este usuario no existe', 404));
    // Checar si la contrasea dada no es la misma que la actual
    const isTheSame = await user.correctPassword((req.body.password).toString(), user.password);
    if (isTheSame)
        return next(new AppError('La contraseña nueva es la misma que la actual, propocione otra', 400));
    const currentTime = Date.now();
    if (currentTime > user.passwordResetExpires.getTime())
        return next(new AppError('El tiempo para cambiar la contraseña a expirado, vuelva a solicitar una nueva', 500));
    user.password = req.body.password;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    // 3) Update passwordChangeDate field on the user (Esto pasa cuando el middleware pre.('save') actua)
    await user.save();
    // 4) Log the user in, send JWT
    const token = user.createToken('La contraseña se ha cambiado con exito!', res);
});
export const updatePassword = catchAsync(async (req, res, next) => {
    if (!req.body.passwordNew)
        return next(new AppError('Ingrese la nueva contraseña', 400));
    // 1) Get user from collection
    const user = await User.findById(req.body.user._id).select('+password');
    // 2) Check if POSTed current password is correct
    const isCorrect = await user.correctPassword((req.body.password).toString(), user.password);
    // 3) If the password is correct, update the password
    if (isCorrect === false)
        return next(new AppError('Contraseña de usuario incorrecta, agrege su contraseña actual correcta', 400));
    if (req.body.passwordNew === req.body.password)
        return next(new AppError('La contraseña nueva es la misma que la actual', 400));
    user.password = req.body.passwordNew;
    await user.save();
    // 4) Log user in, send JWT
    const token = user.createToken('Se ha cambiado la ontraseña exitosamente', res);
});
export const getAuthDataByAuth = catchAsync(async (req, res, next) => {
    if (req.body.user)
        res.status(200).json({
            status: 'Sucess',
            user: req.body.user
        });
    else
        return next(new AppError('No ha iniciado sesion', 401));
});
export const checkUserCreationToken = catchAsync(async (req, res, next) => {
    if (!req.params.token)
        return next(new AppError('Propocione un token de creacion de cuenta', 400));
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ accountCreationToken: hashedToken }).select('+password');
    if (!user)
        return next(new AppError('No se ha encontrado un usuario con este token', 404));
    res.status(200).json({
        status: 'Sucess',
        _id: user._id
    });
});
export const checkUserResetToken = catchAsync(async (req, res, next) => {
    if (!req.params.token)
        return next(new AppError('Propocione un token de creacion de cuenta', 400));
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ passwordResetToken: hashedToken }).select('+password');
    if (!user)
        return next(new AppError('No se ha encontrado un usuario con este token', 404));
    res.status(200).json({
        status: 'Sucess',
        _id: user._id
    });
});
//# sourceMappingURL=auth.js.map