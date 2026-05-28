const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();


// ================= REGISTER =================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'missing fields' });
    }

    const checkUser = await User.findOne({ email: email.toLowerCase() });
    if (checkUser) {
      return res.status(400).json({ message: 'email taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash: hash,
      role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER'
    });

    const savedUser = await user.save();

    // email (non-blocking safety)
    try {
      sendEmail({
        email: savedUser.email,
        subject: 'Welcome to Team Task Manager',
        message: `Hi ${savedUser.name},\n\nWelcome! Your account is created as ${savedUser.role}.`
      });
    } catch (err) {
      console.log("Email error:", err.message);
    }

    res.status(201).json({
      message: 'success',
      id: savedUser.id
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'server error' });
  }
});


// ================= LOGIN =================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'missing fields' });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+passwordHash');

    if (!user) {
      return res.status(400).json({ message: 'invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ message: 'invalid credentials' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'error' });
  }
});

module.exports = router;