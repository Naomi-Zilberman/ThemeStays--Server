import mongoose from 'mongoose';

// הגדרת המודל לדירה
const apartmentSchema = new mongoose.Schema({
    apartmentName: { type: String, required: true },
    description: { type: String },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    CityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
    address: { type: String },
    numBeds: { type: Number },
    additives: { type: String },
    price: { type: Number },
    advertiserId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advertiser', required: true },
    iconUrl: {
        type: String,  // שמירת כתובת URL לאייקון
        required: false, 
    },});


const Apartment = mongoose.model('Apartment', apartmentSchema);

export default Apartment;
