const express = require('express');
const router = express.Router();
const { saveScorecard, getScorecard } = require('../controllers/scorecardController');

const { protect, adminOrScorer } = require('../middleware/authMiddleware'); 

router.post('/save/:matchId', protect, adminOrScorer, saveScorecard);

router.get('/:matchId', getScorecard);

module.exports = router;