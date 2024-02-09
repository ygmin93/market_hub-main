const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../migrations/db');
const { authenticateAdminToken } = require('../middlewares/jwt');

const { secretKey } = require('../config/secretkey');

const router = express.Router();

// ----MANAGE USER DATA----

// DISPLAY ALL USERS INFORMATION
router.get('/users', authenticateAdminToken, async(req, res) =>{
    try{
        const getAllUsersQuery = 'SELECT user_id, name, username, password, password, email, address, phone_number FROM users';
        const[rows] = await db.promise().execute(getAllUsersQuery);

        res.status(200).json({users: rows});
    }catch(error){
        console.error('Error getting users:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

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

// UPDATE SPECIFIC USER
router.put('/user/:user_id', authenticateAdminToken, async (req, res) =>{
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
        const updateUserQuery = 'UPDATE users SET name = ?, username = ?, password = ?, email = ?, address = ?, phone_number = ? WHERE user_id = ?';
        await db.promise().execute(updateUserQuery, [name, username, hashedPassword, email, address, phone_number, userId]);

        res.status(200).json({message: 'User updated successfully'});
    }catch(error){
        console.error('Error updating user:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// DELETE SPECIFIC USER
router.delete('/user/:user_id', authenticateAdminToken, async (req, res) =>{
    try{
        const userId = req.params.user_id;

        const getUserQuery = 'SELECT * FROM users WHERE user_id = ?';
        const [userRows] = await db.promise().execute(getUserQuery, [userId]);

        if(userRows.length === 0){
            return res.status(404).json({error: 'User not found'});
        }

        const deleteUserQuery = 'DELETE FROM users WHERE user_id = ?';
        await db.promise().execute(deleteUserQuery, [userId]);

        res.status(200).json({message: 'User deleted successfully'});
    }catch(error){
        console.error('Error deleting user:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});


// ----MANAGE PRODUCTS DATA----

// Add Product to Database
router.post('/product', async (req, res) => {
    try {
        const { product_name, description, price, stock_quantity, category_id} = req.body;

        const insertProductQuery = 'INSERT INTO products(product_name, description, price, stock_quantity, category_id) VALUES (?, ?, ?, ?, ?)';
        await db.promise().execute(insertProductQuery, [product_name, description, price, stock_quantity, category_id]);

        res.status(201).json({ message: 'Product Added Successfully' });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DISPLAY ALL PRODUCTS
router.get('/products', authenticateAdminToken, async(req, res) =>{
    try{
        const getAllProductsQuery = 'SELECT product_id, product_name, description, price, stock_quantity, category_id FROM products';
        const[rows] = await db.promise().execute(getAllProductsQuery);

        res.status(200).json({products: rows});
    }catch(error){
        console.error('Error getting products:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// DISPLAY SPECIFIC PRODUCT
router.get('/product/:product_id', async(req, res)=>{
    let id = req.params.product_id;

    if(!id){
        return res.status(400).send({error: true, message: 'Please provide product id'});
    }
    try{
        db.query('SELECT product_id, product_name, description, price, stock_quantity, category_id FROM products WHERE product_id = ?', id, (err, result)=>{
            if(err){
                console.error('Error fetching data', err);
                res.status(500).json({message: 'Internal Server Error'});
            }else{
                res.status(200).json({result});
            }
        });
    }catch(error){
        console.error('Error loading product:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// UPDATE SPECIFIC PRODUCT
router.put('/product/:product_id', authenticateAdminToken, async (req, res) =>{
    try{
        const productId = req.params.product_id;
        const { product_name, description, price, stock_quantity, category_id} = req.body;

        const getProductQuery = 'SELECT * FROM products where product_id = ?';
        const [productRows] = await db.promise().execute(getProductQuery, [productId]);

        if(productRows.length === 0){
            return res.status(404).json({error: 'Product not found'});
        }

        const updateProductQuery = 'UPDATE products SET product_name = ?, description = ?, price = ?, stock_quantity = ?, category_id = ? WHERE product_id = ?';
        await db.promise().execute(updateProductQuery, [product_name, description, price, stock_quantity, category_id, productId]);

        res.status(200).json({message: 'Product updated successfully'});
    }catch(error){
        console.error('Error updating product:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// DELETE SPECIFIC PRODUCT
router.delete('/product/:product_id', authenticateAdminToken, async (req, res) =>{
    try{
        const productId = req.params.product_id;

        const getProductQuery = 'SELECT * FROM products WHERE product_id = ?';
        const [productRows] = await db.promise().execute(getProductQuery, [productId]);

        if(productRows.length === 0){
            return res.status(404).json({error: 'Product not found'});
        }

        const deleteProductQuery = 'DELETE FROM products WHERE product_id = ?';
        await db.promise().execute(deleteProductQuery, [productId]);

        res.status(200).json({message: 'Product deleted successfully'});
    }catch(error){
        console.error('Error deleting product:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// ---MANAGE PRODUCTS CATEGORY--

// Add Product Category
router.post('/category', authenticateAdminToken, async (req, res) => {
    try {
        const { category_name } = req.body;

        const insertCategoryQuery = 'INSERT INTO category(category_name) VALUES (?)';
        await db.promise().execute(insertCategoryQuery, [category_name]);

        res.status(201).json({ message: 'Category Created Successfully' });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// UPDATE SPECIFIC PRODUCT CATEGORY
router.put('/category/:category_id', authenticateAdminToken, async (req, res) =>{
    try{
        const categoryId = req.params.category_id;
        const { category_name } = req.body;

        const getCategoryQuery = 'SELECT * FROM category where category_id = ?';
        const [categoryRows] = await db.promise().execute(getCategoryQuery, [categoryId]);

        if(categoryRows.length === 0){
            return res.status(404).json({error: 'Category not found'});
        }

        const updateCategoryQuery = 'UPDATE category SET category_name = ? WHERE category_id = ?';
        await db.promise().execute(updateCategoryQuery, [category_name, categoryId]);

        res.status(200).json({message: 'Category updated successfully'});
    }catch(error){
        console.error('Error updating category:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// DELETE SPECIFIC PRODUCT CATEGORY
router.delete('/category/:category_id', authenticateAdminToken, async (req, res) =>{
    try{
        const categoryId = req.params.category_id;

        const getCategoryQuery = 'SELECT * FROM category WHERE category_id = ?';
        const [categoryRows] = await db.promise().execute(getCategoryQuery, [categoryId]);

        if(categoryRows.length === 0){
            return res.status(404).json({error: 'Category not found'});
        }

        const deleteCategoryQuery = 'DELETE FROM category WHERE category_id = ?';
        await db.promise().execute(deleteCategoryQuery, [categoryId]);

        res.status(200).json({message: 'Category deleted successfully'});
    }catch(error){
        console.error('Error deleting category:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// ----MANAGE ORDER DATA----

// DISPLAY ALL ORDERS
router.get('/orders', authenticateAdminToken, async(req, res) =>{
    try{
        const getAllOrderQuery = 'SELECT order_id, user_id, order_date, status FROM orders';
        const[rows] = await db.promise().execute(getAllOrderQuery);

        res.status(200).json({Orders: rows});
    }catch(error){
        console.error('Error loading orders:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// DISPLAY SPECIFIC ORDER
router.get('/order/:order_id', authenticateAdminToken, async(req, res)=>{
    let id = req.params.order_id;

    if(!id){
        return res.status(400).send({error: true, message: 'Please provide order id'});
    }
    try{
        db.query('SELECT order_id, user_id, order_date, status FROM orders WHERE order_id = ?', id, (err, result)=>{
            if(err){
                console.error('Error fetching data', err);
                res.status(500).json({message: 'Internal Server Error'});
            }else{
                res.status(200).json({result});
            }
        });
    }catch(error){
        console.error('Error loading orders:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// UPDATE SPECIFIC ORDER STATUS
router.put('/orders/:order_id/status', authenticateAdminToken, async (req, res) =>{
    try{
        const orderId = req.params.order_id;
        const { status } = req.body;

        const getOrderQuery = 'SELECT * FROM orders where oder_id = ?';
        const [orderRows] = await db.promise().execute(getOrderQuery, [orderId]);

        if(orderRows.length === 0){
            return res.status(404).json({error: 'Order not found'});
        }

        const updateOrderStatusQuery = 'UPDATE orders SET status = ? WHERE order_id = ?';
        await db.promise().execute(updateOrderStatusQuery, [ status, orderId ]);

        res.status(200).json({message: 'Order status updated successfully'});
    }catch(error){
        console.error('Error updating order status:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// CANCEL SPECIFIC ORDER
router.delete('/order/:order_id', authenticateAdminToken, async (req, res) =>{
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

// ---MANAGE PRODUCT REVIEWS---

// Fetch Reviews for a Product
router.get('/reviews/:product_id', authenticateAdminToken, async (req, res) => {
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

// Delete Review
router.delete('/reviews/:review_id', authenticateAdminToken, async (req, res) => {
    try {
        const reviewId = req.params.review_id;

        const deleteReviewQuery = 'DELETE FROM reviews WHERE review_id = ?';
        await db.promise().execute(deleteReviewQuery, [reviewId]);

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;