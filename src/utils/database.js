const sqlite3 = require('sqlite3').verbose();
const { dbPath } = require('../config/database');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

module.exports = db;