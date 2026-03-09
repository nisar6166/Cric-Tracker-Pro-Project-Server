const express = require('express');
const router = express.Router();

// Middleware imports
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Controller imports
const { 
    createMatch, 
    getScheduledMatches, 
    getMatchById, 
    updateTossAndSquad,
    getAllMatches,
    deleteMatch,
    updateMatch    
} = require('../controllers/matchController');

const Match = require('../models/Match'); 

// 1. Route to create match (Admin only)
router.post('/create', protect, adminOnly, createMatch);

// 2. Route to get scheduled matches only
router.get('/scheduled', getScheduledMatches);

// 3. Route to get ALL matches (Live, Scheduled, Completed)
router.get('/all', getAllMatches);

// 4. Route to Delete match (Admin only)
router.delete('/delete/:id', protect, adminOnly, deleteMatch);

// 5. Route to Edit match details and STATUS
router.put('/update/:id', protect, updateMatch);

// 6. UPDATE MATCH SCORE & LIVE TRACKING
router.put('/update-score/:id', protect, async (req, res) => {
    try {
        const matchId = req.params.id;
        const updateData = req.body;

        const updatedMatch = await Match.findByIdAndUpdate(
            matchId,
            { $set: updateData }, 
            { new: true } 
        );

        if (!updatedMatch) {
            return res.status(404).json({ error: "Match not found!" });
        }

        req.io.emit('score_update', updatedMatch);

        res.status(200).json({ success: true, message: "Score updated!", match: updatedMatch });
    } catch (error) {
        console.error("Score Update Error:", error);
        res.status(500).json({ error: "Failed to update score." });
    }
});

// 7. Route to fetch a single match by ID
router.get('/:id', getMatchById);

// 8. Route to update Toss and Playing XI
router.put('/:id/toss', protect, updateTossAndSquad);

module.exports = router;