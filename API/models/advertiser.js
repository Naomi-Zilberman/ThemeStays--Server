import mongoose from "mongoose";

const advertiserSchema = new mongoose.Schema({

    email: {
        type: String,
        require: true,
        match: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/i
    },
    password: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        require: true
    },
    anotherPhone: {
        type: String,
        // require: true
    },
    apartmentsArr: [{
        type: mongoose.Types.ObjectId,
        ref: 'Apartment',
    //    required: true
    }]
})  

export default mongoose.model('Advertiser', advertiserSchema)