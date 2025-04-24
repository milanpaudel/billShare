const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const authRoutes = require('./backend/routes/auth');
const exphbs = require('express-handlebars');
const User = require('./backend/models/user');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.engine('hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'backend', 'views', 'layouts')
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'backend', 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.err('MongoDB error: ', err));

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/dashboard', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.redirect('/auth/login');
        }
        res.render('dashboard', { username: user.username }); //this can be easily expanded to show other things like email.
    }
    catch (err) {
        console.error('Dashboard error: ', err);
        res.status(500).send('Something went wrong');
    }

});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})