const express = require('express');
const { getCases, openCase, addCase, updateCase } = require('../controllers/caseController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', getCases);
router.post('/open', requireAuth, openCase);
router.post('/add', requireAuth, addCase);
router.put('/:caseId', requireAuth, updateCase);

module.exports = router;