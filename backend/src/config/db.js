const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false,
            },
          }
        : {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
          }
);

// Database jadvallarini avtomatik yaratish funksiyasi
const initDatabase = async () => {
    try {
        const sqlPath = path.join(__dirname, '../../database.sql');
        if (fs.existsSync(sqlPath)) {
            const sql = fs.readFileSync(sqlPath, 'utf8');
            await pool.query(sql);
            console.log('Database jadvalları tekserildi hám tabıslı sazlandı (Verified/Created).');
        } else {
            console.warn('database.sql faylı tabılmadı, jadvallardı avtomatlı túrde jaratıp bolmadı.');
        }
    } catch (err) {
        console.error('Bazanı inicializaciya qılıwda qátelik:', err);
    }
};

// Server ishga tushganda bazani tekshirish
initDatabase();

module.exports = pool;