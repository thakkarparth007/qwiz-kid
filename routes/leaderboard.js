var express = require('express');
var router = express.Router();
var db_connect = require('../db_connect');
var logger = require('../logger').getLogger();
var config = require('../config');
var util = require('./util');

function getleaderboard(limit,page) {
	var db = db_connect.reuse();
	var users = db.collection('users');

	return new Promise(function(resolve,reject) {
		var cur_score = null,
			rank = 0,
			samecount = 0;
		var leaderboard_cursor = 
			users
				.find({})
				.sort({ score: -1 })
				.limit(page*limit)	// we need to bother with only these
									// many entries so far.
				.map(function(doc) {
					if(doc.score !== cur_score)
					{
						rank = 1 + rank + samecount;
						doc.rank = rank;
						cur_score = doc.score;
						samecount = 0;
					}
					else {
						doc.rank = rank;
						samecount++;
					}
					var ret = {
						rank: doc.rank,
						username: doc.username,
						name: doc.name,
						score: doc.score
					};
					return ret;
				});

		leaderboard_cursor.skip(limit*(page-1));
		
		leaderboard_cursor.toArray(function(err,result) {
			if(err) {
				logger.error("Error fetching leaderboard from database");
				return reject(err);
			}
			else {
				return resolve(result);
			}
		});
	});
}

function getrank(username, userscore) {
	var db = db_connect.reuse();
	var users = db.collection('users');
	return new Promise(function(resolve,reject) {
		var cur_score = null,
			rank = 0;
		var rank_cursor = 
			users.aggregate([
				{
					$match: {
						score: { $gt: userscore }
					}
				},
				{ 
					$sort: { score: -1 } 
				},
				{ 
					$group : {	_id: '$score' }
				},
				{
					$group: {
						_id: null,
						onerankless: { $sum: 1 }
					}
				}
			])
			.toArray(function(err,result) {
				if(err) {
					logger.error("Error fetching user rank from database.",err);
					return reject(err);
				}

				// this happens when no document matches in
				// the first stage of the aggregation pipeline
				if(result.length === 0)
					return resolve(1);
				
				return resolve( result[0].onerankless + 1 );
			});
	});
}

/* GET leaderboard listing. */
router.get('/', function(req, res) {
	var Q = req.query;

	// filter paramaters - use defaults if clean_*() fail
	var view 	= util.clean_view(Q.view) || "html";
	var limit 	= util.clean_limit(Q.limit) || 20;
	var page 	= util.clean_page(Q.page) || 1;

	Promise.all([
		getleaderboard(limit,page),
		getrank(req.session.username, req.session.score)
	]).then(function(result) {
		var leaderboard = result[0],
			userrank = result[1];

		result = {
			leaderboard: leaderboard,
			score: req.session.score,
			rank: userrank
		};
		if(view == 'json') {
			res.json(result);
		}
		else {
			res.render('leaderboard', {
				username: req.session.username,
				name: req.session.name,
				score: req.session.score,
				result: result
			});
		}
	}).catch(function(err) {
		logger.error("Error fetching leaderboard from database", err);
		res.status(500).end();
		return;
	});
});

module.exports = router;
