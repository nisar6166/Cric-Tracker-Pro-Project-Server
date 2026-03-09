const Scorecard = require('../models/Scorecard');
const Match = require('../models/Match');

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

        const match = await Match.findById(matchId);
        if (match) {
            const teamAId = String(match.teamA);
            const teamBId = String(match.teamB);

            const matchUpdate = {};

            const applyInnings = (innings, teamIdStr) => {
                if (!innings || !innings.team) return;
                const inningsTeamId = String(innings.team);
                const runs  = innings.runs  ?? 0;
                const wkts  = innings.wickets ?? 0;
                const ovrs  = innings.overs  ?? 0;
                const blls  = innings.balls  ?? 0;

                if (inningsTeamId === teamAId) {
                    matchUpdate.scoreA   = runs;
                    matchUpdate.wicketsA = wkts;
                    matchUpdate.oversA   = ovrs;
                    matchUpdate.ballsA   = blls;
                } else if (inningsTeamId === teamBId) {
                    matchUpdate.scoreB   = runs;
                    matchUpdate.wicketsB = wkts;
                    matchUpdate.oversB   = ovrs;
                    matchUpdate.ballsB   = blls;
                }
            };

            applyInnings(scorecardData.firstInnings,  teamAId);
            applyInnings(scorecardData.secondInnings, teamBId);

            if (Object.keys(matchUpdate).length > 0) {
                await Match.findByIdAndUpdate(matchId, { $set: matchUpdate });
            }
        }

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