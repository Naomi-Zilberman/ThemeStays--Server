import express from 'express'
import { create, getAll, getApartmentsById } from '../controllers/category.js'
import { checkToken } from '../middlewares.js'

const router = express.Router()

router.post('/create',checkToken, create)
router.get('/getAll',/*checkToken,*/ getAll)
router.get('/getapartmentsbyid/:id', getApartmentsById)


export default router;