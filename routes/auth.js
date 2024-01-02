const express = require('express');
const router = express.Router();

const {
    signup,
    signin,
    send,
    batchsend
} = require('../controller/auth');

const {
    userSignupValidator,
    userSigninValidator,
} = require('../validators/auth');
const { runValidation } = require('../validators');


router.post('/signup', userSignupValidator, runValidation, signup);
router.post('/signin', userSigninValidator, runValidation, signin);
router.post('/singlesend' ,send);
router.post('/batchsend' ,batchsend);


module.exports = router;