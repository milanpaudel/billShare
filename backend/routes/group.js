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

router.get('/:groupId/edit', async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return res.status(404).send('Group not found');
        }
        res.render('edit-group', { group: group.toObject() });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading edit group page');
    }
});

router.post('/:groupId/edit', async (req, res) => {
    const { groupId } = req.params;
    const { name, members } = req.body;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).send('Group not found');
        }

        group.name = name;

        group.members = members.split(',').map(member => member.trim());

        await group.save();
        res.redirect(`/group/${groupId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating group');
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

router.post('/:groupId/expenses/:expenseId/edit', async (req, res) => {
    const { groupId, expenseId } = req.params;
    const { description, amount, paidBy } = req.body;

    try {
        const group = await Group.findById(groupId);
        const expense = group.expenses.id(expenseId);
        if (!expense) {
            return res.status(404).send("Expense Not found");
        }

        //update fields
        expense.description = description;
        expense.amount = amount;
        expense.paidBy = paidBy;

        await group.save();
        res.redirect(`/group/${groupId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating expense");
    }
});
router.delete('/:groupId/expenses/:expenseId/delete', async (req, res) => {
    const { groupId, expenseId } = req.params;
    console.log(`GroupId: ${groupId}, ExpenseId: ${expenseId}`);

    try {
        const group = await Group.findById(groupId);
        const expense = group.expenses.id(expenseId);

        if (!expense) {
            return res.status(404).send('Expense not found');
        }

        //remove the expense
        expense.deleteOne();
        await group.save();
        res.status(200).json({ message: 'Expense Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting expense')
    }
});

router.delete('/:groupId/delete', async (req, res) => {
    const { groupId } = req.params;
    try {
        await Group.findByIdAndDelete(groupId);
        res.status(200).send('Group deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting group');
    }
});



module.exports = router;