const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../migrations/db');
const { authenticateToken } = require('../middlewares/jwt');
const { secretKey } = require('../config/secretkey');

const router = express.Router();

// Add items to order
router.post('/order_item', async (req, res) => {
    try {
        const { order_id, product_id, quantity, subtotal } = req.body;

        const insertOrderItemQuery = 'INSERT INTO order_items(order_id, product_id, quantity, subtotal ) VALUES (?, ?, ?, ?)';
        await db.promise().execute(insertOrderItemQuery, [order_id, product_id, quantity, subtotal ]);

        res.status(201).json({ message: 'Item Added Successfully' });
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ----ORDERED ITEMS DATA----

// DISPLAY ALL ITEMS IN ORDER
router.get('/order_items', authenticateToken, async(req, res) =>{
    try{
        const getAllOrderItemsQuery = 'SELECT order_item_id, order_id, product_id, quantity, subtotal FROM order_items';
        const[rows] = await db.promise().execute(getAllOrderItemsQuery);

        res.status(200).json({Items: rows});
    }catch(error){
        console.error('Error loading items:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// DISPLAY SPECIFC ITEM IN ORDER
router.get('/order_item/:order_item_id', async(req, res)=>{
    let id = req.params.order_item_id;

    if(!id){
        return res.status(400).send({error: true, message: 'Please provide order item id'});
    }
    try{
        db.query('SELECT order_item_id, order_id, product_id, quantity, subtotal FROM order_items WHERE order_item_id = ?', id, (err, result)=>{
            if(err){
                console.error('Error fetching data', err);
                res.status(500).json({message: 'Internal Server Error'});
            }else{
                res.status(200).json({result});
            }
        });
    }catch(error){
        console.error('Error loading item:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// UPDATE SPECIFIC ITEM IN ORDER
router.put('/order_item/:order_item_id', authenticateToken, async (req, res) =>{
    try{
        const orderItemId = req.params.order_item_id;
        const { order_id, product_id, quantity } = req.body;

        const getOrderItemQuery = 'SELECT * FROM order_items where oder_item_id = ?';
        const [orderItemRows] = await db.promise().execute(getOrderItemQuery, [orderItemId]);

        if(orderItemRows.length === 0){
            return res.status(404).json({error: 'Item not found'});
        }

        const getProductQuery = 'SELECT price FROM products WHERE product_id = ?';
        const [productRows] = await db.promise().execute(getProductQuery, [product_id]);

        const productPrice = productRows[0].price;
        const subtotal = productPrice * quantity;

        const updateOrderItemQuery = 'UPDATE order_items SET order_id = ?, product_id = ?, quantity = ?, subtotal = ? WHERE order_item_id = ?';
        await db.promise().execute(updateOrderItemQuery, [order_id, product_id, quantity, subtotal ]);

        res.status(200).json({message: 'Item updated successfully'});
    }catch(error){
        console.error('Error updating item:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// DELETE SPECIFIC ITEM IN ORDER
router.delete('/order_item/:order_item_id', authenticateToken, async (req, res) =>{
    try{
        const orderItemId = req.params.order_item_id;

        const getOrderItemQuery = 'SELECT * FROM order_items WHERE order_item_id = ?';
        const [orderItemRows] = await db.promise().execute(getOrderItemQuery, [orderItemId]);

        if(orderItemRows.length === 0){
            return res.status(404).json({error: 'Item not found'});
        }

        const deleteOrderItemQuery = 'DELETE FROM order_items WHERE order_item_id = ?';
        await db.promise().execute(deleteOrderItemQuery, [orderItemId]);

        res.status(200).json({message: 'Item deleted successfully'});
    }catch(error){
        console.error('Error deleting order item:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

module.exports = router;