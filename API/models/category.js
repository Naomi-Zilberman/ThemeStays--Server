import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({

    categoryName: {
        type: String,
        require: true,
    },
    iconUrl: {
        type: String,  // שמירת כתובת URL לאייקון
        required: false, 
    },
   
    apartmentsArr: [{
        type: mongoose.Types.ObjectId,
        ref: 'Apartment',
        required: true
    }]
})  

export default mongoose.model('Category', categorySchema)
   