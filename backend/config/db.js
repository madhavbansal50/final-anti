const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
console.log('Connecting to SQLite database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    createTables();
  }
});

function createTables() {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('Doctor', 'Patient')) NOT NULL
    )
  `;

  const reportsTable = `
    CREATE TABLE IF NOT EXISTS Reports (
      report_id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      patient_name TEXT,
      patient_email TEXT,
      age INTEGER,
      ai_summary TEXT,
      doctor_response TEXT,
      priority_level TEXT,
      priority_score INTEGER,
      report_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES Users(email)
    )
  `;

  db.run(usersTable, (err) => {
    if (err) console.error('Error creating Users table:', err.message);
  });

  db.run(reportsTable, (err) => {
    if (err) console.error('Error creating Reports table:', err.message);
  });
}

module.exports = db;
