const db = require('../../utils/database');

const createPropertiesTable = () => {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        bedrooms INTEGER NOT NULL,
        kitchens INTEGER NOT NULL,
        living_rooms INTEGER NOT NULL,
        toilets INTEGER NOT NULL,
        price REAL NOT NULL,
        address TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('available', 'en travaux', 'occupied')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

module.exports = createPropertiesTable;