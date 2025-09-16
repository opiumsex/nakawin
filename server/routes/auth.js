const express = require('express');
const { register, login, logout, getAuthStatus, getProfile } = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.get('/status', getAuthStatus);
router.get('/profile', optionalAuth, getProfile);

module.exports = router;