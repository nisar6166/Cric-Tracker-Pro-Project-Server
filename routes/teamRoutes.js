const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Team = require('../models/Team');

const { protect, adminOnly } = require('../middleware/authMiddleware'); 
const { deleteTeam, updateTeam } = require('../controllers/teamController');

// --- Multer Setup for Logo Upload ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, "team-" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// 1. Route to create a new team (Admin Only)
router.post('/add', protect, adminOnly, upload.single('teamLogo'), async (req, res) => {
    try {
        const teamData = {
            ...req.body,
            teamLogo: req.file ? req.file.path : ""
        };
        const newTeam = new Team(teamData);
        const savedTeam = await newTeam.save();
        res.status(201).json(savedTeam);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Route to get all teams
router.get('/all', async (req, res) => {
    try {
        const teams = await Team.find();
        res.json(teams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Route to delete a team (Admin Only)
router.delete('/delete/:id', protect, adminOnly, deleteTeam);

// 4. Route to update a team (Admin Only)
router.put('/update/:id', protect, adminOnly, updateTeam);

module.exports = router;