const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const Player = require('../models/Player');

// 1. To add new player (Admin only)
router.post('/add', protect, adminOnly, async (req, res) => {
    try {
        const newPlayer = new Player(req.body);
        const savedPlayer = await newPlayer.save();
        res.status(201).json(savedPlayer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. To view all players in a specific team
router.get('/team/:teamName', async (req, res) => {
    try {
        const players = await Player.find({ team: req.params.teamName });
        res.json(players);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;