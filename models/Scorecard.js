const mongoose = require('mongoose');

const batterSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  runs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  fours: { type: Number, default: 0 },
  sixes: { type: Number, default: 0 },
  dismissal: { type: String, default: 'not out' }
});

const bowlerSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  overs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  maidens: { type: Number, default: 0 },
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 }
});

// Manhattan & Worm
const overDataSchema = new mongoose.Schema({
  overNumber: { type: Number },
  runs: { type: Number, default: 0 }
}, { _id: false });

const inningsSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  overs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  batters: [batterSchema],
  bowlers: [bowlerSchema],
  oversData: [overDataSchema]
});

const scorecardSchema = new mongoose.Schema({
  match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  tossWonBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  optedTo: { type: String, enum: ['Bat', 'Bowl'] },
  firstInnings: inningsSchema,
  secondInnings: inningsSchema,
  resultString: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Scorecard', scorecardSchema);