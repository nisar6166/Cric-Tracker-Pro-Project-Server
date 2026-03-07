const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  teamLogo: { type: String, default: "" },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Team', teamSchema);