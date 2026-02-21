const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    // Team ID 
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    mobile: { type: String, required: true },
    age: { type: Number, required: true }, 
    profileImage: { type: String, default: "" },
    role: { 
        type: String, 
        enum: ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'], 
        default: 'Batsman' 
    },
    stats: {
        matches: { type: Number, default: 0 },
        runs: { type: Number, default: 0 },
        ballsFaced: { type: Number, default: 0 },
        wickets: { type: Number, default: 0 },
        fifties: { type: Number, default: 0 },
        hundreds: { type: Number, default: 0 },
        highestScore: { type: Number, default: 0 },
        bestBowling: { type: String, default: "0/0" }
    }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true });

// Strike Rate calculate method:
// $$SR = \frac{\text{runs}}{\text{ballsFaced}} \times 100$$
playerSchema.virtual('strikeRate').get(function() {
    return this.stats.ballsFaced > 0 ? ((this.stats.runs / this.stats.ballsFaced) * 100).toFixed(2) : 0;
});

module.exports = mongoose.model('Player', playerSchema);