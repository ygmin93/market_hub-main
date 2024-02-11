const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../migrations/db');
const { authenticateToken } = require('../middlewares/jwt');
const { secretKey } = require('../config/secretkey');

const router = express.Router();

// Add Product to Wishlist
router.post('/wishlist', authenticateToken, async (req, res) => {
    try {
        const { user_id, product_id } = req.body;

        const checkExistingQuery = 'SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?';
        const [existingRows] = await db.promise().execute(checkExistingQuery, [user_id, product_id]);

        if (existingRows.length > 0) {
            return res.status(400).json({ error: 'Product already exists in wishlist' });
        }

        const addToWishlistQuery = 'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)';
        await db.promise().execute(addToWishlistQuery, [user_id, product_id]);

        res.status(201).json({ message: 'Product added to wishlist successfully' });
    } catch (error) {
        console.error('Error adding product to wishlist:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get User's Wishlist
router.get('/wishlist/:user_id', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.user_id;

        const getWishlistQuery = `
            SELECT wishlist_id, products.product_id, products.product_name, products.description, products.price
            FROM wishlist
            INNER JOIN products ON wishlist.product_id = products.product_id
            WHERE wishlist.user_id = ?
        `;
        const [wishlistRows] = await db.promise().execute(getWishlistQuery, [userId]);

        res.status(200).json({ wishlist: wishlistRows });
    } catch (error) {
        console.error('Error fetching user wishlist:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Add Wishlist Item to Cart
router.post('/wishlist/add-to-cart/:wishlist_id', authenticateToken, async (req, res) => {
    try {
        const { user_id } = req.user;
        const { wishlist_id } = req.params;

        const getWishlistItemQuery = 'SELECT * FROM wishlist WHERE wishlist_id = ? AND user_id = ?';
        const [wishlistItemRows] = await db.promise().execute(getWishlistItemQuery, [wishlist_id, user_id]);

        if (wishlistItemRows.length === 0) {
            return res.status(404).json({ error: 'Wishlist item not found' });
        }

        const { product_id } = wishlistItemRows[0];
        
        const checkCartItemQuery = 'SELECT * FROM cart WHERE user_id = ? AND product_id = ?';
        const [existingCartItemRows] = await db.promise().execute(checkCartItemQuery, [user_id, product_id]);

        if (existingCartItemRows.length > 0) {
            const updateCartItemQuery = 'UPDATE cart SET quantity = quantity + 1 WHERE user_id = ? AND product_id = ?';
            await db.promise().execute(updateCartItemQuery, [user_id, product_id]);
        } else {
            const insertCartQuery = 'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, 1)';
            await db.promise().execute(insertCartQuery, [user_id, product_id]);
        }

        res.status(201).json({ message: 'Wishlist Item Added to Cart Successfully' });
    } catch (error) {
        console.error('Error adding wishlist item to cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update Wishlist Item
router.put('/wishlist/:wishlist_id', authenticateToken, async (req, res) => {
    try {
        const wishlistId = req.params.wishlist_id;
        const { product_id } = req.body;

        const updateWishlistItemQuery = 'UPDATE wishlist SET product_id = ? WHERE wishlist_id = ?';
        await db.promise().execute(updateWishlistItemQuery, [product_id, wishlistId]);

        res.status(200).json({ message: 'Wishlist item updated successfully' });
    } catch (error) {
        console.error('Error updating wishlist item:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete Wishlist Item
router.delete('/wishlist/:wishlist_id', authenticateToken, async (req, res) => {
    try {
        const wishlistId = req.params.wishlist_id;

        const deleteWishlistItemQuery = 'DELETE FROM wishlist WHERE wishlist_id = ?';
        await db.promise().execute(deleteWishlistItemQuery, [wishlistId]);

        res.status(200).json({ message: 'Wishlist item deleted successfully' });
    } catch (error) {
        console.error('Error deleting wishlist item:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
