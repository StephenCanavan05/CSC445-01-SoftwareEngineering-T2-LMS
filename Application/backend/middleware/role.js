// check user against allowed roles
const checkRole = (roles) => {
    return (req, res, next) => {
        // block if role not allowed
        if (!roles.includes(req.user.role)) {
            // send status
            return res.status(403).json({ message: 'access denied: staff only' });
        }
        next();
    };
};

module.exports = checkRole;