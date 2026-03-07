const Contact = require('../models/Contact');

// 1. Submit Message
exports.submitMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        const newMessage = new Contact({ 
            name, 
            email, 
            subject: subject || "No Subject", 
            message 
        });
        
        await newMessage.save();
        res.status(201).json({ message: "Message sent successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2.Get All Messages
exports.getMessages = async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3.Delete Message
exports.deleteMessage = async (req, res) => {
    try {
        const deletedMsg = await Contact.findByIdAndDelete(req.params.id);
        if (!deletedMsg) return res.status(404).json({ message: "Message not found" });
        res.status(200).json({ message: "Message deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};