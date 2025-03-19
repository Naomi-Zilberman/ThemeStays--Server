import express from 'express'; 
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import advertiserRouter from './API/routers/advertiser.js';
import cityRouter from './API/routers/city.js';
import categoryRouter from './API/routers/category.js';
import apartmentRouter from './API/routers/apartment.js';
import path from 'path';  // עבור עבודה עם נתיבים של קבצים
import fs from 'fs';      // עבור יצירת תיקיות
import { fileURLToPath } from 'url';  // עבור יצירת __dirname ב-ES Modules

dotenv.config();

const app = express();
const port = 4000;
// יצירת __dirname באמצעות import.meta.url
const __filename = fileURLToPath(import.meta.url); // יצירת __filename
const __dirname = path.dirname(__filename); // יצירת __dirname
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors());
// app.use(bodyParser.json()); // ודא שאתה מקבל JSON

// תיקיה עבור העלאת תמונות
const uploadsDir = path.join(__dirname, 'uploads');

// אם התיקייה לא קיימת, צור אותה
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// מגדיר את נתיב העלאת הקבצים

mongoose.connect(process.env.LOCAL_URI)
    .then(() => {
        console.log('Connected to MongoDB! 👍');
    })
    .catch(err => {
        console.log({ error: err.message });
    });

// הגדרת הנתיבים
app.use('/advertiser', advertiserRouter);
app.use('/city', cityRouter);
app.use('/category', categoryRouter);
app.use('/apartment', apartmentRouter);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
