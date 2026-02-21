const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// 1. The route to save messages (for the user)
router.post('/send', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();
    res.status(201).json({ message: "Message sent successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Route to access all messages for admin only
router.get('/all', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;