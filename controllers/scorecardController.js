const Scorecard = require('../models/Scorecard');

exports.saveScorecard = async (req, res) => {
    try {
        const { matchId } = req.params;
        const scorecardData = req.body;
        
        scorecardData.match = matchId;

        const scorecard = await Scorecard.findOneAndUpdate(
            { match: matchId }, 
            { $set: scorecardData }, 
            { returnDocument: 'after', upsert: true } 
        );
        
        res.status(200).json({ message: "Scorecard saved successfully", scorecard });
    } catch (error) {
        console.error("Error saving scorecard:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getScorecard = async (req, res) => {
    try {
        const scorecard = await Scorecard.findOne({ match: req.params.matchId })
            .populate('firstInnings.team', 'teamName shortName')
            .populate('secondInnings.team', 'teamName shortName')
            .populate('firstInnings.batters.player', 'name role')
            .populate('firstInnings.bowlers.player', 'name role')
            .populate('secondInnings.batters.player', 'name role')
            .populate('secondInnings.bowlers.player', 'name role')
            .lean();
            
        if (!scorecard) {
            return res.status(404).json({ message: "Scorecard not found yet" });
        }
        
        res.status(200).json(scorecard);
    } catch (error) {
        console.error("GET Scorecard Error:", error);
        res.status(500).json({ error: "Failed to fetch scorecard. Check backend console." });
    }
};