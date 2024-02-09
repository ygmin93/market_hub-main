const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../migrations/db');
const { authenticateToken } = require('../middlewares/jwt');
const { secretKey } = require('../config/secretkey');

const router = express.Router();

// ----PRODUCTS DATA----

// DISPLAY ALL PRODUCTS
router.get('/products', authenticateToken, async(req, res) =>{
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
router.get('/product/:product_id', authenticateToken, async(req, res)=>{
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

module.exports = router;