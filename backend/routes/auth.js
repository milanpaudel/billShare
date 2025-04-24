const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/user');

//handles GET request. Show signup page
router.get('/signup', (req, res) => {
    res.render('signup', { title: 'Sign Up' });
});

//handles Post request. Handles signup form
router.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).render('signup', {
                error: 'Username already exists',
                username,
            });
        }

        const user = new User({ username, password });
        await user.save();
        req.session.userId = user._id;
        res.redirect('/auth/login');
    }
    catch (err) {
        console.log('Signup error: ', err)
        res.status(500).render('Signup', {
            error: 'Signup failed!',
            username,
        });
    }
});

//handles GET request. Show login page
router.get('/login', (req, res) => {
    res.render('login', { title: 'Log In' });
});

//handles Post request. Handle login form
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    console.log('Login attempt: ', username);
    try {

        if (!user) {
            return res.status(401).render('login', {
                error: 'User not found',
                username,
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Incorrect password')
            return res.status(401).render('login', {
                error: 'Incorect Password',
                username,
            });
        }

        req.session.userId = user._id;
        req.session.username = user.username;
        console.log('Login successful!');
        res.redirect('/dashboard');
    }
    catch (err) {
        console.error('Login error: ', err)
        res.status(500).send('Login error!');
    }
});

//handles GET request. Redirect to homepage
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
})


module.exports = router;