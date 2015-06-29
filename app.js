var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var winston = require('winston');

var routes = require('./routes/index');
var users = require('./routes/users');

var abuseFilter = require('./middleware/AbuseFilter');
var config = require('./config');
abuseFilter.init(config);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger(config.env));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

/*
	Logging.
	Use the console and the file transports in development
	Use the file in production
 */
var log_opts_console = {
	colorize: true,
	timestamp: true,
	prettyPrint: true,
	level: "debug"
};

var log_opts_file = {
	filename: './logs/qwiz-kid.log',
	timestamp: true,
	maxSize: 5242880,	// 5 MB
	prettyPrint: true
};

if(app.get('env') === 'development') {
	winston.loggers.add('qwiz-kid-logger', {
		console: log_opts_console,
		file: log_opts_file
	});
}

if(app.get('env') === 'production') {
	winston.loggers.add('qwiz-kid-logger', {
		file: log_opts_file
	});
}

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
