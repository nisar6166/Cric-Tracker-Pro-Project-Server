const express = require('express');
const http = require('http'); 
const { Server } = require('socket.io'); 
const cors = require('cors');
const connectDB = require('./config/db');
const fs = require('fs');
const path = require('path'); // ഫയൽ പാത്ത് കൈകാര്യം ചെയ്യാൻ
require('dotenv').config();

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Routes ഇംപോർട്ട് ചെയ്യുന്നു
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const playerRoutes = require('./routes/playerRoutes');
const matchRoutes = require('./routes/matchRoutes');

const app = express();
const server = http.createServer(app); 
const io = new Server(server, {
    cors: { origin: "*" } 
});

// 1. Database connection
connectDB();

// 2. Middlewares
app.use(cors());
app.use(express.json());

// --- പുതിയ മാറ്റം: uploads ഫോൾഡറിനെ സ്റ്റാറ്റിക് ആക്കുന്നു ---
// ഇതിലൂടെ മാത്രമേ http://localhost:5000/uploads/image.jpg എന്ന രീതിയിൽ ഫോട്ടോ കാണാൻ പറ്റൂ
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Socket Connection Logic
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// 4. Routes Setting
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/teams', require('./routes/teamRoutes'));

// Passing the io object to match routes
app.use('/api/matches', (req, res, next) => {
    req.io = io; 
    next();
}, matchRoutes);

// 5. Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));