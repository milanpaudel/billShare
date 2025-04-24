const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const authRoutes = require('./backend/routes/auth');
const groupRoutes = require('./backend/routes/group');
const exphbs = require('express-handlebars');
const User = require('./backend/models/user');
const Group = require('./backend/models/group');
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
app.use('/group', groupRoutes);

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/dashboard', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }
    try {
        const group = await Group.find({ createdBy: req.session.userId }).lean();
        res.render('dashboard', {
            username: req.session.username || 'User',
            group
        });
    }
    catch (err) {
        console.error('Error loading dashboard: ', err);
        res.status(500).send('Server error');
    }

});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})