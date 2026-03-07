const Team = require('../models/Team');

exports.addTeam = async (req, res) => {
  try {
    const { teamName, location } = req.body;
    const teamLogo = req.file ? req.file.path : ""; 

    const newTeam = new Team({ teamName, location, teamLogo });
    await newTeam.save();

    res.status(201).json({ message: "Team Added Successfully!", team: newTeam });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// to see all teams
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find();
    res.status(200).json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a Team
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json({ message: "Team deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a Team
exports.updateTeam = async (req, res) => {
  try {
    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      { teamName: req.body.teamName, location: req.body.location },
      { returnDocument: 'after' }
    );
    res.json({ message: "Team updated successfully!", team: updatedTeam });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};