const express = require('express');
const router = express.Router();
const { submitMessage, getMessages, deleteMessage } = require('../controllers/contactController');

router.post('/submit', submitMessage);
router.get('/all', getMessages);
router.delete('/delete/:id', deleteMessage);

module.exports = router;