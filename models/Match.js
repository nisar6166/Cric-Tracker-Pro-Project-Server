const mongoose = require('mongoose');

const battingSchema = new mongoose.Schema({
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    name: { type: String },
    runs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    isOut: { type: Boolean, default: false },
    dismissal: { type: String, default: 'not out' }
});

const bowlingSchema = new mongoose.Schema({
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    name: { type: String },
    overs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    maidens: { type: Number, default: 0 },
    runsConceded: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 }
});

const matchSchema = new mongoose.Schema({
    teamA: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    teamB: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', default: null },

    roundName: { type: String, default: 'League' },

    city: { type: String },
    ground: { type: String },
    date: { type: Date },
    totalOvers: { type: Number, required: true },
    durationMinutes: { type: Number, default: 120 },
    
    // Scheduled, Live, Paused, Completed
    status: { type: String, default: 'Scheduled' },
    pauseReason: { type: String, default: '' },
    // Scheduled, Live, Paused, Completed, Abandoned
    status: { type: String, default: 'Scheduled' },
    pauseReason: { type: String, default: '' },
    
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    isNoResult: { type: Boolean, default: false },

    manOfTheMatch: {
      name: { type: String },
      desc: { type: String }
    },

    // Toss Info
    tossWonBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    optedTo: { type: String, enum: ['Bat', 'Bowl'] },

    // LIVE TRACKING
    scoreA: { type: Number, default: 0 },
    wicketsA: { type: Number, default: 0 },
    oversA: { type: Number, default: 0 },
    ballsA: { type: Number, default: 0 },
    
    scoreB: { type: Number, default: 0 },
    wicketsB: { type: Number, default: 0 },
    oversB: { type: Number, default: 0 },
    ballsB: { type: Number, default: 0 },

    currentInnings: { type: Number, default: 1 }, 
    battingTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    bowlingTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },

    striker: { id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }, name: String, runs: { type: Number, default: 0 }, balls: { type: Number, default: 0 } },
    nonStriker: { id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }, name: String, runs: { type: Number, default: 0 }, balls: { type: Number, default: 0 } },
    currentBowler: { id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }, name: String, runsConceded: { type: Number, default: 0 }, wickets: { type: Number, default: 0 }, oversBowled: { type: Number, default: 0 }, ballsBowled: { type: Number, default: 0 } },

    thisOver: { type: [String], default: [] },

    //  FULL SCORECARD DATA
    innings1: {
        team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
        totalRuns: { type: Number, default: 0 },
        totalWickets: { type: Number, default: 0 },
        overs: { type: Number, default: 0 },
        balls: { type: Number, default: 0 },
        extras: { type: Number, default: 0 },
        batting: [battingSchema], 
        bowling: [bowlingSchema]
    },
    innings2: {
        team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
        totalRuns: { type: Number, default: 0 },
        totalWickets: { type: Number, default: 0 },
        overs: { type: Number, default: 0 },
        balls: { type: Number, default: 0 },
        extras: { type: Number, default: 0 },
        batting: [battingSchema],
        bowling: [bowlingSchema]
    }

}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);