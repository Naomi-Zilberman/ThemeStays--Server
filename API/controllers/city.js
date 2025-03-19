import City from "../models/city.js"
import apartment from "../models/apartment.js";
export const create = async (req, res) => {
    
        const { cityName } = req.body;

        // ולידציה לשם העיר
        if (!cityName || cityName.trim() === '') {
            return res.status(400).send({ error: 'City name is required!' });
        }

        // בדיקה אם העיר כבר קיימת
        const existingCity = await City.findOne({ cityName: cityName.trim() });
        if (existingCity) {
            return res.status(400).send({ error: 'City already exists!' });
        }

        // יצירת העיר
        const newCity = new City({
            cityName: cityName.trim(),
            apartmentsArr: []
        });

        // שמירת העיר
        newCity.save()
        .then(city => {
            return res.status(200).send({ message: `create city ${city._id} succeed!` })
        })
        .catch(err => {
            return res.status(500).send({ error: err.message })
        })
    }

    export const getAll = (req, res) => {
        
        // במקום לשלוף רק את קוד הקטגוריה - ישלוף את כל האובייקט
        City.find().populate('apartmentsArr')
            .then(list => {
                res.status(200).send(list)
            })
            .catch(err => {
                res.status(500).send({ error: err.message })
            })
    }

    export const getApartmentsByCityId = (req, res) => {
        City.findById(req.params.id)
        .populate('apartmentsArr')
        .then(city => {
            console.log(city);
            res.status(200).send({ apartmentsArr: city.apartmentsArr });
        })
        .catch(err => {
            res.status(500).send({ error: err.message });
        });
    }    

