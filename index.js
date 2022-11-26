const http = require('http');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({path:'./config.env'});

const port = process.env.PORT || 3000;
const server = http.createServer(app);
server.listen(port);
