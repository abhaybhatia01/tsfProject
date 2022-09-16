const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    fromName : {
        type : String,
        required: true
    },
    toName : {
        type : String,
        required: true
    },
    transferAmount : {
        type : Number,
        required: true
    }
})

module.exports =  mongoose.model('Transaction', transactionSchema);