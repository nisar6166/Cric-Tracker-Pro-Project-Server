const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { addTeam, getTeams } = require('../controllers/teamController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post('/add', upload.single('teamLogo'), addTeam);
router.get('/all', getTeams);

module.exports = router;