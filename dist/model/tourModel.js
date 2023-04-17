import mongoose from "mongoose";
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El tour debe un nombre'],
        trim: true,
        unique: true,
        maxlength: [40, 'El nombre del tour debe tener como maximo 40 caracters'],
        minlength: [10, 'El nombre del tour debe tener al menos 10 caracterss'],
        /*validate: {
            validator: (value: string) => validator.default.i(value),
            message: 'El nombre del tour no es alfanumerico'
        }*/
    },
    duration: {
        type: Number,
        required: [true, 'El tour debe tener una duración']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'El tour debe tener un tamaño de grupo']
    },
    difficulty: {
        type: String,
        required: [true, 'El tour debe tener una dificultad'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'La dificultad no es ni easy, medium ni difficult'
        }
    },
    ratingAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'El rating debe ser mas o igual a 1.0'],
        max: [5, 'El rating debe ser menos o igual a 5.0']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'El tour debe tener un precio']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (value) {
                //Esto solo apunta al documento actual que se esta creando
                return value < this.price;
            },
            message: 'El descuento ({VALUE}) debe estar por debajo del precio'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'El tour debe tener una descripcion']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'El tour debe tener una imagen de cubierta']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});
const Tour = mongoose.model('Tour', tourSchema);
export default Tour;
//# sourceMappingURL=tourModel.js.map