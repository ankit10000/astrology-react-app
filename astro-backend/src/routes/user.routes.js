const express = require('express');

const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// POST /api/user/onboarding
router.post('/onboarding', auth, async (req, res, next) => {
  try {
    const { sign, birthDate, sex, relationship, number } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        sign,
        birthDate,
        sex,
        relationship,
        number,
        basicsDone: true,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        sign: user.sign,
        birthDate: user.birthDate,
        sex: user.sex,
        relationship: user.relationship,
        number: user.number,
        basicsDone: user.basicsDone,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/user/profile
router.put('/profile', auth, async (req, res, next) => {
  try {
    const allowedFields = [
      'name',
      'sign',
      'birthDate',
      'sex',
      'relationship',
      'number',
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        sign: user.sign,
        birthDate: user.birthDate,
        sex: user.sex,
        relationship: user.relationship,
        number: user.number,
        basicsDone: user.basicsDone,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
