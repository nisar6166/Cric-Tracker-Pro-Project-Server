const Player = require('../models/Player');

exports.addPlayer = async (req, res) => {
    try {
        const { name, team, mobile, age, role } = req.body;
        const profileImage = req.file ? req.file.path : "";

        const newPlayer = new Player({
            name,
            team,
            mobile,
            age,
            role,
            profileImage
        });

        await newPlayer.save();
        res.status(201).json({ message: "Player added successfully!", player: newPlayer });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Player
exports.deletePlayer = async (req, res) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) return res.status(404).json({ message: "Player not found" });
    res.json({ message: "Player deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Player Info (Basic Text Info only for now)
exports.updatePlayer = async (req, res) => {
  try {
    const { name, mobile, age, role } = req.body;
    const updatedPlayer = await Player.findByIdAndUpdate(
      req.params.id,
      { name, mobile, age, role },
      { returnDocument: 'after' }
    );
    res.json({ message: "Player updated successfully", player: updatedPlayer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};