import express from 'express'
import morgan from 'morgan'
import { errorHandler } from './controllers/errors.js'
import usersRouter from './routes/users.js'
import AppError from './utils/appError.js'
import rateLimit from 'express-rate-limit'
import mongoSanitizer from 'express-mongo-sanitize'
import xss from 'xss-clean'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import brokerRouter from './routes/broker.js'
import medicionesRouter from './routes/medicion.js'
import devicesRouter from './routes/devices.js'
import sensoresRouter from './routes/sensores.js'

const app = express()
//Security HTTP Headers
app.use(helmet())

if (process.env.NODE_ENV === 'development')
    app.use(morgan('dev'))

const limiter = rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message: 'Demaciadas peticiones realizadas, intente mas tarde'
})
//Limit request from same IP
app.use('/api', limiter)

//Si tenemos un body mayor a 10kb no sera aceptado
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())
//Data sanitizacion contra NOSQL injection
app.use(mongoSanitizer())
//Data sanizitation contra XSS
app.use(xss())

var allowedOrigins = [
    'http://localhost:3000',
    'https://iotdex-web.web.app'
]
app.use(cors({
    credentials: true,
    origin: function (origin, callback) {
        // allow requests with no origin 
        // (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}))

app.options('*', cors())
app.use('/api/v1/users', usersRouter())
app.use('/api/v1/broker', brokerRouter())
app.use('/api/v1/mediciones', medicionesRouter())
app.use('/api/v1/sensores', sensoresRouter())
app.use('/api/v1/devices', devicesRouter())

//Error handler para ruta no definidas
app.all('*', (req, res, next) => {
    next(new AppError(`Ruta (${req.originalUrl}) no encontrada`, 404))
})

//Global Error handler Middleware 
app.use(errorHandler)

export default app