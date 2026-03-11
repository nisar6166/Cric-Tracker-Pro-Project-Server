const express = require('express');
const http = require('http'); 
const { Server } = require('socket.io'); 
const cors = require('cors');
const connectDB = require('./config/db');
const fs = require('fs');
const path = require('path'); 
require('dotenv').config();

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// import Routes
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const playerRoutes = require('./routes/playerRoutes');
const matchRoutes = require('./routes/matchRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');

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
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/scorecard', require('./routes/scorecardRoutes'));

// Passing the io object to match routes
app.use('/api/matches', (req, res, next) => {
    req.io = io; 
    next();
}, matchRoutes);

app.post('/api/ai/insights', async (req, res) => {
  //  FIX: Declaring fallbackInsights outside the try block for broader scope 
  let fallbackInsights = []; 

  try {
    const { teamA, teamB, status, result } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    let prompt = "";

    // Set dynamic prompts and fallbacks based on the match status
    if (status === 'Completed') {
        prompt = `Act as a cricket expert. Write a thrilling 3-sentence post-match summary for the match between ${teamA} and ${teamB}. The result was: ${result}. Keep it professional.`;
        fallbackInsights = [
            `🏏 What a fantastic match between ${teamA} and ${teamB}! ${result || 'It was a nail-biting finish'}. Both teams showed immense character, but the winners handled the pressure better.`,
            `🔥 A thrilling finish to a great contest! ${result || 'The crowd loved every bit of it'}. We saw some spectacular batting and disciplined bowling displays today.`
        ];
    } else if (status === 'Live') {
        prompt = `Act as a cricket commentator. Write a 3-sentence exciting live match commentary for the ongoing match between ${teamA} and ${teamB}.`;
        fallbackInsights = [
            `⚡ The match between ${teamA} and ${teamB} is hanging in the balance! The next few overs will be crucial in deciding the momentum.`,
            `🏏 It's a high-stakes battle right now between ${teamA} and ${teamB}! The bowlers are trying to break partnerships while the batters are looking for boundaries.`
        ];
    } else {
        // Default to Scheduled/Upcoming
        prompt = `Act as a cricket expert. Write a 3-sentence exciting pre-match prediction for the upcoming match between ${teamA} and ${teamB}.`;
        fallbackInsights = [
            `🏏 The upcoming clash between ${teamA} and ${teamB} promises to be a blockbuster! Based on current form, expect a tight contest between bat and ball.`,
            `🔥 Fans are eagerly waiting for ${teamA} vs ${teamB}! It will be a battle of strategies. Watch out for the key all-rounders who could change the game.`
        ];
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Google Gemini API is currently unavailable"); 
    }

    const text = data.candidates[0].content.parts[0].text;
    res.json({ insight: text });
    
  } catch (error) {
    console.log("Fallback triggered based on status...");
    
    // Safety check: In case fallbackInsights array is empty for any reason
    if (fallbackInsights.length === 0) {
        fallbackInsights = ["🏏 An exciting match is on the cards! Expect a great battle between bat and ball."];
    }
    
    // Select a random insight from the fallback array
    const randomInsight = fallbackInsights[Math.floor(Math.random() * fallbackInsights.length)];
    res.status(200).json({ insight: randomInsight });
  }
});

// 5. Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));