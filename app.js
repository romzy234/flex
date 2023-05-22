const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Setting Up Environmemt Globally
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env' });

const indexRouter = require('./routes/index.routes');
const authRouter = require('./routes/auth.routes');

const errorHandler = require('./middleware/error.middleware');

const app = express();

// Database Connector
const { connectDB } = require('./database/index.database');
connectDB();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);

app.use(errorHandler);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404).json({
    success: false,
    status: 'Resource Not Found',
    error: '404 Content Do Not Exist Or Has Been Deleted'
  });
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
