require('rootpath')();
require('dotenv').config(); // Add this for environment variables
const express = require('express');
const app = express();
const cors = require('cors');
const errorHandler = require('_middleware/error-handler');
const path = require('path');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');

// Configure CORS once with specific options
app.use(cors({origin: 'http://localhost:4200', credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'products')));

// Routes
app.use('/accounts', require('./accounts/account.controller'));
app.use('/chatbot', require('./chatbot/chatbot.controller')); // Add chatbot route
app.use('/api-docs', require('./_helpers/swagger'));

// Error handler (must be last)
app.use(errorHandler);

const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => console.log('Server listening on port ' + port));