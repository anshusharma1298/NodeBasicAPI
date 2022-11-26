const mongooes = require('mongoose')
const dotenv = require('dotenv');
dotenv.config({path:'../../config.env'});

const database = process.env.DATABASE || 'mongodb://localhost:27017/BackendAPI';


mongooes.connect(database);