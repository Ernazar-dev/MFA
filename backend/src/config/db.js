const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
        connectionTimeoutMillis: 15000, // 15 soniya kutish (Neon cold start uyg'onishi uchun juda muhim!)
        idleTimeoutMillis: 30000,
        max: 10,
      }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        connectionTimeoutMillis: 5000,
      };

const pool = new Pool(poolConfig);

// Database jadvallarini avtomatik yaratish funksiyasi (Neon cold start uchun qayta urinishlar bilan)
const initDatabase = async (retries = 3, delay = 3000) => {
    const sqlPath = path.join(__dirname, '../../database.sql');
    if (!fs.existsSync(sqlPath)) {
        console.warn('database.sql faylı tabılmadı, jadvallardı avtomatlı túrde jaratıp bolmadı.');
        return;
    }
    
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Baza bilan bog'lanish tekshirilmoqda (Urinish ${i + 1}/${retries})...`);
            await pool.query(sql);
            console.log('Database jadvalları tekserildi hám tabıslı sazlandı (Verified/Created).');
            return;
        } catch (err) {
            console.error(`Bazani ishga tushirishda xatolik (Urinish ${i + 1}/${retries}):`, err.message || err);
            if (i < retries - 1) {
                console.log(`Neon bazasi uyg'onayotgan bo'lishi mumkin. ${delay / 1000} soniyadan so'ng qayta urinib ko'riladi...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error('Baza bilan bog\'lanish butunlay muvaffaqiyatsiz tugadi.');
            }
        }
    }
};

// Server ishga tushganda bazani tekshirish
initDatabase();

module.exports = pool;