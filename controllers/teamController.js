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