import express from 'express';
import morgan from 'morgan';
import { errorHandler } from './controllers/errors.js';
import usersRouter from './routes/users.js';
import AppError from './utils/appError.js';
import rateLimit from 'express-rate-limit';
import mongoSanitizer from 'express-mongo-sanitize';
import xss from 'xss-clean';
import helmet from 'helmet';
import hpp from 'hpp';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();
//Security HTTP Headers
app.use(helmet());
if (process.env.NODE_ENV === 'development')
    app.use(morgan('dev'));
const limiter = rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message: 'Demaciadas peticiones realizadas, intente mas tarde'
});
//Limit request from same IP
app.use('/api', limiter);
//Si tenemos un body mayor a 10kb no sera aceptado
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
//Data sanitizacion contra NOSQL injection
app.use(mongoSanitizer());
//Data sanizitation contra XSS
app.use(xss());
//Previene parameter pollution
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}));
app.options('*', cors());
app.use('/api/v1/users', usersRouter());
//Error handler para ruta no definidas
app.all('*', (req, res, next) => {
    next(new AppError(`Ruta (${req.originalUrl}) no encontrada`, 404));
});
//Global Error handler Middleware 
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map