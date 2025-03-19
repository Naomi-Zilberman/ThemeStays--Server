
import Category from "../models/category.js";
import multer from 'multer';
// הגדרת אחסון הקבצים
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/icons'); // תיקיית העלאות האייקונים
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // שם קובץ ייחודי
    }
});

const upload = multer({ storage });

// פונקציה ליצירת קטגוריה עם אייקון
export const create = async (req, res) => {
    upload.single('icon')(req, res, async (err) => {
      if (err) {
        console.error('Error uploading file:', err.message);
        return res.status(500).send({ error: 'Error uploading icon', message: err.message });
      }
  
      console.log('Request body:', req.body);
      console.log('Uploaded file:', req.file);
  
      const { categoryName } = req.body;
  
      if (!categoryName || categoryName.trim() === '') {
        return res.status(400).send({ error: 'Category name is required!' });
      }
  
      const existingCategory = await Category.findOne({ categoryName: categoryName.trim() });
      if (existingCategory) {
        return res.status(400).send({ error: 'Category already exists!' });
      }
  
      const newCategory = new Category({
        categoryName: categoryName.trim(),
        iconUrl: req.file ? `/uploads/icons/${req.file.filename}` : '', // נתיב האייקון
        apartmentsArr: [],
      });
  
      try {
        const category = await newCategory.save();
        return res.status(200).send({ message: `Create category ${category._id} succeed!`, category });
      } catch (error) {
        console.error('Error saving category:', error.message);
        return res.status(500).send({ error: 'Error saving category', message: error.message });
      }
    });
  };
  
// פונקציה לקבלת כל הקטגוריות
export const getAll = (req, res) => {
    Category.find().populate('apartmentsArr')
        .then(list => {
            res.status(200).send(list);
        })
        .catch(err => {
            res.status(500).send({ error: err.message });
        });
};

// פונקציה לקבלת דירות לפי מזהה קטגוריה
export const getApartmentsById = (req, res) => {
    Category.findById(req.params.id)
        .populate('apartmentsArr')
        .then(category => {
            res.status(200).send({ apartmentsArr: category.apartmentsArr });
        })
        .catch(err => {
            res.status(500).send({ error: err.message });
        });
};
