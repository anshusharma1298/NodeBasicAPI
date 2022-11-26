const express = require('express');
const app = express();
const morgan = require('morgan');
require('./project/exception/500InternalError');
require('./project/exception/404PageNotFound');

const AuthRoutes = require('./project/routes/AuthenticationRoutes');


app.use(morgan('dev'));
app.use(express.json());

/**Authentication Routes */
app.use('/auth',AuthRoutes);


module.exports = app;
