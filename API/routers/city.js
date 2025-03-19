import express from 'express'
import { create, getAll, getApartmentsByCityId } from '../controllers/city.js'
import { checkToken } from '../middlewares.js'

const router = express.Router()

router.post('/create',checkToken, create)
router.get('/getAll', getAll)
router.get('/getapartmentsbycityid/:id', getApartmentsByCityId)


export default router;