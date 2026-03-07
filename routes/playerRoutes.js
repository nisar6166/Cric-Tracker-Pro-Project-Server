const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { protect, adminOnly, adminOrScorer } = require('../middleware/authMiddleware');
const Player = require('../models/Player');
const { deletePlayer, updatePlayer } = require('../controllers/playerController');

// --- Multer setup ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, "player-" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// 1. To add a new player (Admin and Scorer + Photo Upload)
router.post('/add', protect, adminOrScorer, upload.single('profileImage'), async (req, res) => {
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

// 4. Delete Player Route (Admin Only)
router.delete('/delete/:id', protect, adminOnly, deletePlayer);

// 5. Update Player Route (Admin Only)
router.put('/update/:id', protect, adminOnly, updatePlayer);

module.exports = router;