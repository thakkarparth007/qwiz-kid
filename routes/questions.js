var express = require('express');
var router = express.Router();
var db_connect = require('../db_connect');
var logger = require('../logger').getLogger();
var config = require('../config');
var util = require('./util');
var validator = require('validator');

/* GET questions listing. */
router.get('/', function(req, res) {
	var db = db_connect.reuse();
	var users = db.collection('questions');
	var Q = req.query;

	// filter paramaters - use defaults if clean_*() fail
	var search 	= util.clean_search(Q.search, ['main','email','college','state','country']);
	var view 	= util.clean_view(Q.view) || "html";
	var sortby 	= util.clean_sortby(Q.sortby, ['score','college',
					'state','country','joindate']) || "score";
	var sortord = util.clean_sortord(Q.sortord) || -1;
	var limit 	= util.clean_limit(Q.limit) || 20;
	var page 	= util.clean_page(Q.page) || 1;

	var sort = {};
	sort[sortby] = sortord;

	var search_cursor = 
		users
			.find({
				$or: [
					{username: search.main},
					{name: search.main}
				],
				// even if the email is not public, if the search query
				// is the exact email id, then we display the person.
				email: search.email,
				college: search.college,
				state: search.state,
				country: search.country
			})
			// return only the following fields
			.project({
				_id: 0,
				username: 1,
				name: 1,
				email: 1,
				emailpublic: 1,
				college: 1,
				state: 1,
				country: 1,
				score: 1
			})
			.sort(sort)
			.skip((page-1) * limit)
			.limit(limit);

	search_cursor.map(function(user) {
		if(user.emailpublic != "true" && user.email != search) {
			delete user.email;
		}
		return user;
	});

	search_cursor.toArray(function(err, result) {
		if(err) {
			logger.error("Error fetching users-list from database", err);
			res.status(500).end();
			return;
		}
		if(view == 'json') {
			res.json(result);
		}
		else {
			res.render('users', {
				username: req.session.username,
				name: req.session.name,
				score: req.session.score,
				users: result
			});
		}
	});
});

router.get('/:username', function(req, res) {
	var view = req.query.view || "";
		view = view.toString();
	var db = db_connect.reuse();
	var users = db.collection('users');

	var username = req.params.username.toString();

	function _404() {
		if(view == 'json')
			res.status(404).end();
		else {
			res.render('404', {
				message: "Sorry, but the user doesn't seem to be available"
			});
		}
	}

	function _200(user) {
		if(view == 'json') {
			res.json(user);
		}
		else {
			res.render('user', {
				username: req.session.username,
				name: req.session.name,
				score: req.session.score,
				user: user
			});
		}
	}

	if(username.length > config.validation.MAX_USERNAME_LENGTH) {
		_404();
		return;
	}

	users.findOne({
		username: req.params.username
	}, function(err, user) {
		if(err) {
			logger.error("Error retrieving the user data from the database", err);
			res.status(500).end();
			return;
		}

		if(!user) {
			_404();
			return;
		}

		delete user._id;
		delete user.passwordhash;
		if(user.emailpublic != "true")
			delete user.email;

		_200(user);
	});
});

router.get('/:username/questions', function(req, res) {

});

module.exports = router;
