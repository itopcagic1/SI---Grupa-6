require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const leagueRoutes = require('./routes/leagueRoutes');
const teamRoutes = require('./routes/teamRoutes');
const competitionRoutes = require('./routes/competitionRoutes');

const app = express();

app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;
const ligaRoutes = require('./routes/ligaRoutes');

app.use('/api/lige', ligaRoutes);

// CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://sportmanager-frontend.onrender.com'
  ],
  credentials: true,
}));

// JSON parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/competitions', competitionRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('API radi');
});

app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
});