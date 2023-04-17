import { NextFunction, Request, Response, RequestHandler } from "express"
import Tour from "../model/tourModel.js";
import APIFeatures from "../utils/apiFeatures.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const getBestCheap5 = (req: Request, res: Response, next: NextFunction) => {
    req.query.limit = '5'
    req.query.sort = '-ratingAverage,price'
    req.query.fields = 'name,price,ratingAverage,summary,difficulty'
    next()
}

export const getAllTours = catchAsync(async (req: Request, res: Response) => { 
    const features = new APIFeatures(Tour, req.query)
        .filtro()
        .limitFields()
        .sort()
        .paginar()
    const tours = await features.query

    //JSend format
    res.status(200).json({ 
        status: 'sucess',
        size: tours.length,
        data: { tours } 
    })
})

export const getTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const tour = await Tour.findById(req.params.id)
    if(!tour)
        return next(new AppError('No se encontro el tour', 404))

    res.status(200).json({ 
        status: 'sucess',
        data: { tour }
    })
})

export const createTour =  catchAsync(async (req: Request, res: Response) => {
    const newTour = await Tour.create(req.body)
    res.status(200).json({
        status: 'Sucess',
        data: { tour: newTour } 
    })
})

export const updateTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
 
    if(!tour)
        return next(new AppError('No se encontro el tour que se desea actualizar', 404))
    
    res.status(200).json({
        status: 'Sucess',
        data: { tour } 
    })
})

export const deleteTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const tour = await Tour.findByIdAndDelete(req.params.id)
    
    if(!tour)
        return next(new AppError('No se encontro el tour que se desea eliminar', 404))

    res.status(200).json({
        status: 'Sucess',
        message: 'Tour eliminado'
    })
})

export const getTourStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await Tour.aggregate([
        /*{
            $match: { ratingAverage: { $gte: 4.5 } }
        },*/
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRatings: { $avg: '$ratingAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            }
        }, //Desde aqui se crea una nuevo array de objetos, los cuales tienen los resultados de arriba, si se siguen dando etapas
            //Al agregation, estas operaciones se ejecutaran con este nuevo array y con cada nuevo que generen y asi
        {
            $sort: {
                avgPrice: 1
            }
        },
        {
            $match: { _id: { $ne: 'EASY' } }
        }
    ])

    res.status(200).json({
        status: 'Sucess',
        data: stats
    })
})

export const getTourMonthlyPlan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const year = Number.parseInt(req.params.year)
    
    if(!Number.isInteger(year))
        return next(new AppError('Ingrese un año valido', 400))

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStartAt: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $sort: {
                numTourStartAt: -1
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0
            }
        }
    ])

    res.status(200).json({
        status: 'Sucess',
        size: plan.length,
        data: plan
    })
})
