const db = require('../utils/database');

class Property {
  static findAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM properties', [], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM properties WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  static create(propertyData) {
    const { type, bedrooms, kitchens, living_rooms, toilets, price, address, status } = propertyData;
    
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO properties (type, bedrooms, kitchens, living_rooms, toilets, price, address, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(sql, [type, bedrooms, kitchens, living_rooms, toilets, price, address, status], 
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID });
        });
    });
  }

  static update(id, propertyData) {
    const { type, bedrooms, kitchens, living_rooms, toilets, price, address, status } = propertyData;
    
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE properties 
        SET type = ?, bedrooms = ?, kitchens = ?, living_rooms = ?, toilets = ?, 
            price = ?, address = ?, status = ?
        WHERE id = ?
      `;
      
      db.run(sql, [type, bedrooms, kitchens, living_rooms, toilets, price, address, status, id], 
        function(err) {
          if (err) reject(err);
          resolve({ changes: this.changes });
        });
    });
  }

  static updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE properties SET status = ? WHERE id = ?', [status, id], 
        function(err) {
          if (err) reject(err);
          resolve({ changes: this.changes });
        });
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM properties WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        resolve({ changes: this.changes });
      });
    });
  }

  static search(filters) {
    return new Promise((resolve, reject) => {
      const conditions = [];
      const params = [];
      
      if (filters.type) {
        conditions.push('type = ?');
        params.push(filters.type);
      }
      if (filters.min_bedrooms) {
        conditions.push('bedrooms >= ?');
        params.push(filters.min_bedrooms);
      }
      if (filters.max_price) {
        conditions.push('price <= ?');
        params.push(filters.max_price);
      }
      if (filters.status) {
        conditions.push('status = ?');
        params.push(filters.status);
      }

      const sql = `
        SELECT * FROM properties 
        ${conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''}
        ORDER BY created_at DESC
      `;

      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }
}

module.exports = Property;