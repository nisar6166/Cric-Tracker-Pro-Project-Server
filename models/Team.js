const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  teamLogo: { type: String, default: "" }, // ടീം ലോഗോയുടെ പാത്ത്
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }], // പ്ലെയേഴ്സിനെ ലിങ്ക് ചെയ്യാൻ
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Team', teamSchema);