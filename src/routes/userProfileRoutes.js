const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../migrations/db');
const { authenticateToken } = require('../middlewares/jwt');
const { secretKey } = require('../config/secretkey');

const router = express.Router();

// ----USER DATA----

// View user profile information
router.get('/user/:user_id', async(req, res)=>{
    let id = req.params.user_id;

    if(!id){
        return res.status(400).send({error: true, message: 'Please provide user id'});
    }
    try{
        db.query('SELECT user_id, name, username, password, email, address, phone_number FROM users WHERE user_id = ?', id, (err, result)=>{
            if(err){
                console.error('Error fetching data', err);
                res.status(500).json({message: 'Internal Server Error'});
            }else{
                res.status(200).json({result});
            }
        });
    }catch(error){
        console.error('Error loading user:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// UPDATE USER PROFILE INFORMATION
router.put('/user/:user_id', authenticateToken, async (req, res) =>{
    try{
        const userId = req.params.user_id;
        const{name, username, password, email, address, phone_number} = req.body;
        // const{name, username} = req.body;

        const getUserQuery = 'SELECT * FROM users where user_id = ?';
        const [userRows] = await db.promise().execute(getUserQuery, [userId]);

        if(userRows.length === 0){
            return res.status(404).json({error: 'User not found'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const updateUserQuery = 'UPDATE users SET name = ?, username = ?, password = ?, role_id = ? WHERE id = ?';
        await db.promise().execute(updateUserQuery, [name, username, hashedPassword, email, address, phone_number, userId]);

        res.status(200).json({message: 'User updated successfully'});
    }catch(error){
        console.error('Error updating user:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// Get user's order history
router.get('/user/:user_id/order/history', authenticateToken, async (req, res) => {
    const userID = req.params.user_id;
    try {
        const getOrderHistoryQuery = 'SELECT * FROM orders WHERE user_id = ?';
        const [orderRows] = await db.promise().execute(getOrderHistoryQuery, [userID]);

        res.status(200).json({ user_id: userID, orders: orderRows });
    } catch (error) {
        console.error('Error retrieving order history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get user's product review history
router.get('/user/:user_id/review/history', authenticateToken, async (req, res) => {
    const userID = req.params.user_id;
    try {
        const getReviewHistoryQuery = 'SELECT * FROM reviews WHERE user_id = ?';
        const [reviewRows] = await db.promise().execute(getReviewHistoryQuery, [userID]);

        res.status(200).json({ user_id: userID, reviews: reviewRows });
    } catch (error) {
        console.error('Error retrieving review history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;