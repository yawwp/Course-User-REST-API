'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const router = express.Router();
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let indexRouter = require('./routes/index');
let apiRouter = require('./routes/api');


// setup a friendly greeting for the root route
app.use('/', indexRouter);
app.use('/api', apiRouter);

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});
const { sequelize, User, Course } = require('./models');

(async () => {
  console.log('Testing the connection to the database...');
  try {
    await sequelize.sync();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

app.get('/users', async (req, res) => {
  const users = await User.findAll({
    attributes: ['id', ['firstName', 'first_name'], ['lastName', 'last_name'], ['emailAddress','email_address'], ['createdAt','created_at'], ['updatedAt','updated_at']],
  });
  res.json(users);
});

app.get('/courses', async (req, res) => {
  const courses = await Course.findAll();
  res.json(courses);
});


// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});