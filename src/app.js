const express = require('express');
const bodyParser = require('body-parser');
const propertyRoutes = require('./routes/propertyRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(bodyParser.json());
app.use('/api/properties', propertyRoutes);
app.use(errorHandler);

module.exports = app;