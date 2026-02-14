const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    matchName: { type: String, required: true },
    teamA: { name: String, runs: { type: Number, default: 0 }, wickets: { type: Number, default: 0 } },
    teamB: { name: String, runs: { type: Number, default: 0 }, wickets: { type: Number, default: 0 } },
    overs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 }, // 0 to 5
    currentInnings: { type: String, default: 'teamA' },
    status: { type: String, enum: ['upcoming', 'live', 'finished'], default: 'upcoming' },
    history: [{ ball: Number, run: Number, type: String }], // Ball-by-ball history
    
    result: { type: String, default: "" }
    
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);