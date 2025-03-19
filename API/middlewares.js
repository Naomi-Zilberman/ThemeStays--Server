import jwt from "jsonwebtoken"
import Category from "./models/category.js"
import City from "./models/city.js"
import Advertiser from "./models/advertiser.js"
export const checkEmail = (req, res, next) => {
    const { email } = req.body
    if (email && email.includes('@')) {
        return next()
    }
    res.status(400).send({ error: 'invalid email!' })
}
//בדיקת הטוקן
export const checkToken = (req, res, next) => {
    if (!req.headers.authorization) {
        // אין הרשאה
        return res.status(401).send({ error: 'Authorization failed!' })
    }

    const token = req.headers.authorization.split(' ')[1]

    if (!token) {
        return res.status(401).send({ error: 'Authorization failed!' })
    }

    // decoded - פיענוח
    jwt.verify(token, process.env.SECRET, (error, decoded) => {
        if (error || !decoded) {
            // האימות נכשל
            return res.status(401).send({ error: 'Authentication failed!' })
        }
        if (decoded) {
            // האובייקט יכיל את הנתונים של המשתמש לפיהם נוצר הטוקן
            // באם יהיה צורך נוכל לשמור אותם באובייקט הבקשה ואז להשתמש בפונקציות הבאות
            next()
        }
    })

}
export const categoryExists = (req, res, next) => {

    const { category } = req.body

    if (!category && req.method == 'PATCH') {
        return next()
    }

    Category.findById(category)
        .then(category => {
            if (!category) {
                return res.status(404).send({ error: `catgory not found!` })
            }
            next()
        })
        .catch(error => {
            res.status(500).send({ error: error.message })
        })
}
export const cityExists = (req, res, next) => {

    const { city } = req.body

    if (!city && req.method == 'PATCH') {
        return next()
    }

    City.findById(city)
        .then(city => {
            if (!city) {
                return res.status(404).send({ error: `city not found!` })
            }
            next()
        })
        .catch(error => {
            res.status(500).send({ error: error.message })
        })
}
export const advertiserExists = (req, res, next) => {

    const { advertiser } = req.body

    if (!advertiser && req.method == 'PATCH') {
        return next()
    }

    Advertiser.findById(advertiser)
        .then(advertiser => {
            if (!advertiser) {
                return res.status(404).send({ error: `advertiser not found!` })
            }
            next()
        })
        .catch(error => {
            res.status(500).send({ error: error.message })
        })
}




