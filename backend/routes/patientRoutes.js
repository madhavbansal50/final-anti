const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { runNlpScript, generateAiSummary } = require('../utils/nlpRunner');

// Create a short id like PAT-2026-001
const generatePatientId = () => {
  const year = new Date().getFullYear();
  const randomSerial = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PAT-${year}-${randomSerial}`;
};

// Create a new report
router.post('/submit', async (req, res) => {
  const { name, email, age, symptoms } = req.body;
  if (!name || !email || !age || !symptoms) return res.status(400).json({ error: 'Missing fields' });

  try {
    const reportId = generatePatientId();
    
    // Call Python NLP Script
    const triageResult = await runNlpScript(symptoms, age);
    const { priority_score, priority_level } = triageResult;
    
    // Call OpenAI mock
    const aiSummary = await generateAiSummary(symptoms);

    db.run(
      `INSERT INTO Reports (report_id, patient_id, patient_name, patient_email, age, ai_summary, priority_level, priority_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [reportId, email, name, email, age, aiSummary, priority_level, priority_score],
      function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.status(201).json({ message: 'Report created', reportId });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get patient's own reports
router.get('/reports', (req, res) => {
  const email = req.query.email; // Replace with JWT later
  if (!email) return res.status(400).json({ error: 'Email required' });

  db.all(`SELECT report_id as id, report_date, priority_level, priority_score FROM Reports WHERE patient_email = ?`, [email], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
