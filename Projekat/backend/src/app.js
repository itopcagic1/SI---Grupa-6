require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const competitionRoutes = require('./routes/competitionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sportRoutes = require('./routes/sportRoutes');
const ligaRoutes = require('./routes/ligaRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const matchRoutes = require('./routes/matchRoutes');
const homepageRoutes = require('./routes/homepageRoutes');

const app = express();

app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;

// CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://sportmanager-frontend.onrender.com'
  ],
  credentials: true,
}));

// Middlewares
app.use(express.json());
app.use(cookieParser());

// --- ROUTES SEKCIJA ---
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sports', sportRoutes);
app.use('/api/lige', ligaRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/homepage', homepageRoutes);

app.get('/', (req, res) => {
  res.send('API radi');
});

app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
});
