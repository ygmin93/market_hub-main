const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../migrations/db');
const { authenticateToken } = require('../middlewares/jwt');
const { secretKey } = require('../config/secretkey');

const router = express.Router();


// ----CATEGORY DATA----

// DISPLAY ALL PRODUCT CATEGORIES
router.get('/categories', authenticateToken, async(req, res) =>{
    try{
        const getAllCategoriesQuery = 'SELECT category_id, category_name FROM category';
        const[rows] = await db.promise().execute(getAllCategoriesQuery);

        res.status(200).json({categories: rows});
    }catch(error){
        console.error('Error getting categories:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// DISPLAY SPECIFIC PRODUCT CATEGORY
router.get('/category/:category_id', async(req, res)=>{
    let id = req.params.category_id;

    if(!id){
        return res.status(400).send({error: true, message: 'Please provide category id'});
    }
    try{
        db.query('SELECT category_id, category_name FROM category WHERE category_id = ?', id, (err, result)=>{
            if(err){
                console.error('Error fetching data', err);
                res.status(500).json({message: 'Internal Server Error'});
            }else{
                res.status(200).json({result});
            }
        });
    }catch(error){
        console.error('Error loading category:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

module.exports = router;