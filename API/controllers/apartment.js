import Apartment from "../models/apartment.js";
import Category from "../models/category.js";
import City from "../models/city.js";
import Advertiser from "../models/advertiser.js";
import nodemailer from 'nodemailer';

// יצירת פונקציה לשליחת מייל
const sendEmailToAdvertiser = async (advertiserEmail, apartmentName) => {
  // יצירת קשר עם שרת המייל
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: 'your-email@gmail.com', 
      pass: 'your-email-password', 
    },
  });

  // הגדרת תוכן המייל
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: advertiserEmail,
    subject: `הדירה ${apartmentName} פורסמה בהצלחה!`,
    text: `שלום,\n\nהדירה שלך בשם ${apartmentName} פורסמה בהצלחה במערכת שלנו.\n\nתודה, צוות האתר.`,
  };

  // שליחת המייל
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


import multer from "multer";


// הגדרת אחסון הקבצים
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/icons'); // תיקיית העלאות האייקונים
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // שם קובץ ייחודי
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // בדיקה אם הקובץ הוא תמונה
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }

});
//יצירת דירה
export const create = async (req, res) => {
  upload.single('icon')(req, res, async (err) => {
    if (err) {
      return res.status(500).send({ error: 'Error uploading icon', message: err.message });
    }

    if (!req.file) {
      return res.status(400).send({ error: 'Icon file is required!' });
    }

    const { apartmentName, description, categoryId, CityId, address, numBeds, additives, price, advertiserId } = req.body;

    if (!apartmentName || !categoryId || !CityId || !advertiserId) {
      return res.status(400).send({ error: 'Missing required fields' });
    }

    try {
      const newApartment = new Apartment({
        apartmentName,
        description,
        categoryId,
        CityId,
        address,
        numBeds,
        additives,
        price,
        advertiserId,
        iconUrl: req.file ? `/uploads/icons/${req.file.filename}` : '',
      });

      const apartment = await newApartment.save();

      // עדכון הקטגוריה, העיר והמפרסם
      await Category.findByIdAndUpdate(apartment.categoryId, { $push: { apartmentsArr: apartment._id } });
      await City.findByIdAndUpdate(apartment.CityId, { $push: { apartmentsArr: apartment._id } });
      await Advertiser.findByIdAndUpdate(apartment.advertiserId, { $push: { apartmentsArr: apartment._id } });

      // שליחת מייל למפרסם
      const advertiser = await Advertiser.findById(advertiserId);
      if (advertiser && advertiser.email) {
        await sendEmailToAdvertiser(advertiser.email, apartmentName); // שליחה למייל
      }

      return res.status(200).send({ message: `Apartment ${apartment._id} created successfully!`, iconUrl: `/uploads/icons/${req.file.filename}` });

    } catch (err) {
      console.error("Error during apartment creation:", err);
      if (err.name === 'ValidationError') {
        const missingFields = Object.keys(err.errors).map((key) => err.errors[key].message);
        return res.status(400).send({ error: 'Validation error', missingFields });
      }

      return res.status(500).send({ error: 'Internal server error', details: err.message });
    }
  });
};

export const update = async (req, res) => {

    // לא ניתן לעדכן את קוד הכתבה
    const { _id } = req.body;

   

    const  {apartmentId} = req.params;  // בודק אם יש פרמטר apartmentId בכתובת
    const { advertiserId } = req.params; // בודק אם יש פרמטר advertiserId בכתובת

    // שליפת הדירה לבדיקה
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
        return res.status(404).send({ error: 'Apartment not found!' });
    }

    // בדיקה האם המפרסם שייך לדירה
    if (apartment.advertiserId.toString() !== advertiserId) {
        return res.status(403).send({ error: 'Advertiser is not the owner of this apartment!' });
    }

    // עדכון הדירה
    Apartment.findByIdAndUpdate(apartmentId, req.body)
        .then(async (apartment) => {
            const { categoryId, CityId, advertiserId } = req.body;

            if (categoryId) {
                await Category.findByIdAndUpdate(apartment.categoryId, { $pull: { apartmentsArr: apartment._id } });
                await Category.findByIdAndUpdate(categoryId, { $push: { apartmentsArr: apartment._id } });
            }

            if (CityId) {
                await City.findByIdAndUpdate(apartment.CityId, { $pull: { apartmentsArr: apartment._id } });
                await City.findByIdAndUpdate(CityId, { $push: { apartmentsArr: apartment._id } });
            }

            if (advertiserId) {
                await Advertiser.findByIdAndUpdate(apartment.advertiserId, { $pull: { apartmentsArr: apartment._id } });
                await Advertiser.findByIdAndUpdate(advertiserId, { $push: { apartmentsArr: apartment._id } });
            }

            return res.status(200).send({ message:` Update apartment ${apartment._id} succeed! `});
        })
        .catch(err => {
            res.status(500).send({ error: err.message });
        });
};

export const remove = async(req, res) => {
    const  {apartmentId} = req.params; 
    const { advertiserId } = req.params;
    // שליפת הדירה לבדיקה
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
        return res.status(404).send({ error: 'Apartment not found!' });
    }
    if (apartment.advertiserId.toString() !== advertiserId) {
        return res.status(403).send({ error: 'Advertiser is not the owner of this apartment!' });
    }


    // 1. חיפוש האובייקט הרצוי
    Apartment.findByIdAndDelete(req.params.apartmentId)
        .then(async apartment => {
            if (!apartment) {
                return res.status(404).send({ error:` apartment not found!` })
            }
            let x = await Category.findByIdAndUpdate(apartment.categoryId, { $pull: { apartmentsArr: apartment._id } })
            if (!x) {
                return res.status(200).send({ message: `delete apartment ${apartment._id} succeed! update category failed!` })
            }
            let y = await City.findByIdAndUpdate(apartment.CityId, { $pull: { apartmentsArr: apartment._id } })
            if (!y) {
                return res.status(200).send({ message:` delete apartment ${apartment._id} succeed! update cityId failed! `})
            }
            let z = await Advertiser.findByIdAndUpdate(apartment.advertiserId, { $pull: { apartmentsArr: apartment._id } })
            if (!z) {
                return res.status(200).send({ message:` delete apartment ${apartment._id} succeed! update advertiserId failed!` })
            }
            res.status(200).send({ message:` delete apartment ${apartment._id} succeed!` })
        })
        .catch(err => {
            res.status(500).send({ error: err.message })
        })
}

export const getAll = (req, res) => {
    

    Apartment.find()
    .populate('categoryId', 'categoryName -_id')  
    .populate('CityId', 'cityName _id')         
    .populate('advertiserId', '_id email phone anotherPhone ')
    .then(list => {
        res.status(200).send(list)
    })
    .catch(err => {
        res.status(500).send({ error: err.message })
    });
}
   
export const getById = (req, res) => {
    const { id } = req.params;  

    if (!id || typeof id !== 'string') {
        return res.status(400).send({ error: 'Invalid ID format' });
    }

    Apartment.findById(id)  
    .populate('categoryId', 'categoryName -_id')  
    .populate('CityId', 'cityName _id')         
    .populate('advertiserId', '_id email phone anotherPhone ')
    .then(apartment => {
            if (!apartment) {
                return res.status(404).send({ error: 'Apartment not found' });
            }
            res.status(200).send(apartment); 
        })
        .catch(err => {
            res.status(500).send({ error: err.message });
        });
};



// סינון דירות לפי מספר מיטות
export const filterApartments = (req, res) => {
    const { filterType, numBeds } = req.params;
    const beds = parseInt(numBeds, 10);
    
    if (isNaN(beds)) {
        return res.status(400).send({ error: "Invalid number of beds parameter" });
    }

    let query;
    switch (filterType) {
        case 'gt':
            query = { numBeds: { $gt: beds } };
            break;
        case 'lt':
            query = { numBeds: { $lt: beds } };
            break;
        case 'eq':
            query = { numBeds: beds };
            break;
        default:
            return res.status(400).send({ error: "Invalid filter type" });
    }

    Apartment.find(query)
        .then(apartments => res.status(200).send({ apartments }))
        .catch(err => res.status(500).send({ error: err.message }));
};

export const filterPrice = (req, res) => {
    const { filterType, price } = req.params;
    const p = parseInt(price, 10);
    
    if (isNaN(p)) {
        return res.status(400).send({ error: "Invalid price parameter" });
    }

    let query;
    switch (filterType) {
        case 'gt':
            query = { price: { $gt: p } };
            break;
        case 'lt':
            query = { price: { $lt: p } };
            break;
        case 'eq':
            query = { price: p };
            break;
        default:
            return res.status(400).send({ error: "Invalid filter type" });
    }

    Apartment.find(query)
        .then(apartments => res.status(200).send({ apartments }))
        .catch(err => res.status(500).send({ error: err.message }));
};


export const getByAdvertiserId = (req, res) => {
    Apartment.find({ advertiserId:req.params.advertiserId  }) // ללא שימוש ב-$eq
        .then(apartment => {
            res.status(200).send({ apartment });
        })
        .catch(err => {
            res.status(500).send({ error: err.message });
        });
};
