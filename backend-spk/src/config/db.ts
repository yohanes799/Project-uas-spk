// src/config/db.ts
import mysql from 'mysql2/promise';

// Membuat pool koneksi ke MySQL XAMPP
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',      // Default user XAMPP
    password: '',      // Default password XAMPP (kosong)
    database: 'spk_paskibraka',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;