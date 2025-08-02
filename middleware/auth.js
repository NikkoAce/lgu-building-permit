const jwt_auth = require('jsonwebtoken');
const JWT_SECRET_AUTH = process.env.JWT_SECRET || 'your_super_secret_key_change_this_later';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt_auth.verify(token, JWT_SECRET_AUTH);
        req.user = decoded.user; // Add user info to the request object
        next(); // Proceed to the next function
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

module.exports = authMiddleware;