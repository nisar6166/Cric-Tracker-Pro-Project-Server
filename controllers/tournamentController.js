const Tournament = require('../models/Tournament');

exports.createTournament = async (req, res) => {
    try {
        const { name, location, startDate, endDate, banner } = req.body;
        
        const newTournament = new Tournament({
            name,
            location,
            startDate,
            endDate,
            banner
        });

        const savedTournament = await newTournament.save();
        res.status(201).json(savedTournament);
    } catch (error) {
        res.status(500).json({ message: "Failed to create tournament", error: error.message });
    }
};

exports.getAllTournaments = async (req, res) => {
    try {

        const tournaments = await Tournament.find().sort({ createdAt: -1 });
        res.status(200).json(tournaments);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch tournaments", error: error.message });
    }
};

exports.getTournamentById = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id)
            .populate('teams') 
            .populate('matches');
            
        if (!tournament) return res.status(404).json({ message: "Tournament not found" });
        
        res.status(200).json(tournament);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tournament details", error: error.message });
    }
};

exports.deleteTournament = async (req, res) => {
    try {
        const tournamentId = req.params.id;
        
        const deletedTournament = await Tournament.findByIdAndDelete(tournamentId);
        
        if (!deletedTournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        res.status(200).json({ message: "Tournament deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete tournament", error: error.message });
    }
};