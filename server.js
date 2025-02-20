

const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();
  
const app = express();
const port = process.env.PORT || 3000;
  
  // Middleware
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: '*'
  }));
  app.use(bodyParser.json());

  var postgres_url = 
  "postgresql://b_card_strapi_user:mfXY7ZBdf90Zx6KEow8NVjyNmRbS2LU1@dpg-cud6fe8gph6c738m48bg-a.virginia-postgres.render.com/b_card_strapi"
  
    // Database connection
  const pool = new Pool({
    connectionString: postgres_url,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  // Initialize database
  async function initializeDatabase() {
    try {
      await pool.query(`
        CREATE TYPE property_status AS ENUM ('available', 'under construction', 'occupied');
        
        CREATE TABLE IF NOT EXISTS properties (
          id SERIAL PRIMARY KEY,
          type VARCHAR(100) NOT NULL,
          bedrooms INTEGER NOT NULL,
          kitchens INTEGER NOT NULL,
          living_rooms INTEGER NOT NULL,
          toilets INTEGER NOT NULL,
          price DECIMAL(12,2) NOT NULL,
          address TEXT NOT NULL,
          status property_status NOT NULL DEFAULT 'available',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Database initialized successfully');
    } catch (err) {
      if (!err.message.includes('type "property_status" already exists')) {
        console.error('Error initializing database:', err);
      }
    }
  }
  
  initializeDatabase();
  
  // GET all properties
  app.get('/api/properties', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM properties ORDER BY created_at DESC');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // GET property by ID
  app.get('/api/properties/:id', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM properties WHERE id = $1', [req.params.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Property not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // POST new property
  app.post('/api/properties', async (req, res) => {
    const {
      type,
      bedrooms,
      kitchens,
      living_rooms,
      toilets,
      price,
      address,
      status = 'available' // Default status
    } = req.body;
  
    if (!type || !bedrooms || !kitchens || !living_rooms || !toilets || !price || !address) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate price
    if (Number(price) <= 0) {
      res.status(400).json({ 
        error: 'Invalid status. Must be one of: ' + VALID_STATUSES.join(', ')
      });
      return;
    }
  
    // Validate status
    const validStatuses = ['available', 'under construction', 'occupied'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: available, under construction, occupied' });
    }
  
    try {
      const result = await pool.query(`
        INSERT INTO properties (type, bedrooms, kitchens, living_rooms, toilets, price, address, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [type, bedrooms, kitchens, living_rooms, toilets, price, address, status]);
      
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // PUT update property
  app.put('/api/properties/:id', async (req, res) => {
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
  
    if (!type || !bedrooms || !kitchens || !living_rooms || !toilets || !price || !address || !status) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    // Validate status
    const validStatuses = ['available', 'under construction', 'occupied'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: available, under construction, occupied' });
    }
  
    try {
      const result = await pool.query(`
        UPDATE properties 
        SET type = $1, bedrooms
         = $2, kitchens = $3, living_rooms = $4, 
            toilets = $5, price = $6, address = $7, status = $8
        WHERE id = $9
        RETURNING *
      `, [type, bedrooms, kitchens, living_rooms, toilets, price, address, status, req.params.id]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Property not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // DELETE property
  app.delete('/api/properties/:id', async (req, res) => {
    try {
      const result = await pool.query('DELETE FROM properties WHERE id = $1 RETURNING *', [req.params.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Property not found' });
      }
      res.json({ message: 'Property deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Search properties with filters
  app.get('/api/properties/search', async (req, res) => {
    const conditions = [];
    const params = [];
    let paramCount = 1;
  
    if (req.query.type) {
      conditions.push(`type = $${paramCount}`);
      params.push(req.query.type);
      paramCount++;
    }
    if (req.query.min_bedrooms) {
      conditions.push(`bedrooms >= $${paramCount}`);
      params.push(req.query.min_bedrooms);
      paramCount++;
    }
    if (req.query.max_price) {
      conditions.push(`price <= $${paramCount}`);
      params.push(req.query.max_price);
      paramCount++;
    }
    if (req.query.status) {
      conditions.push(`status = $${paramCount}`);
      params.push(req.query.status);
      paramCount++;
    }
  
    const sql = `
      SELECT * FROM properties 
      ${conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''}
      ORDER BY created_at DESC
    `;
  
    try {
      const result = await pool.query(sql, params);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Get properties by status
  app.get('/api/properties/status/:status', async (req, res) => {
    const validStatuses = ['available', 'under construction', 'occupied'];
    if (!validStatuses.includes(req.params.status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: available, under construction, occupied' });
    }
  
    try {
      const result = await pool.query('SELECT * FROM properties WHERE status = $1 ORDER BY created_at DESC', [req.params.status]);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.listen(port, () => {
    console.log(`Real Estate API running on port ${port}`);
  });