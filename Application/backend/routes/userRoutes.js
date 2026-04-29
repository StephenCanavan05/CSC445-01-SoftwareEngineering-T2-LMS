const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // the hook in the User model handles the hashing
        const newUser = await User.create({
            username,
            email,
            password_hash: password, 
            role
        });

        res.status(201).json({ message: 'user created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'error during registration' });
    }
});

// login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. find the user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'invalid credentials' });
        }

        // 2. compare the password with the hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'invalid credentials' });
        }

        // 3. create a token 
        const token = jwt.sign(
            { id: user.user_id, role: user.role },
            process.env.JWT_SECRET || 'supersecretkey',
            { expiresIn: '1h' }
        );

        res.json({ token, user: { username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'server error during login' });
    }
});

module.exports = router;