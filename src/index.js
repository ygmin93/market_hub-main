const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { authenticateToken, authenticateAdminToken } = require('../src/middlewares/jwt');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('../src/routes/productCategoryRoutes');
const productCategoryRoutes = require('../src/routes/productRoutes');
const orderItemsRoutes = require('../src/routes/orderItemsRoutes');
const orderRoutes = require('../src/routes/orderRoutes');
const cartRoutes = require('../src/routes/cartRoutes');
const reviewsRoutes = require('../src/routes/reviewsRoutes');
const authenticationRoutes = require('../src/routes/authenticationRoutes');
const userProfileRoutes = require('../src/routes/userProfileRoutes');
const db = require('../migrations/db');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 8080;

// app.use('/api', (req, res, next) => {
//     const token = req.headers['authorization'];
    
//     if (req.path === '/login' && req.method === 'POST') {
//         return next();
//     }
//     authenticateToken(req, res, next);
// }, authenticationRoutes);

app.use('/api', authenticationRoutes);

// -- ADMIN --
app.use('/api', authenticateAdminToken, adminRoutes);

// -- NON-ADMIN --
app.use('/api', authenticateToken, userProfileRoutes);
app.use('/api', authenticateToken, productRoutes);
app.use('/api', authenticateToken, productCategoryRoutes);
app.use('/api', authenticateToken, orderItemsRoutes);
app.use('/api', authenticateToken, orderRoutes);
app.use('/api', authenticateToken, cartRoutes);
app.use('/api', authenticateToken, reviewsRoutes);
app.use('/api', authenticateToken, authenticationRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
