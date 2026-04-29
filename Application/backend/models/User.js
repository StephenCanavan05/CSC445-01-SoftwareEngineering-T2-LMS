const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // ensure the header follows the format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Token format must be "Bearer <token>"' });
    }

    const token = parts[1];

    try {
        // use the same fallback key for
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_dev_key');
        
        // attach user info
        req.user = decoded;
        
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = auth;