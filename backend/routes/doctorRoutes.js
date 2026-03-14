const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { updatePriorityWithTime, sortPatientQueue } = require('../utils/priorityEngine');

// Get Dashboard Data — with dynamic priority escalation + queue ordering
router.get('/dashboard', (req, res) => {
  db.all(`SELECT * FROM Reports`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Apply time-based priority escalation to each patient
    const escalatedRows = rows.map(row => {
      const updated = updatePriorityWithTime(row);
      return {
        ...row,
        priority_score: updated.priorityScore,
        priority_level: updated.priorityLevel,
        escalated: updated.escalated || false,
        escalation_reason: updated.escalationReason || null
      };
    });

    // Sort using multi-key queue ordering (level → score → oldest first)
    const sorted = sortPatientQueue(escalatedRows);

    const stats = {
      total: sorted.length,
      high: sorted.filter(r => r.priority_level === 'HIGH').length,
      medium: sorted.filter(r => r.priority_level === 'MEDIUM').length,
      low: sorted.filter(r => r.priority_level === 'LOW').length,
    };

    res.json({ stats, patients: sorted });
  });
});

// Get a single report
router.get('/report/:id', (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM Reports WHERE report_id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Report not found' });
    res.json(row);
  });
});

// Finalize a report
router.post('/report/:id/finalize', (req, res) => {
  const { id } = req.params;
  const { doctor_response } = req.body;

  if (!doctor_response) return res.status(400).json({ error: 'Doctor response required' });

  db.run(
    `UPDATE Reports SET doctor_response = ? WHERE report_id = ?`,
    [doctor_response, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Report finalized successfully' });
    }
  );
});

module.exports = router;
