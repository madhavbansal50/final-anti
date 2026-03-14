const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Placeholder openAI integration
router.post('/whisper', upload.single('audio'), async (req, res) => {
  // Logic for whisper and summarization
  if (!req.file) return res.status(400).json({ error: 'Audio file required' });

  // Mock response for now
  res.json({
    summary: "Patient presents with persistent cough and slight fever.",
    points: [
      { topic: "Symptoms", details: "Cough, fever (38C)" },
      { topic: "Duration", details: "3 days" }
    ]
  });
});

module.exports = router;
