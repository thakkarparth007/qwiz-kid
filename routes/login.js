/*
	routes to handle login and logout.

	handled routes:
		get /login
		post /login 	params: username, password
		get /logout
 */

var express = require('express');
var router = express.Router();
var restrict = require('../middleware/restrict');
var bcrypt = require('bcrypt');
var db_connect = require('../db_connect');
var setupsession = require('../middleware/setupsession');
var logger = require('../logger').getLogger();

function validateLogin(uname, pwd, cb) {
	var db = db_connect.reuse();
	var users = db.collection('users');

	users.findOne({
		username: uname
	}, function(err,user) {
		if(err) {
			logger.error("Error retrieiving user details from the database.", err);
			return cb(err);
		}
		if(!user)
			return cb(null,false);

		bcrypt.compare(pwd, user.passwordhash, function(err,same) {
			if(err) {
				logger.error("Error comparing passwords", err);
				return cb(err);
			}

			if(same)
				cb(null,user);
			else
				cb(null,false);
		});
	});
}

/* login page */
router.get('/login', function(req, res, next) {
	if(req.session.isloggedin) {
		res.redirect('/');
		return;
	}
	res.set('Cache-Control', 'no-cache, max-age=0, must-revalidate, no-store');
	res.render('login');
});

router.post('/login', function(req, res) {
	if(req.session.isloggedin) {
		res.redirect('/');
		return;
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
		validateLogin(uname,pwd,function(err,user) {
			if(err) {
				logger.error(err);
				res.status(500).end();
			}
			else if(user) {
				setupsession(req,user);
				res.status(200).json({
					username: user.username,
					name: user.name,
					email: user.email,
					emailpublic: user.emailpublic,
					college: user.college,
					state: user.state,
					country: user.country,
					score: user.score,
					categories: user.categories,
					joindate: user.joindate
				});
			}
			else {
				res.status(401).json({
					error: 'Invalid login credentials.'
				});
			}
		});
		return;
	}

	res.status(401).json({
		error: errorMessages.join("<br>")
	});
});

router.get('/logout', restrict, function(req,res,next) {
	logger.info('LOGOUT', req.session.username, req.session.name);
	req.session.destroy();
	res.redirect('/');
	res.end();
});

module.exports = router;
