// db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'sql6.freemysqlhosting.net',
    user: 'sql6683678',
    password: 'easS8CLbjU',
    database: 'sql6683678',
});

db.connect((err) => {
    if (err) {
        console.log('Error Connecting to Mysql');
    } else {
        console.log('Connected to MySql');
    }
});

module.exports = db;
