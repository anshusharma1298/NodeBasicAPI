const express = require('express');

const app = express();
 /**404 Page not found or url not found */
const pageNotFound = app.use((req, resp, next) => {
    const error = new Error('URL Not found!');
    error.status = 404 ;
    next(error);
});

module.exports = pageNotFound