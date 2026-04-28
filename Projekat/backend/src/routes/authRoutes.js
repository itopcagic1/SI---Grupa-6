const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authLimiter, validate, authenticateToken } = require('../middleware/authMiddleware');
const { registerSchema, loginSchema } = require('../utils/validators');


// registracija
router.post('/register', authLimiter, validate(registerSchema), authController.register);

// login
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// logout (zaštićena ruta)
router.post('/logout', authenticateToken, authController.logout);

// profile (zaštićena ruta)
router.get('/profile', authenticateToken, authController.profile);

module.exports = router;