const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Register User 
exports.register = async (req, res) => {
    try {
        const { name, email, mobile, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({ 
            name, 
            email, 
            mobile, 
            password: hashedPassword, 
            role 
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Login User (we can login either email or mobile number)
exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body; // using identifier instead of email

        // identifier email or mobile number in database 
        const user = await User.findOne({
            $or: [{ email: identifier }, { mobile: identifier }]
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        // sending all information in response
        res.json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                role: user.role,
                mobile: user.mobile,
                email: user.email, 
                profilePic: user.profilePic
            } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};