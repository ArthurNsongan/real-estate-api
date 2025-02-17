const Property = require('../models/propertyModel');

const getAllProperties = async (req, res, next) => {
  try {
    const properties = await Property.findAll();
    res.json(properties);
  } catch (err) {
    next(err);
  }
};

const getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (err) {
    next(err);
  }
};

const createProperty = async (req, res, next) => {
  try {
    const result = await Property.create(req.body);
    res.status(201).json({
      id: result.id,
      message: 'Property created successfully'
    });
  } catch (err) {
    next(err);
  }
};

const updateProperty = async (req, res, next) => {
  try {
    const result = await Property.update(req.params.id, req.body);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json({ message: 'Property updated successfully' });
  } catch (err) {
    next(err);
  }
};

const updatePropertyStatus = async (req, res, next) => {
  try {
    const result = await Property.updateStatus(req.params.id, req.body.status);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json({ message: 'Property status updated successfully' });
  } catch (err) {
    next(err);
  }
};

const deleteProperty = async (req, res, next) => {
  try {
    const result = await Property.delete(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const searchProperties = async (req, res, next) => {
  try {
    const properties = await Property.search(req.query);
    res.json(properties);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  updatePropertyStatus,
  deleteProperty,
  searchProperties
};