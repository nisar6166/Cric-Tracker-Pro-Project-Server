const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  
  tournamentName: { type: String, required: true, trim: true },
  city: { type: String, required: true },
  ground: { type: String, required: true },
  organiserName: { type: String, required: true },
  organiserPhone: { type: String, required: true },
  
  // date
  startDate: { type: Date, required: true },
  endDate: { type: Date },

  // tournament settings
  category: { type: String, default: 'OPEN' },
  ballType: { type: String, default: 'Tennis' },
  pitchType: { type: String, default: 'ROUGH' },
  matchType: { type: String, default: 'Limited Overs' },

  // new format settings
  tournamentType: { 
    type: String, 
    enum: ['LEAGUE', 'KNOCKOUT', 'LEAGUE_PLUS_KNOCKOUT'], 
    default: 'LEAGUE' 
  },
  
  // pool wise
  pools: [{
    poolName: { type: String }, // e.g., 'Pool A', 'Pool B'
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }]
  }],

  // knockouts (e.g., 'Pre-Quarter', 'Quarter', 'Semi-Final', 'Final')
  knockoutSettings: {
    hasPreQuarter: { type: Boolean, default: false },
    hasQuarter: { type: Boolean, default: false },
    hasSemi: { type: Boolean, default: true },
    currentStage: { type: String, default: 'League' }
  },

  // team and fees informations
  entryFee: { type: Number, default: 0 },
  totalTeams: { type: Number, default: 0 },
  winningPrize: { type: String, default: 'BOTH' },

  // pictures
  tournamentLogo: { type: String, default: '' },
  tournamentBanner: { type: String, default: '' },

  // status and connections
  status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed'], default: 'Upcoming' },
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

}, { timestamps: true });

module.exports = mongoose.model('Tournament', tournamentSchema);