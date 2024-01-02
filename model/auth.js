const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    publicKey: {
        type: String,
        required: true,
    },
    secretKey:{
        type:String,
        required:true,
    },
    userid: {
        type: Number,
        required: true,
        unique: true,
    },
});


const User = mongoose.model('User', userSchema);

module.exports = User;