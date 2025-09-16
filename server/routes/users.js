const express = require('express');
const { updateProfile, getLeaderboard, getUserStats } = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.put('/profile', requireAuth, updateProfile);
router.get('/leaderboard', getLeaderboard);
router.get('/stats', requireAuth, getUserStats);

module.exports = router;