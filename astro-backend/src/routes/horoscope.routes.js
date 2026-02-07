const express = require('express');
const auth = require('../middleware/auth');
const { generateDailyHoroscope, generateCompatibility } = require('../services/gemini.service');
const HoroscopeCache = require('../models/HoroscopeCache');
const User = require('../models/User');

const router = express.Router();

// GET /api/horoscope/daily?sign=Leo&lang=en
router.get('/daily', auth, async (req, res, next) => {
  try {
    const { sign, lang = 'en' } = req.query;

    if (!sign) {
      return res.status(400).json({ error: 'Sign is required' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check cache
    const cached = await HoroscopeCache.findOne({
      type: 'daily',
      sign,
      date: today,
      language: lang,
    });

    if (cached) {
      return res.json(cached.data);
    }

    // Fetch user context for personalization
    const user = await User.findById(req.userId);
    const userContext = user
      ? { name: user.name, relationship: user.relationship }
      : null;

    // Generate with Gemini
    const data = await generateDailyHoroscope(sign, userContext, lang);

    // Cache the result
    await HoroscopeCache.create({
      type: 'daily',
      sign,
      date: today,
      language: lang,
      data,
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/horoscope/compatibility?sign1=Leo&sign2=Aries&lang=en
router.get('/compatibility', auth, async (req, res, next) => {
  try {
    const { sign1, sign2, lang = 'en' } = req.query;

    if (!sign1 || !sign2) {
      return res.status(400).json({ error: 'Both sign1 and sign2 are required' });
    }

    // Check cache (sort signs for consistent key)
    const [sortedSign1, sortedSign2] = [sign1, sign2].sort();
    const cached = await HoroscopeCache.findOne({
      type: 'compatibility',
      sign: sortedSign1,
      sign2: sortedSign2,
      language: lang,
    });

    if (cached) {
      return res.json(cached.data);
    }

    // Generate with Gemini
    const data = await generateCompatibility(sign1, sign2, lang);

    // Cache the result
    await HoroscopeCache.create({
      type: 'compatibility',
      sign: sortedSign1,
      sign2: sortedSign2,
      language: lang,
      data,
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
