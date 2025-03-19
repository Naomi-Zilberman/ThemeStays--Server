import express from 'express';
import { create, filterApartments, filterPrice, getAll, getByAdvertiserId, getById, update, remove } from '../controllers/apartment.js';
import { advertiserExists, categoryExists, checkToken, cityExists } from '../middlewares.js';

const router = express.Router();

router.post('/create', checkToken, create);
router.patch('/:apartmentId/:advertiserId', checkToken, categoryExists, advertiserExists, cityExists, update);
router.delete('/:apartmentId/:advertiserId', checkToken, remove);
router.get('', getAll);
router.get('/getbyid/:id', getById);
router.get('/filter/:filterType/:numBeds', filterApartments);
router.get('/filter2/:filterType/:price', filterPrice);
router.get('/getbyadvertiserid/:advertiserId', checkToken, getByAdvertiserId);

export default router;
