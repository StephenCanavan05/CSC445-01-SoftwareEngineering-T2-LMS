const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// register a new user
router.post('/register', async (req, res) => {
    try {
        // grab data from request
        const { name, email, password, role } = req.body; 
        // create new user record
        const newUser = await User.create({
            name,
            email,
            password, 
            // assign role or default
            role: role || 'patron'
        });
        res.status(201).json({ message: 'user registered' });
    } catch (error) {
        res.status(500).json({ message: 'registration failed' });
    }
});

// login an existing user
router.post('/login', async (req, res) => {
    try {
        // grab credentials from request
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            // send invalid credentials
            return res.status(400).json({ message: 'invalid credentials' });
        }

        // sign the token
        const token = jwt.sign(
            { id: user.user_id, role: user.role },
            process.env.JWT_SECRET || 'secret_dev_key',
            { expiresIn: '1h' }
        );

        // return token and user data
        res.json({ token, user: { name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'login error' });
    }
});

module.exports = router;