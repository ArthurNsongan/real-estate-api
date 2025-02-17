const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const port = process.env.PORT || 3000;

const app = express();

// Middleware
app.use(bodyParser.json());

// Valid status values
const VALID_STATUSES = ['available', 'under_construction', 'occupied'];

// Database connection
const db = new sqlite3.Database('./real_estate.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database with tables
function initializeDatabase() {
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
      status TEXT NOT NULL CHECK(status IN ('available', 'under_construction', 'occupied')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Routes

// GET all properties
app.get('/api/properties', (req, res) => {
  db.all('SELECT * FROM properties', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET property by ID
app.get('/api/properties/:id', (req, res) => {
  db.get('SELECT * FROM properties WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }
    res.json(row);
  });
});

// POST new property
app.post('/api/properties', (req, res) => {
  const {
    type,
    bedrooms,
    kitchens,
    living_rooms,
    toilets,
    price,
    address,
    status
  } = req.body;

  // Validate required fields
  if (!type || !bedrooms || !kitchens || !living_rooms || !toilets || !price || !address || !status) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  // Validate status
  if (!VALID_STATUSES.includes(status)) {
    res.status(400).json({ 
      error: 'Invalid status. Must be one of: ' + VALID_STATUSES.join(', ')
    });
    return;
  }

  const sql = `
    INSERT INTO properties (type, bedrooms, kitchens, living_rooms, toilets, price, address, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [type, bedrooms, kitchens, living_rooms, toilets, price, address, status], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({
      id: this.lastID,
      message: 'Property created successfully'
    });
  });
});

// PUT update property
app.put('/api/properties/:id', (req, res) => {
  const {
    type,
    bedrooms,
    kitchens,
    living_rooms,
    toilets,
    price,
    address,
    status
  } = req.body;

  // Validate required fields
  if (!type || !bedrooms || !kitchens || !living_rooms || !toilets || !price || !address || !status) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  // Validate status
  if (!VALID_STATUSES.includes(status)) {
    res.status(400).json({ 
      error: 'Invalid status. Must be one of: ' + VALID_STATUSES.join(', ')
    });
    return;
  }

  const sql = `
    UPDATE properties 
    SET type = ?, bedrooms = ?, kitchens = ?, living_rooms = ?, toilets = ?, price = ?, address = ?, status = ?
    WHERE id = ?
  `;

  db.run(sql, [type, bedrooms, kitchens, living_rooms, toilets, price, address, status, req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }
    res.json({ message: 'Property updated successfully' });
  });
});

// PATCH update property status
app.patch('/api/properties/:id/status', (req, res) => {
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ error: 'Status is required' });
    return;
  }

  if (!VALID_STATUSES.includes(status)) {
    res.status(400).json({ 
      error: 'Invalid status. Must be one of: ' + VALID_STATUSES.join(', ')
    });
    return;
  }

  const sql = 'UPDATE properties SET status = ? WHERE id = ?';

  db.run(sql, [status, req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }
    res.json({ message: 'Property status updated successfully' });
  });
});

// DELETE property
app.delete('/api/properties/:id', (req, res) => {
  db.run('DELETE FROM properties WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }
    res.json({ message: 'Property deleted successfully' });
  });
});

// Search properties with filters
app.get('/api/properties/search', (req, res) => {
  const conditions = [];
  const params = [];
  
  if (req.query.type) {
    conditions.push('type = ?');
    params.push(req.query.type);
  }
  if (req.query.min_bedrooms) {
    conditions.push('bedrooms >= ?');
    params.push(req.query.min_bedrooms);
  }
  if (req.query.max_price) {
    conditions.push('price <= ?');
    params.push(req.query.max_price);
  }
  if (req.query.status) {
    if (!VALID_STATUSES.includes(req.query.status)) {
      res.status(400).json({ 
        error: 'Invalid status. Must be one of: ' + VALID_STATUSES.join(', ')
      });
      return;
    }
    conditions.push('status = ?');
    params.push(req.query.status);
  }

  const sql = `
    SELECT * FROM properties 
    ${conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''}
    ORDER BY created_at DESC
  `;

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`Real Estate API running on port ${port}`);
});