// libraries
var express = require('express');
var layout = require('express-layout');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser');
var winston = require('winston');

// config
var config = require('./config');

// qwiz-kid specific files
var applogger = require('./logger');
var abuseFilter = require('./middleware/AbuseFilter');

var app = express();

// init logger
applogger.init(app);
abuseFilter.init(config);

// require routes - declared after app and applogger initialisations to
// enable logging.
var routes = require('./routes/index');
var users = require('./routes/users');
var restrict = require('./middleware/restrict');
var login = require('./routes/login');
var signup = require('./routes/signup');
var questions = require('./routes/questions');

// done requiring the files

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger(config.env));
app.use(bodyParser.json());
app.use(session({
	secret: 'LOLCODEROXMENNYOYOBBZSINGHU!',
	resave: false,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(layout());

// home page to be added
app.use('/', routes);
app.use('/', login);
app.use('/', signup);

// restricted pages
app.use(restrict);
app.use('/users', users);
app.use('/questions', questions);

// error handlers

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

module.exports = app;
