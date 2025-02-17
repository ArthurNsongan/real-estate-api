const path = require('path');
require('dotenv').config();

module.exports = {
  dbPath: process.env.DB_PATH || path.join(__dirname, '../db/real_estate.db')
};