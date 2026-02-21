const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const Player = require('../models/Player');

// --- Multer setup ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // to save photo from folder
    },
    filename: (req, file, cb) => {
        cb(null, "player-" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// 1. To add a new player (Admin only + Photo Upload)
router.post('/add', protect, adminOnly, upload.single('profileImage'), async (req, res) => {
    try {
        const playerData = {
            ...req.body,
            profileImage: req.file ? req.file.path : "" 
        };

        const newPlayer = new Player(playerData);
        const savedPlayer = await newPlayer.save();
        res.status(201).json(savedPlayer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. To view all players in a specific team
router.get('/team/:teamId', async (req, res) => {
    try {
    
        const players = await Player.find({ team: req.params.teamId });
        res.json(players);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. To list all players (Optional: To view all players)
router.get('/all', async (req, res) => {
    try {
        const players = await Player.find().populate('team', 'teamName');
        res.json(players);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;