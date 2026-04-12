require('dotenv').config();
const cors = require('cors');
const express = require('express');

const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');
const authRoutes = require('./src/routes/auth.routes');
const chatRoutes = require('./src/routes/chat.routes');
const horoscopeRoutes = require('./src/routes/horoscope.routes');
const userRoutes = require('./src/routes/user.routes');
const vedicRoutes = require('./src/routes/vedic.routes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/horoscope', horoscopeRoutes);
app.use('/api/user', userRoutes);
app.use('/api/vedic', vedicRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Astro backend running on port ${PORT}`);
  });
}

module.exports = app;
