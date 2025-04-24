const express = require('express');
const router = express.Router();
const Group = require('../models/group');
const User = require('../models/user');

//GET form to create group
router.get('/create', (req, res) => {
    if (!req.session.userId)
        return res.redirect('/auth/login');
    res.render('create-group');
});

//POST create group
router.post('/create', async (req, res) => {
    const { name, members } = req.body;
    try {
        const usernames = members.split(',').map(u => u.trim());
        const group = new Group({
            name,
            members: [...new Set([...usernames])],
            createdBy: req.session.userId
        });
        await group.save();

        res.redirect('/dashboard');     //or /groups/:id
    }
    catch (err) {
        console.error('Group creation failed: ', err);
        res.status(500).send('Group creation failed');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group)
            return res.status(404).send('Group not found');
        res.render('group-details', { group });
    }
    catch (err) {
        console.error('Error fetching group: ', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;