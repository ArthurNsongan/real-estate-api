const express = require('express');
const router = express.Router();
const { validateProperty, validateStatus } = require('../middleware/validator');
const propertyController = require('../controllers/propertyController');

router.get('/', propertyController.getAllProperties);
router.get('/search', propertyController.searchProperties);
router.get('/:id', propertyController.getPropertyById);
router.post('/', validateProperty, propertyController.createProperty);
router.put('/:id', validateProperty, propertyController.updateProperty);
router.patch('/:id/status', validateStatus, propertyController.updatePropertyStatus);
router.delete('/:id', propertyController.deleteProperty);

module.exports = router;
