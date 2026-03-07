const Match = require('../models/Match');

// 1. Create (Schedule) a new match (Basic details only)
exports.createMatch = async (req, res) => {
  try {
    const { 
      teamA, teamB, totalOvers, oversPerBowler, 
      city, ground, dateOfMatch, ballType, pitchType 
    } = req.body;

    // Ensure two different teams are selected
    if (teamA === teamB) {
      return res.status(400).json({ error: "Please select two different teams." });
    }

    const newMatch = new Match({
      teamA,
      teamB,
      totalOvers,
      oversPerBowler,
      city,
      ground,
      dateOfMatch,
      ballType,
      pitchType,
      status: 'Scheduled',
      createdBy: req.user._id
    });

    const savedMatch = await newMatch.save();
    res.status(201).json({ message: "Match scheduled successfully!", match: savedMatch });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// (Optional) Get all scheduled matches for the dashboard
exports.getScheduledMatches = async (req, res) => {
  try {
    const matches = await Match.find({ status: 'Scheduled' })
      .populate('teamA', 'teamName teamLogo')
      .populate('teamB', 'teamName teamLogo')
      .sort({ dateOfMatch: 1 }); // Show closest dates first
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Get a single match by ID (To show match details on Toss page)
exports.getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('teamA', 'teamName teamLogo location')
      .populate('teamB', 'teamName teamLogo location')
      .populate('tournament', 'tournamentName') //
      .populate('tossWonBy', 'teamName')
      .populate('battingTeam', 'teamName')
      .populate('bowlingTeam', 'teamName');
    
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.json(match);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Update Toss Details and Playing XI
exports.updateTossAndSquad = async (req, res) => {
  try {
    const { tossWonBy, optedTo, teamA_PlayingXI, teamB_PlayingXI } = req.body;
    
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found" });

    match.tossWonBy = tossWonBy;
    match.optedTo = optedTo;
    match.status = 'Live';
    
    if (teamA_PlayingXI) match.teamA_PlayingXI = teamA_PlayingXI;
    if (teamB_PlayingXI) match.teamB_PlayingXI = teamB_PlayingXI;

    const isTeamAWinner = tossWonBy === match.teamA.toString();

    if (optedTo === 'Bat') {
        match.battingTeam = tossWonBy;
        match.bowlingTeam = isTeamAWinner ? match.teamB : match.teamA;
    } else {
        match.bowlingTeam = tossWonBy;
        match.battingTeam = isTeamAWinner ? match.teamB : match.teamA;
    }

    await match.save();
    res.json({ message: "Toss and Squad updated successfully!", match });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all matches (Live, Scheduled, Completed) for Admin Dashboard
exports.getAllMatches = async (req, res) => {
  try {
    const matches = await Match.find()
      .populate('teamA', 'teamName')
      .populate('teamB', 'teamName')
      .sort({ createdAt: -1 });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Delete a Match
exports.deleteMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found" });
    res.json({ message: "Match deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. Update Match Info (Basic Details)
exports.updateMatch = async (req, res) => {
  try {
    const updatedMatch = await Match.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after' }
    );
    res.json({ message: "Match updated successfully!", match: updatedMatch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Live/Completed
exports.updateMatchStatus = async (req, res) => {
    try {
        const { status, pauseReason, manOfTheMatch, winner, isNoResult } = req.body; 
        
        const updatedMatch = await Match.findByIdAndUpdate(
            req.params.id, 
            { 
                status: status, 
                pauseReason: pauseReason || '', 
                manOfTheMatch: manOfTheMatch,
                winner: winner,             //
                isNoResult: isNoResult || false
            }, 
            { returnDocument: 'after' }
        );
        res.status(200).json(updatedMatch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};