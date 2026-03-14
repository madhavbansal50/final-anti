const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Basic register (for testing/setup)
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ error: 'All fields required' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      `INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, role],
      function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.status(201).json({ id: this.lastID, name, email, role });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password, role } = req.body;
  db.get(`SELECT * FROM Users WHERE email = ? AND role = ?`, [email, role], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid credentials or role' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials or role' });

    res.json({ message: 'Logged in successfully', user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  });
});

module.exports = router;
