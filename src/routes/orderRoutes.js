const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../migrations/db');
const { authenticateToken } = require('../middlewares/jwt');
const { secretKey } = require('../config/secretkey');

const router = express.Router();

// Place Order
router.post('/place-order', authenticateToken, async (req, res) => {
    try {
        const { user_id } = req.body;

        // Check if the cart is not empty
        const checkCartQuery = 'SELECT * FROM cart WHERE user_id = ?';
        const [cartItemsRows] = await db.promise().execute(checkCartQuery, [user_id]);

        if (cartItemsRows.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Create the order
        const status = 'Pending';
        const insertOrderQuery = 'INSERT INTO orders (user_id, order_date, status) VALUES (?, NOW(), ?)';
        const [orderResult] = await db.promise().execute(insertOrderQuery, [user_id, status]);

        // Get the last inserted order ID
        const orderId = orderResult.insertId;

        // Move cart items to order_items and update product quantities
        const moveCartItemsToOrderQuery = `
            INSERT INTO order_items (order_id, product_id, quantity, subtotal)
            SELECT ?, cart.product_id, cart.quantity, (cart.quantity * products.price) AS subtotal
            FROM cart
            INNER JOIN products ON cart.product_id = products.product_id
            WHERE cart.user_id = ?
        `;
        await db.promise().execute(moveCartItemsToOrderQuery, [orderId, user_id]);

        // Update product quantities in products table
        const updateProductQuantitiesQuery = `
            UPDATE products
            INNER JOIN cart ON products.product_id = cart.product_id
            SET products.stock_quantity = products.stock_quantity - cart.quantity
            WHERE cart.user_id = ?
        `;
        await db.promise().execute(updateProductQuantitiesQuery, [user_id]);

        // Clear the user's cart
        const clearCartQuery = 'DELETE FROM cart WHERE user_id = ?';
        await db.promise().execute(clearCartQuery, [user_id]);

        res.status(201).json({ message: 'Order Placed Successfully' });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// ----ORDER DATA----

// DISPLAY ALL ORDERS
router.get('/orders', authenticateToken, async(req, res) =>{
    try{
        const getAllOrderQuery = 'SELECT order_id, user_id, order_date, status FROM orders';
        const[rows] = await db.promise().execute(getAllOrderQuery);

        res.status(200).json({Orders: rows});
    }catch(error){
        console.error('Error loading orders:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// Get user's order history with product details
router.get('/order/user/:user_id/order/history', authenticateToken, async (req, res) => {
    const userID = req.params.user_id;
    try {
        const getOrderHistoryQuery = `
            SELECT 
                orders.order_id, orders.order_date, orders.status,
                order_items.product_id, order_items.quantity, order_items.subtotal,
                products.product_name
            FROM orders
            INNER JOIN order_items ON orders.order_id = order_items.order_id
            INNER JOIN products ON order_items.product_id = products.product_id
            WHERE orders.user_id = ?
        `;
        
        const [orderRows] = await db.promise().execute(getOrderHistoryQuery, [userID]);

        // Transform the result to a structured response
        const formattedOrders = orderRows.reduce((acc, order) => {
            const existingOrder = acc.find(o => o.order_id === order.order_id);

            if (existingOrder) {
                existingOrder.items.push({
                    product_id: order.product_id,
                    product_name: order.product_name,
                    quantity: order.quantity,
                    subtotal: order.subtotal,
                });
            } else {
                const newOrder = {
                    order_id: order.order_id,
                    order_date: order.order_date,
                    status: order.status,
                    items: [{
                        product_id: order.product_id,
                        product_name: order.product_name,
                        quantity: order.quantity,
                        subtotal: order.subtotal,
                    }],
                };
                acc.push(newOrder);
            }

            return acc;
        }, []);

        res.status(200).json({ user_id: userID, orders: formattedOrders });
    } catch (error) {
        console.error('Error retrieving order history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// CANCEL ORDER
router.delete('/order/:order_id', authenticateToken, async (req, res) =>{
    try{
        const orderId = req.params.order_id;

        const getOrderQuery = 'SELECT * FROM orders WHERE order_id = ?';
        const [orderRows] = await db.promise().execute(getOrderQuery, [orderId]);

        if(orderRows.length === 0){
            return res.status(404).json({error: 'Order not found'});
        }

        const deleteOrderQuery = 'DELETE FROM orders WHERE order_id = ?';
        await db.promise().execute(deleteOrderQuery, [orderId]);

        res.status(200).json({message: 'Order deleted successfully'});
    }catch(error){
        console.error('Error deleting order:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});


module.exports = router;
