const express = require('express');

const auth = require('../middleware/auth');
const User = require('../models/User');
const { generateChatResponse } = require('../services/gemini.service');

const router = express.Router();

// POST /api/chat
router.post('/', auth, async (req, res, next) => {
  try {
    const { message, context, lang } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Use provided context or fetch from DB
    let userContext = context;
    if (!userContext) {
      const user = await User.findById(req.userId);
      if (user) {
        userContext = {
          name: user.name,
          sign: user.sign,
          birthDate: user.birthDate,
          sex: user.sex,
          relationship: user.relationship,
          number: user.number,
        };
      }
    }

    const response = await generateChatResponse(
      message,
      userContext,
      lang || 'en'
    );

    res.json({ response });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
