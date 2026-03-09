const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const bcrypt = require('bcryptjs'); 
const User = require('../models/User');

const { register, login } = require('../controllers/authController');

// 1. to save photo
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/register', upload.single('profilePic'), register);

router.post('/login', login);

// 2. FORGOT PASSWORD AP

router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "No account found with this email!" });
    }


    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: "Server error during password reset" });
  }
});

module.exports = router;