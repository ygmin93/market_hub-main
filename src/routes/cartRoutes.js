const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../migrations/db');
const { authenticateToken } = require('../middlewares/jwt');
const { secretKey } = require('../config/secretkey');

const router = express.Router();

// Add items to cart
router.post('/cart', authenticateToken, async (req, res) => {
    try {
        const { user_id, product_id, quantity } = req.body;

        const checkCartItemQuery = 'SELECT * FROM cart WHERE user_id = ? AND product_id = ?';
        const [existingCartItemRows] = await db.promise().execute(checkCartItemQuery, [user_id, product_id]);

        if (existingCartItemRows.length > 0) {
            const updateCartItemQuery = 'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?';
            await db.promise().execute(updateCartItemQuery, [quantity, user_id, product_id]);
        } else {
            const insertCartQuery = 'INSERT INTO cart (user_id, product_id, quantity ) VALUES (?, ?, ?)';
            await db.promise().execute(insertCartQuery, [user_id, product_id, quantity]);
        }

        res.status(201).json({ message: 'Product Added to Cart Successfully' });
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// ----CART ITEMS DATA----

// DISPLAY USER'S CART
router.get('/cart/:user_id', authenticateToken, async (req, res) => {
    let userId = req.params.user_id;

    if (!userId) {
        return res.status(400).json({ error: true, message: 'Please provide user id' });
    }

    try {
        const getCartItemsQuery = 'SELECT c.cart_id, c.product_id, c.quantity, p.price, (c.quantity * p.price) AS subtotal FROM cart c INNER JOIN products p ON c.product_id = p.product_id WHERE c.user_id = ?';
        const [cartItemsRows] = await db.promise().execute(getCartItemsQuery, [userId]);

        const cartItems = cartItemsRows.map(item => ({
            cart_id: item.cart_id,
            product_id: item.product_id,
            quantity: item.quantity,
            subtotal: item.subtotal,
        }));

        res.status(200).json({ cart: cartItems });
    } catch (error) {
        console.error('Error loading user cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// UPDATE Cart Item Quantity
router.put('/cart/:product_id', authenticateToken, async (req, res) => {
    try {
        const productId = req.params.product_id;
        const { quantity } = req.body;

        // Check if the item is in the cart
        const getCartItemQuery = 'SELECT * FROM cart WHERE product_id = ?';
        const [cartItemRows] = await db.promise().execute(getCartItemQuery, [productId]);

        if (cartItemRows.length === 0) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        // Get the product price
        const getProductQuery = 'SELECT price FROM products WHERE product_id = ?';
        const [productRows] = await db.promise().execute(getProductQuery, [productId]);

        if (productRows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const productPrice = productRows[0].price;
        const subtotal = productPrice * quantity;

        // Update cart item quantity and subtotal
        const updateCartItemQuery = 'UPDATE cart SET quantity = ?, subtotal = ? WHERE product_id = ?';
        await db.promise().execute(updateCartItemQuery, [quantity, subtotal, productId]);

        res.status(200).json({ message: 'Cart item quantity updated successfully' });
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Remove item from cart
router.delete('/cart/:product_id', authenticateToken, async (req, res) => {
    try {
        const productId = req.params.product_id;

        const getCartItemQuery = 'SELECT * FROM cart WHERE product_id = ?';
        const [cartItemRows] = await db.promise().execute(getCartItemQuery, [productId]);

        if (cartItemRows.length === 0) {
            return res.status(404).json({ error: 'Item not found in the cart' });
        }

        const deleteCartItemQuery = 'DELETE FROM cart WHERE product_id = ?';
        await db.promise().execute(deleteCartItemQuery, [productId]);

        res.status(200).json({ message: 'Item removed from the cart successfully' });
    } catch (error) {
        console.error('Error removing item from the cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;