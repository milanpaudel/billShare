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
        const groupDoc = await Group.findById(req.params.id);
        if (!groupDoc)
            return res.status(404).send('Group not found');

        const group = groupDoc.toObject();
        const balances = calculateBalances(group);

        res.render('group-details', { group, balances });
    }
    catch (err) {
        console.error('Error fetching group: ', err);
        res.status(500).send('Server error');
    }
});

router.post('/:id/expenses', async (req, res) => {
    const groupId = req.params.id;
    const { description, amount, paidBy } = req.body;

    try {
        await Group.findByIdAndUpdate(groupId, {
            $push: {
                expenses: { description, amount, paidBy }
            }
        });
        res.redirect(`/group/${groupId}`);
    } catch (err) {
        console.error('Error adding expense: ', error);
        res.status(500).send('Error adding expense');
    }
});

router.post('/:id/delete', async (req, res) => {
    try {
        await Group.findByIdAndDelete(req.params.id);
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to delete group')
    }
});

function calculateBalances(group) {
    const balances = {};
    const members = group.members;

    group.expenses.forEach(exp => {
        const splitCount = members.length;
        const splitAmount = exp.amount / splitCount;

        //subtract from each participant
        members.forEach(member => {
            if (!balances[member])
                balances[member] = 0;
            balances[member] -= splitAmount;
        });


        //add full amount to payer
        if (!balances[exp.paidBy])
            balances[exp.paidBy] = 0;
        balances[exp.paidBy] += exp.amount;
    });
    return balances;
}


module.exports = router;