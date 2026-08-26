require('dotenv').config();
async function createDB() {
    const mysql = require('mysql2/promise');

const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
console.log('MySQL connected');
return db;
}

module.exports = createDB();