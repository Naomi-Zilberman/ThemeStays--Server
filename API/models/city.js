import mongoose from "mongoose";

const citySchema = new mongoose.Schema({

    cityName: {
        type: String,
        require: true,
    },
    apartmentsArr: [{
        type: mongoose.Types.ObjectId,
        ref: 'Apartment',
        required: true
    }]
})  

export default mongoose.model('City', citySchema)