import express from 'express'
import { getApartmentsByAdvertiserId, login, register}from '../controllers/advertiser.js'
import { checkEmail, checkToken } from '../middlewares.js'

const router = express.Router()

router.post('/register',checkEmail, register)
router.post('/login', login)
router.get('/getapartmentsbyadvertiserid/:id', getApartmentsByAdvertiserId)


export default router;