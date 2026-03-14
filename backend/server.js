const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patient', require('./routes/patientRoutes'));
app.use('/api/doctor', require('./routes/doctorRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
