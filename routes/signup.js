/*
	handles GET/POST on /signup
			GET on signup/unameavail?q=uname
			GET on signup/emailavail?q=email

	Todo: handle captchas.
 */

var express = require('express');
var router = express.Router();
var db_connect = require('../db_connect');
var validator = require('validator');
var bcrypt = require('bcrypt');
var restrict = require('../middleware/restrict');
var setupsession = require('../middleware/setupsession');
var logger = require('../logger').getLogger();
var config = require('../config');

// all validate_* functions resolve with no value (just resolve()) if the validation
// succeeds. If it fails, they resolve with the error message (string).

function validate_username(uname) {
	if(!uname)
		return Promise.resolve("Username is required.");

	if(uname.length > config.validation.MAX_USERNAME_LENGTH)
		return Promise.resolve("Username should be no longer than" 
			+ config.validation.MAX_USERNAME_LENGTH + " characters.");

	if(!/^[a-z0-9\.-_]+$/i.test(uname))
		return Promise.resolve("Username can contain only letters, numbers, "
			+ "underscore, periods and hyphens.");

	return new Promise(function(resolve,reject) {
		var db = db_connect.reuse();
		var users = db.collection('users');

		users.findOne({ username: uname }, function(err,doc) {
			if(err) {
				logger.error('Error in checking username availability.', err);
				throw error;
			}

			if(!doc) resolve();
			else	 resolve("Username already taken.");
		});
	});
}

// checks if the password is valid
function validate_password(pwd) {
	if(!pwd)
		return Promise.resolve("Password is required.");

	if(pwd.length < config.validation.MIN_PASSWORD_LENGTH)
		return Promise.resolve("Password is too short. It must be at least " 
			+ config.validation.MIN_PASSWORD_LENGTH +" characters long.");

	if(pwd.length > config.validation.MAX_PASSWORD_LENGTH)
		return Promise.resolve("Passwords can't be longer than "
			+ config.validation.MAX_PASSWORD_LENGTH + " characters.");

	// password strength check maybe?
	
	return Promise.resolve();	
}

// checks if the password and cnfmpasswords match
function validate_passwords(pwd, cnfm) {
	if(pwd != cnfm)
		return Promise.resolve("Passwords do not match.");

	return Promise.resolve();
}

function validate_name(name) {
	if(name.length > config.validation.MAX_NAME_LENGTH)
		return Promise.resolve("That seems too long to be a real name.");

	return Promise.resolve();
}

function validate_email(email) {
	if(validator.isEmail(email) === false)
		return Promise.resolve("Invalid email.");

	// check if the email is already there in the database.
	return new Promise(function(resolve,reject) {
		var db = db_connect.reuse();
		var users = db.collection('users');

		users.findOne({ email: email }, function(err,doc) {
			if(err) {
				logger.error('Error in checking email availability.', err);
				throw error;
			}

			if(!doc) resolve();
			else	 resolve("Email is already registered.");
		});		
	});
}

function validate_emailpublic(emailpublic) {
	if(emailpublic != 'true' && emailpublic != 'false')
		return Promise.resolve("Invalid value for 'Email visibility'");

	return Promise.resolve();
}

function validate_college(college) {
	if(college.length > config.validation.MAX_COLLEGE_LENGTH)
		return Promise.resolve("College name seems too long to be real.");

	// database check maybe?
	
	return Promise.resolve();
}

function validate_state(state) {
	if(state.length > config.validation.MAX_STATE_LENGTH)
		return Promise.resolve("State name seems too long to be real.");

	if(!/^[a-z-' ]+$/i.test(state))
		return Promise.resolve("Invalid state name.");

	// database check maybe?	
	return Promise.resolve();
}

function validate_country(country) {
	if(country.length > config.validation.MAX_COUNTRY_LENGTH)
		return Promise.resolve("Country name seems too long to be real.");

	if(!/^[a-z-' ]+$/i.test(country))
		return Promise.resolve("Invalid country name.");

	// database check maybe?	
	return Promise.resolve();
}

// assumes that the data is safe to store in db.
function register(username,password,name,email,emailpublic,college,state,country) {
	return new Promise(function(resolve, reject) {
		var db = db_connect.reuse();
		var users = db.collection('users');

		// convert the password to hash
		
		bcrypt.hash(password,config.BCRYPT_ROUNDS, function(err,hash) {
			if(err) {
				logger.error("Error converting the password to hash.", err);
				reject(err);
				return;
			}
			users.insert({
				username: username,
				passwordhash: hash,
				name: name,
				email: email,
				emailpublic: emailpublic,
				college: college,
				state: state,
				country: country,
				score: 0,
				categories: [],
				joindate: Date.now()
			}, function(err, doc) {
				if(err) {
					logger.error("Error registering the user into the database", err);
					reject(err);
					return;
				}

				resolve(doc);
			});
		});
	});
}

/* signup-login page */
router.get('/signup', function(req, res, next) {
	if(req.session.isloggedin) {
		res.redirect('/');
		return;
	}

	// clearing cache forces reload. At the same time,
	// clears form data on failure. But that's not an issue.
	// We'll be using ajax anyway.
	res.set('Cache-Control', 'no-cache, max-age=0, must-revalidate, no-store');
	res.render('signup');
});

router.post('/signup', function(req, res) {
	if(req.session.isloggedin) {
		res.redirect('/');
		return;
	}

	var form = req.body;

	var username 		= form.username.toString().trim(),
		// don't trim the passwords!
		password 		= form.password.toString(),
		cnfmpassword 	= form.cnfmpassword.toString(),

		name 			= form.name.toString().trim(),
		email 			= form.email.toString().trim(),
		emailpublic 	= form.emailpublic.toString().trim(),
		college 		= form.college.toString().trim(),
		state 			= form.state.toString().trim(),
		country 		= form.country.toString().trim();

	var errorMessages = {};
	var p = Promise.all([
		validate_username(username),
		validate_password(password),
		validate_passwords(password, cnfmpassword),
		validate_name(name),
		validate_email(email),
		validate_emailpublic(emailpublic),
		validate_college(college),
		validate_state(state),
		validate_country(country)
	]);

	// once the validation is done
	p.then(function(result) {
		// check for errors and display them nicely.
		var arr = "username,password,cnfmpassword,name,email,emailpublic,college,state,country";
		arr = arr.split(",");

		var errors = 0;
		for(var i = 0; i < arr.length; i++) {
			errors += (typeof result[i] === 'string');
			errorMessages[ arr[i] ] = result[i] || "";
		}
		
		if(errors) {
			res.render('signup', { error: errorMessages });
			return;
		}
		
		// no errors? great. Register him.
		register(username,password,name,email,emailpublic,college,state,country)
			.then(function(user) { 
				setupsession(req,user);
				res.redirect('/');
			})
			.catch(function(err) {
				logger.error('Error in registering user.', err);
				res.status(500).end();
			});
	});
});


module.exports = router;
