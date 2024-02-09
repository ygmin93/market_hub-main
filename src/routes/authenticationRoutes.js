const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../migrations/db');
// const authenticateToken = require('../middlewares/jwt');
const { secretKey } = require('../config/secretkey');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, username, password, email, address, phone_number} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const insertUserQuery = 'INSERT INTO users(name, username, password, email, address, phone_number) VALUES (?, ?, ?, ?, ?, ?)';
        await db.promise().execute(insertUserQuery, [name, username, hashedPassword, email, address, phone_number]);

        res.status(201).json({ message: 'User Registered Successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const getUserQuery = 'SELECT * FROM users WHERE username = ?';
        const [rows] = await db.promise().execute(getUserQuery, [username]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isAdmin = user.role === 'admin';

        const token = jwt.sign({ userId: user.id, username: user.username, role: isAdmin ? 'admin' : 'user' }, secretKey, { expiresIn: '1h' });

        res.status(200).json({ token, isAdmin });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;