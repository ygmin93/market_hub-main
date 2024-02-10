// db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'sql6.freemysqlhosting.net',
    user: 'sql6683180',
    password: 'ZssrRvUvqX',
    database: 'sql6683180',
});

db.connect((err) => {
    if (err) {
        console.log('Error Connecting to Mysql');
    } else {
        console.log('Connected to MySql');
    }
});

module.exports = db;
