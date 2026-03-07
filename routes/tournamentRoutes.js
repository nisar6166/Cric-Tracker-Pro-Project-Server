const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// --- Multer Setup ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => { cb(null, "tourney-" + Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage });

// 1. to create tournament
router.post('/create', protect, adminOnly, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), async (req, res) => {
    try {
        const tournamentData = {
            ...req.body,
            tournamentLogo: req.files && req.files['logo'] ? req.files['logo'][0].path : "",
            tournamentBanner: req.files && req.files['banner'] ? req.files['banner'][0].path : "",
            createdBy: req.user._id
        };
        const newTournament = new Tournament(tournamentData);
        const savedTournament = await newTournament.save();
        res.status(201).json({ message: "Created successfully!", tournament: savedTournament });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

//2. to listing all tournaments 
router.get('/all', async (req, res) => {
    try {
        const tournaments = await Tournament.find().sort({ createdAt: -1 });
        res.json(tournaments);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

//3. to take tull data from tournament(Teams + Matches)
router.get('/:id', async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id)
            .populate('teams')
            .populate({
                path: 'matches',
                populate: { path: 'teamA teamB', select: 'teamName teamLogo' }
            })
            .populate('pools.teams');
            
        if (!tournament) return res.status(404).json({ error: "Tournament not found" });
        res.json(tournament);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

//4. table pool wise (Pool A, B, etc.)
router.put('/:id/assign-pools', protect, adminOnly, async (req, res) => {
    try {
        const { pools } = req.body; 
        const updatedTournament = await Tournament.findByIdAndUpdate(
            req.params.id,
            { pools, 'knockoutSettings.currentStage': 'League' },
            { returnDocument: 'after' }
        ).populate('pools.teams');

        res.json({ message: "Pools assigned successfully!", tournament: updatedTournament });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. to schedule matches
router.post('/:id/schedule-match', protect, adminOnly, async (req, res) => {
    try {
        const { teamA, teamB, date, totalOvers } = req.body;
        const tournament = await Tournament.findById(req.params.id);
        
        if (!tournament) return res.status(404).json({ error: "Tournament not found" });

        const newMatch = new Match({
            tournament: tournament._id,
            teamA,
            teamB,
            date,
            totalOvers,
            city: tournament.city,
            ground: tournament.ground,
            status: 'Scheduled'
        });

        const savedMatch = await newMatch.save();
        tournament.matches.push(savedMatch._id);
        await tournament.save();

        res.status(201).json({ message: "Match scheduled successfully!", match: savedMatch });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. to automatically generate knockout matches
router.post('/:id/generate-knockouts', protect, async (req, res) => { 
    try {
        const { stage, matches } = req.body; 
        
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) return res.status(404).json({ error: "Tournament not found" });

        const createdMatches = [];

        for (let m of matches) {
            const newMatch = new Match({
                tournament: tournament._id,
                teamA: m.teamA,
                teamB: m.teamB,
                date: m.date,
                totalOvers: m.totalOvers || 10,
                status: 'Scheduled',
                roundName: stage,
                city: tournament.city,
                ground: tournament.ground
            });
            const savedMatch = await newMatch.save();
            createdMatches.push(savedMatch._id);
        }

        await Tournament.findByIdAndUpdate(req.params.id, {
            $push: { matches: { $each: createdMatches } },
            'knockoutSettings.currentStage': stage
        }, { returnDocument: 'after' });

        res.json({ message: `${stage} matches generated successfully!`, matches: createdMatches });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. to enter knockout stages (Semi/Final)
router.put('/:id/update-stage', protect, adminOnly, async (req, res) => {
    try {
        const { nextStage } = req.body;
        const updatedTournament = await Tournament.findByIdAndUpdate(
            req.params.id,
            { 'knockoutSettings.currentStage': nextStage },
            { returnDocument: 'after' }
        );
        res.json({ message: `Tournament moved to ${nextStage}`, tournament: updatedTournament });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 8. update tournament
router.put('/update/:id', protect, adminOnly, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), async (req, res) => {
    try {
        let updateData = { ...req.body };
        if (req.files && req.files['logo']) updateData.tournamentLogo = req.files['logo'][0].path;
        if (req.files && req.files['banner']) updateData.tournamentBanner = req.files['banner'][0].path;

        const updatedTournament = await Tournament.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { returnDocument: 'after' }
        );
        res.json({ message: "Updated successfully!", tournament: updatedTournament });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 9. to delete tournament
router.delete('/delete/:id', protect, adminOnly, async (req, res) => {
    try {
        await Tournament.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 10. to add team
router.post('/:id/add-team', protect, adminOnly, async (req, res) => {
    try {
        const { teamId } = req.body;
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) return res.status(404).json({ error: "Tournament not found" });
        if (tournament.teams.includes(teamId)) return res.status(400).json({ error: "Team is already in this tournament" });

        tournament.teams.push(teamId);
        await tournament.save();
        res.json({ message: "Team added successfully!", tournament });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// to remove team from tournament
router.put('/:id/remove-team', protect, adminOnly, async (req, res) => {
    try {
        const { teamId } = req.body;
        const tournament = await Tournament.findById(req.params.id);
        
        tournament.teams = tournament.teams.filter(id => id.toString() !== teamId);
        
        tournament.pools.forEach(pool => {
            pool.teams = pool.teams.filter(t => t.toString() !== teamId);
        });

        await tournament.save();
        res.json({ message: "Team removed from tournament", tournament });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;