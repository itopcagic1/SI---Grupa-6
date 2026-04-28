const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter, validate } = require('../middleware/authMiddleware');
const { registerSchema, loginSchema } = require('../utils/validators');

router.post('/register', authLimiter, authController.register);

router.post('/login', authLimiter, validate(loginSchema), authController.login);

module.exports = router;
