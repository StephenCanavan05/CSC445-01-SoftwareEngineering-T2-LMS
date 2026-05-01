const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ message: 'no token, authorization denied' });
    }

    // clean
    const token = authHeader.split(' ')[1];

    try {
        // verify the token using secret key, will use a fallback placeholder key otherwise
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_dev_key');
        
        // attach the user data to the request object so routes can use it
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'token is not valid' });
    }
};

module.exports = auth;