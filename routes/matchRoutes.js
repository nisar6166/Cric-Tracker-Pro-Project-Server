const express = require('express');
const router = express.Router();
const Match = require('../models/Match');

// 1. To Create Match
router.post('/start', async (req, res) => {
    try {
        const newMatch = new Match(req.body);
        const savedMatch = await newMatch.save();
        res.status(201).json(savedMatch);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. To Update Score
router.put('/update/:id', async (req, res) => {
    const { runs, isWicket, maxOvers } = req.body;
    try {
        const match = await Match.findById(req.params.id);
        if (!match) return res.status(404).json({ message: "Match not found" });

        if (match.status === 'finished') return res.status(400).json({ message: "Match already finished" });

        if (match.currentInnings === 'teamA') {
            match.teamA.runs += Number(runs);
            if (isWicket) match.teamA.wickets += 1;
        } else {
            match.teamB.runs += Number(runs);
            if (isWicket) match.teamB.wickets += 1;
        }
       

        // Calculating the over
        match.balls += 1;
        if (match.balls === 6) {
            match.overs += 1;
            match.balls = 0;
        }

        // Winning Logic (Team B chasing)
        if (match.currentInnings === 'teamB') {
            if (match.teamB.runs > match.teamA.runs) {
                match.status = 'finished';
                match.result = `${match.teamB.name} won by ${10 - match.teamB.wickets} wickets`;
            } else if (match.teamB.wickets >= 10 || match.overs >= maxOvers) {
                match.status = 'finished';
                if (match.teamA.runs > match.teamB.runs) {
                    match.result = `${match.teamA.name} won by ${match.teamA.runs - match.teamB.runs} runs`;
                } else if (match.teamA.runs === match.teamB.runs) {
                    match.result = "Match Tied";
                }
            }
        }

        // Innings Switch Logic
        const currentTeam = match.currentInnings === 'teamA' ? match.teamA : match.teamB;
        if (match.status !== 'finished' && (currentTeam.wickets >= 10 || match.overs >= maxOvers)) {
            if (match.currentInnings === 'teamA') {
                match.currentInnings = 'teamB';
                match.overs = 0;
                match.balls = 0;
            } else {
                match.status = 'finished';
            }
        }

        await match.save();
        req.io.emit('scoreUpdate', match); 
        res.json(match);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;