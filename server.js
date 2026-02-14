const express = require('express');
const http = require('http'); 
const { Server } = require('socket.io'); 
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

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

// 3. Socket Connection Logic
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// 4. Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/players', require('./routes/playerRoutes'));

// Passing the io object to match routes
app.use('/api/matches', (req, res, next) => {
    req.io = io; 
    next();
}, require('./routes/matchRoutes'));

// 5. Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));