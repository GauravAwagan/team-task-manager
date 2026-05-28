const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'missing fields' });
    }

    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return res.status(400).json({ message: 'email taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      passwordHash: hash,
      role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER'
    });

    const savedUser = await user.save();

    // send an email
    sendEmail({
      email: savedUser.email,
      subject: 'Welcome to Team Task Manager',
      message: `Hi ${savedUser.name},\n\nWelcome to Team Task Manager! Account created as: ${savedUser.role}.\n\nThanks,\nTeam Task Manager`,
    });

    res.status(201).json({ msg: 'success', id: savedUser.id });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'bad login' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ message: 'bad login' });

    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'error' });
  }
});

module.exports = router;
