import advertiser from '../models/advertiser.js'
import Advertiser from '../models/advertiser.js'
import jwt from 'jsonwebtoken'

// פונקציה לטיפול בהתחברות מפרסם
export const login = (req, res) => {
    const { email, password } = req.body

    // בדיקה אם האימייל והסיסמה סופקו
    if (!email || !password) {
        return res.status(400).send({ error: "יש לספק אימייל וסיסמה!" })
    }

    // חיפוש מפרסם לפי אימייל
    Advertiser.find()
        .where({ email: { $eq: email } })
        .then(async advertisers => {
            // אם לא נמצאו מפרסמים
            if (advertisers.length == 0) {
                console.log('האימייל לא נמצא!');
                return res.status(404).send({ error: "האימייל והסיסמה אינם תואמים!" })
            }

            // קבלת המפרסם הראשון מהמערך
            let [advertiser] = advertisers

            // בדיקה אם הסיסמה תואמת
            if (advertiser.password !== password) {
                console.log('הסיסמה אינה תואמת!');
                return res.status(404).send({ error: "האימייל והסיסמה אינם תואמים!" })
            }

            // יצירת טוקן JWT
            const token = await jwt.sign(
                { advertiserPhone: advertiser.phone, email },
                process.env.SECRET,
                {
                    expiresIn: '30m', // זמן תפוגת הטוקן
                }
            )

            // שליחת תגובה עם נתוני המפרסם והטוקן
            res.status(200).send({ advertiser, token })
        })
        .catch(err => {
            res.status(500).send({ error: err.message })
        })
};

// פונקציה לטיפול ברישום מפרסם
export const register = (req, res) => {
    const { email, password, phone, anotherPhone } = req.body

    // בדיקה אם האימייל כבר קיים
    Advertiser.find()
        .where({ email: { $eq: email } })
        .then(advertisers => {
            if (advertisers.length > 0) {
                return res.status(400).send({ error: 'האימייל כבר קיים!' })
            }

            // יצירת מפרסם חדש
            const newAdvetiser = new Advertiser({
                email,
                password,
                phone,
                anotherPhone,
            })

            // שמירת המפרסם החדש בבסיס הנתונים
            newAdvetiser.save()
                .then(async advertiser => {
                    // יצירת טוקן JWT
                    const token = await jwt.sign(
                        { advertiserPhone: advertiser.phone, email },
                        process.env.SECRET,
                        {
                            expiresIn: '1hr' // זמן תפוגת הטוקן
                        }
                    )
                    return res.status(200).send({ advertiser, token })
                })
                .catch(err => {
                    return res.status(500).send({ error: err.message })
                })
        })
}

// פונקציה לקבלת דירות לפי מזהה מפרסם
export const getApartmentsByAdvertiserId = (req, res) => {
    Advertiser.findById(req.params.id)
        .populate('apartmentsArr')
        .then(advertiser => {
            res.status(200).send({ apartmentsArr: advertiser.apartmentsArr })
        })
        .catch(err => {
            res.status(500).send({ error: err.message })
        })
}