/*
	routes to handle login and logout.

	handled routes:
		get /login
		post /login 	params: username, password
		get /logout
 */

var express = require('express');
var router = express.Router();
var fs = require('fs');
var restrict = require('../middleware/restrict');
var logger = require('../logger').getLogger();

function validateLogin(uname, pwd, cb) {
	var logins = [
		["Parth","password"],
	];
	for(var i = 0; i < logins.length; i++) {
		if(uname == logins[i][0] && pwd == logins[i][1]) {
			logger.info(uname,pwd,true);
			return cb(null, { name: "Parth" });
		}
	}
	logger.info(uname,pwd,false);
	cb(null, false);
}

/* login page */
router.get('/login', function(req, res, next) {
	if(req.session.isLoggedIn) {
		res.redirect('/');
		return;
	}
	res.set('Cache-Control', 'no-cache, max-age=0, must-revalidate, no-store');
	res.render('login');
});

router.post('/login', function(req, res) {
	if(req.session.isLoggedIn) {
		res.redirect('/');
	}
	var uname = req.body.username,
		pwd = req.body.password;

	var errorMessages = [];
	if(!uname || typeof uname !== "string" || !uname.trim())
	{
		errorMessages.push("Username missing.");
	}
	else if(!uname || typeof uname !== "string" || !uname.trim())
	{
		errorMessages.push("Password missing.");
	}
	else {
		validateLogin(uname,pwd,function(err,result) {
			if(err) {
				logger.error(err);
				res.render('error', {
					message: 'Internal Server Error. Retry in a while.',
					error: {}
				});
			}
			else if(result) {
				req.session.isLoggedIn = true;
				req.session.username = uname;
				req.session.name = result.name;
				res.redirect('/');
			}
			else {
				res.render('login', {
					errorMessage: 'Invalid login credentials.'
				});
			}
		});
		return;
	}

	res.render('login',{
		errorMessage: errorMessages.join("<br>")
	});
});

router.get('/logout', restrict, function(req,res,next) {
	logger.info('LOGOUT', req.session.username, req.session.name);
	req.session.destroy();
	res.redirect('/');
	res.end();
});

module.exports = router;
