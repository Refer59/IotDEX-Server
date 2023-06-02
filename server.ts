process.on('uncaughtException', (err: Error) => {
    console.error(err.name, err.message, err.stack)
    console.error('UNHANDLED EXCEPTION. Shutting down the server.')
    process.exit(1)
})

import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({ path: './config.env' })
import app from './app.js'

const port = Number.parseInt(process.env.PORT)

const server = app.listen(port, () => {
    const mongoSever = process.env.MONGO_USER
    const serverConnection = mongoSever.replace('<PASSWORD>', process.env.MONGO_PASSWORD)

    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    }

    mongoose
        .connect(serverConnection, options)
        .then(() => {
            console.log('Server y Base de datos conectados')
        })
        .catch(error => {
            console.error('Server iniciado pero Error al conectarse a la base de datos: \n' + error)
        })
})

//Maneja reject asyncros no manejados
process.on('unhandledRejection', (err: Error) => {
    console.error(err.name, err.message)
    console.error('UNHANDLED REJECTION. Shutting down the server.')
    server.close(() => {
        process.exit(1)
    })
})