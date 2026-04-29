require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const app = express();
const PORT = process.env.PORT || 3000;


// CORS 
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000',
    'https://sportmanager-frontend.onrender.com'
  ],
  credentials: true
}));

// JSON parser
app.use(express.json());

// Cookie parser (za refresh token)
app.use(cookieParser());


app.use('/api/auth', authRoutes);


app.get('/', (req, res) => {
  res.send('API radi 🚀');
});


app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
});