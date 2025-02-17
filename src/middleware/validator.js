const { VALID_STATUSES } = require('../config/constants');

const validateProperty = (req, res, next) => {
  const { type, bedrooms, kitchens, living_rooms, toilets, price, address, status } = req.body;

  if (!type || !bedrooms || !kitchens || !living_rooms || !toilets || !price || !address || !status) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status. Must be one of: ' + VALID_STATUSES.join(', ')
    });
  }

  next();
};

const validateStatus = (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status. Must be one of: ' + VALID_STATUSES.join(', ')
    });
  }

  next();
};

module.exports = {
  validateProperty,
  validateStatus
};