const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../migrations/db');
const { authenticateToken } = require('../middlewares/jwt');
const { secretKey } = require('../config/secretkey');

const router = express.Router();

// Create Review
router.post('/review', authenticateToken, async (req, res) => {
    try {
        const { product_id, user_id, rating, comment } = req.body;

        const insertReviewQuery = 'INSERT INTO reviews (product_id, user_id, rating, comment, date) VALUES (?, ?, ?, ?, NOW())';
        await db.promise().execute(insertReviewQuery, [product_id, user_id, rating, comment]);

        res.status(201).json({ message: 'Review Created Successfully' });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Fetch Reviews for a Product
router.get('/reviews/:product_id', async (req, res) => {
    try {
        const productId = req.params.product_id;

        const getReviewsQuery = 'SELECT review_id, user_id, rating, comment, date FROM reviews WHERE product_id = ?';
        const [rows] = await db.promise().execute(getReviewsQuery, [productId]);

        res.status(200).json({ reviews: rows });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update Review
router.put('/reviews/:review_id', authenticateToken, async (req, res) => {
    try {
        const reviewId = req.params.review_id;
        const { rating, comment } = req.body;
        const userId = req.user.user_id;

        const checkReviewOwnershipQuery = 'SELECT user_id FROM reviews WHERE review_id = ?';
        const [ownershipResult] = await db.promise().execute(checkReviewOwnershipQuery, [reviewId]);

        if (ownershipResult.length === 0 || ownershipResult[0].user_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized: You do not have permission to update this review' });
        }

        const updateReviewQuery = 'UPDATE reviews SET rating = ?, comment = ? WHERE review_id = ?';
        await db.promise().execute(updateReviewQuery, [rating, comment, reviewId]);

        res.status(200).json({ message: 'Review updated successfully' });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete Review
router.delete('/reviews/:review_id', authenticateToken, async (req, res) => {
    try {
        const reviewId = req.params.review_id;
        const userId = req.user.user_id;

        const checkReviewOwnershipQuery = 'SELECT user_id FROM reviews WHERE review_id = ?';
        const [ownershipResult] = await db.promise().execute(checkReviewOwnershipQuery, [reviewId]);

        if (ownershipResult.length === 0 || ownershipResult[0].user_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized: You do not have permission to delete this review' });
        }

        const deleteReviewQuery = 'DELETE FROM reviews WHERE review_id = ?';
        await db.promise().execute(deleteReviewQuery, [reviewId]);

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
