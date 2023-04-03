import mongoose from "mongoose";
import User from "../model/userModel.js";

class APIFeatures {
    query: mongoose.Query<any[], any, {}, any>
    private queryParams: { [key: string]: any; }
    private Model: mongoose.Model<any, {}, {}>

    constructor(Model: mongoose.Model<any>, queryParams: object) {
        this.query = Model.find()
        this.queryParams = queryParams
        this.Model = Model
    }


    filtro() {
        // 1A) Filtering
        const queryObject = { ...this.queryParams }
        const excludeFields = ['page', 'sort', 'limit', 'fields']
        excludeFields.forEach(element => delete queryObject[element])

        // 1B) Advanced Filtering
        let queryStr = JSON.stringify(queryObject)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

        this.query = this.query.find(JSON.parse(queryStr))

        return this
    }

    sort() {
        if (this.queryParams.sort) {
            const sortString = (this.queryParams.sort + '').split(',').join(' ')
            this.query.sort(sortString)
        }

        return this
    }

    limitFields() {
        if (this.queryParams.fields) {
            const queryString = this.queryParams.fields + ''
            const fields = queryString.split(',').join(' ')
            if (this.Model === User && fields.includes('+password')) //Evita una NOSQL Injection
                queryString.replace('+password,', '')
            //Hace que solo retornen los campos con el field dado de cada documento 
            this.query.select(fields)
        } else
            this.query.select('-__v')

        return this
    }

    paginar() {
        if ((this.queryParams.page && this.queryParams.limit) || this.queryParams.limit) {
            const page = Number.parseInt(this.queryParams.page + '') || 1
            const limit = Number.parseInt(this.queryParams.limit + '') || 100
            const skip = (page - 1) * limit

            this.query.skip(skip).limit(limit)
        }

        return this
    }

}

export default APIFeatures