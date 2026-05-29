const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // HTTP sarlavhalarini himoya qilish
const xss = require('xss-clean'); // XSS hujumidan himoya
const hpp = require('hpp'); // HTTP Parameter Pollution hujumidan himoya
const rateLimit = require('express-rate-limit'); // DDoS dan himoya
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const authRoutes = require('./routes/authRoutes');

const app = express();

// Render/Reverse proxy muhitlarida IP manzilni to'g'ri aniqlash uchun proxy-ni ishonchli deb belgilaymiz
app.set('trust proxy', 1);

/** * 1. Global Xavfsizlik Sozlamalari  */

// Helmet: Brauzer xavfsizlik sarlavhalarini o'rnatadi
app.use(helmet());

// CORS: Faqat ruxsat etilgan domenlardan so'rov qabul qilish
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Frontend manzili
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

// Rate Limiting: Barcha API'lar uchun umumiy cheklov
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 daqiqa
    max: 100, // har bir IP dan maksimal 100 ta so'rov
    message: "Júdá kóp soraw jiberildi. Iltimas, 15 minuttan keyin qayta urınıń."
});
app.use('/api/', generalLimiter);

/**
 * 2. Ma'lumotlarni qayta ishlash va tozalash
 */

// JSON body parser (Hajmi 10kb dan oshmasligi kerak - DDoS oldini oladi)
app.use(express.json({ limit: '10kb' }));

// XSS: Kiruvchi JSON ma'lumotlaridagi zararli scriptlarni tozalaydi
app.use(xss());

// HPP: So'rov parametrlarini noto'g'ri ko'paytirish hujumidan himoya
app.use(hpp());

/**
 * 3. Marshrutlarni ulash
 */
app.use('/api/auth', authRoutes);

// Xato yuz berganda xavfsiz javob qaytarish
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Serverde kútilmegen qátelik júz berdi." });
});

module.exports = app;