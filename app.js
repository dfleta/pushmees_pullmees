var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

/**
 * setup MongoDB database connection
 * 
 * Muevo la configuracion de la conexion a la bbdd
 * a un modulo para reutilizarlo en los test
 * y poder elegir que base de datos uso:
 * production, development o test 
 * 
 *    var mongoose = require('mongoose');
 *    const uri = `mongodb+srv://${process.env.ATLAS_USER}:${process.env.ATLAS_PASSWORD}@cluster0-ud3ms. 
 *    mongodb.net/pushmees_pullmees?retryWrites=true&w=majority`;
 *    mongoose.connect(uri, { useNewUrlParser: true , useUnifiedTopology: true});
 *    var db = mongoose.connection;
 */

var mongoConfig = require('./db/mongoConfig');
mongoConfig.connect();

// connection es el constructor de la conexion
var db = mongoConfig.mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

/**
 * Default Routes Modules
 */

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

/** 
 * Box router Module
 * Reality router Module
 */

var boxRouter = require('./routes/box');
var realityRouter = require('./routes/reality');


/**
 * App setup
 */

var app = express();

// testing purposes
// app.set('db', db);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

/**
 * MIDDLEWARE routes box, reality
 */

app.use('/box', boxRouter);
app.use('/reality', realityRouter);

/**
 * MIDDLEWARE Error handling
 */


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
