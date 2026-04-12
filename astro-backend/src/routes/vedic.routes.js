const express = require('express');

const auth = require('../middleware/auth');
const HoroscopeCache = require('../models/HoroscopeCache');
const {
  generateBirthChart,
  generatePanchang,
  generateRemedies,
} = require('../services/gemini.service');

const router = express.Router();

// GET /api/vedic/birth-chart?sign=Leo&birthDate=1990-01-01&lang=en
router.get('/birth-chart', auth, async (req, res, next) => {
  try {
    const { sign, birthDate, lang = 'en' } = req.query;

    if (!sign || !birthDate) {
      return res.status(400).json({ error: 'sign and birthDate are required' });
    }

    const cached = await HoroscopeCache.findOne({
      type: 'birth-chart',
      sign,
      date: birthDate,
      language: lang,
    });

    if (cached) {
      return res.json(cached.data);
    }

    const data = await generateBirthChart(sign, birthDate, lang);

    await HoroscopeCache.create({
      type: 'birth-chart',
      sign,
      date: birthDate,
      language: lang,
      data,
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/vedic/panchang?lang=en
router.get('/panchang', auth, async (req, res, next) => {
  try {
    const { lang = 'en' } = req.query;
    const today = new Date().toISOString().split('T')[0];

    const cached = await HoroscopeCache.findOne({
      type: 'panchang',
      date: today,
      language: lang,
    });

    if (cached) {
      return res.json(cached.data);
    }

    const data = await generatePanchang(today, lang);

    await HoroscopeCache.create({
      type: 'panchang',
      sign: 'all',
      date: today,
      language: lang,
      data,
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/vedic/remedies?sign=Leo&lang=en
router.get('/remedies', auth, async (req, res, next) => {
  try {
    const { sign, lang = 'en' } = req.query;

    if (!sign) {
      return res.status(400).json({ error: 'sign is required' });
    }

    const today = new Date().toISOString().split('T')[0];

    const cached = await HoroscopeCache.findOne({
      type: 'remedies',
      sign,
      date: today,
      language: lang,
    });

    if (cached) {
      return res.json(cached.data);
    }

    const data = await generateRemedies(sign, lang);

    await HoroscopeCache.create({
      type: 'remedies',
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

module.exports = router;
