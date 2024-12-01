const mysql = require('mysql2');
// const session = require('express-session'); 
// const MySQLStore = require('express-mysql-session')(session); 

require('dotenv').config({ path: 'mysql/.env' });

const db = mysql.createPool({
    connectionLimit: process.env.MYSQL_LIMIT,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
});

db.on('connection', function (connection) {
    console.log('DB 연결됨');
});

// const sessionStore = new MySQLStore({}, db);

module.exports = db;