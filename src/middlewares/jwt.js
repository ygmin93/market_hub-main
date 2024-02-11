const jwt = require('jsonwebtoken');
const { secretKey } = require('../../src/config/secretkey');

const authenticateToken = (req, res, next) => {
    const userToken = req.headers.authorization;

    if (!userToken) {
        return res.status(401).json({ error: 'Unauthorized: Token is missing' });
    }

    jwt.verify(userToken, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden: Invalid Token' });
        }
        req.user = user;
        next();
    });
};

const authenticateAdminToken = (req, res, next) => {
    const adminToken = req.headers.authorization;

    if (!adminToken) {
        return res.status(401).json({ error: 'Unauthorized: Token is missing' });
    }

    jwt.verify(adminToken, secretKey, (err, user) => {
        if (err || user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Invalid or insufficient privileges' });
        }
        req.user = user;
        next();
    });
};

module.exports = { authenticateToken, authenticateAdminToken };
