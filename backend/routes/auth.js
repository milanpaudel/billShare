const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/user');

router.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = new User({ username, password });
        await user.save();
        req.session.userId = user._id;
        res.status(201).send('User registered successfully!');
    }
    catch (err) {
        res.status(400).send('Signup failed!')
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt: ', username);
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).send('No such user');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Incorrect password')
            return res.status(401).send('Incorect Password');
        }

        req.session.userId = user._id;
        console.log('Login successful!');
        res.redirect('/dashboard');
    }
    catch (err) {
        console.error('Login error: ', err)
        res.status(500).send('Login error!');
    }
});


module.exports = router;