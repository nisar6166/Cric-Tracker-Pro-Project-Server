# 🏏 CricTrackerPro - Professional Cricket Scoring System

CricTrackerPro is a full-stack MERN application designed to manage cricket tournaments and provide real-time scoring updates. This platform allows admins to manage players, scorers to update live match data, and viewers to follow matches in real-time.

## 🚀 Features

- **Role-Based Authentication:** Secure login for Admin, Scorer, and Viewer roles.
- **Dual Login Support:** Users can log in using either their **Email** or **Mobile Number**.
- **Player Management:** Detailed player profiles with automatic **Strike Rate** calculation.
- **Live Scoring:** Real-time match updates using **Socket.io**.
- **Automated Match Logic:** - Automatic innings switching (after 10 wickets or completion of overs).
  - Dynamic result calculation (Win by runs, wickets, or Tie).
- **Mobile Responsive:** Designed to work seamlessly across all devices.

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Cloud)
- **Real-time Engine:** Socket.io
- **Security:** JWT (JSON Web Tokens), Bcrypt.js

## 📁 Folder Structure

```text
backend/
├── config/         # Database connection
├── controllers/    # Logical functions (Auth, Match, Player)
├── middleware/     # Security and role-based access
├── models/         # Database schemas (User, Player, Match)
├── routes/         # API Endpoints
└── server.js       # Entry point