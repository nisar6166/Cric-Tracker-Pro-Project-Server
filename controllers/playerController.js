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