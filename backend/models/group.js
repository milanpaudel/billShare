const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
    name: { type: String, required: true },
    members: [String],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expenses: [{
        description: String,
        amount: Number,
        paidBy: String,
        date: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('Group', groupSchema);