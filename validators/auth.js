const { check } = require('express-validator');

exports.userSignupValidator = [
    check('userName')
        .not()
        .isEmpty()
        .withMessage('Name is required'),
    check('userEmail')
        .isEmail()
        .withMessage('Must be a valid email address'),
    check('userPassword')
        .isLength({ min: 6 })
        .withMessage('Password must be at least  6 characters long')
];

exports.userSigninValidator = [
    check('email')
        .isEmail()
        .withMessage('Must be a valid email address'),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least  6 characters long')
];