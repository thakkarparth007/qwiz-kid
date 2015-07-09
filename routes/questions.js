var express = require('express');
var router = express.Router();
var db_connect = require('../db_connect');
var logger = require('../logger').getLogger();
var config = require('../config');
var util = require('./util');
var validator = require('validator');
var ObjectID = require('mongodb').ObjectID;

/*
	Types of queries:

	1. Get a list of unseen/seen questions 
		[GET /questions?..., 
		 GET /users/username/questions?...]

						- search on title,question
						- sort on (votecount,fastest,
									awesomeness,createdat,
									editedat,successratio,
									timelimit)
	2. Get a question. If seen, 
			return answer,explanation and other stats.
		[POST /questions/qid]

	3. Answer a question 
		[POST /questions/qid/submit]
						 - update the answerstats collection.
						 - change the successratio, corrattempts, 
						 	incorrattempts
						 - change the fastest if applicable
						 - change the awesomeness?
						 - change the user score

	4. Add upvote/downvote
		[POST /questions/qid/vote]
						 - change the awesomeness?

	5. Create a question
		[ POST /questions/ ]
						- Filter the values (xss)
						- Put in database.

	How to answer:
	Type 1:
		1. Get the list of seen questions from the answerstats 
			collection for the user.
		2. Find the seen/unseen questions from the questions collection.
		3. Search as required. Sort as required.

	Type 2:
		1. Check if the question is "seen" (answerstats)
		2. If so, combine that data with the questions data
		3. Otherwise mark it as seen and then return the data in 
			the questions collection

	Type 3:
		1. update the answerstats collection.
		2. change the successratio, corrattempts, incorrattempts
		3. change the fastest if applicable
		4. change the awesomeness?
		5. change the user score

	Type 4:
		1. Update the respective counts in the questions collection
		2. Add the username in the corresponding array
 */

var db;
var questions;
var answerstats;
var users;
var categories;
var inited = false;

function init() {
	if(inited) return;
	inited = true;
	db = db_connect.reuse();
	questions = db.collection('questions');
	answerstats = db.collection('answerstats');
	users = db.collection('users');
	categories = db.collection('categories');
}

function BadParameterError(msg) {
	this.message = msg;
	this.stack = (new Error()).stack;
}
BadParameterError.prototype = new Error();
BadParameterError.prototype.constructor = BadParameterError;

// --------------------------------------------------------
// Type 1 queries
// --------------------------------------------------------


// list of questions that have been seen
// resolve with an object whose keys are _ids and the values 
// are {timetoanswer,points,attempt,seentime}
function getseen(username) {
	init();
	return new Promise(function(resolve,reject) {
		var answers = answerstats.find({	username: username	});

		answers.toArray(function(err, docs) {
			if(err) {
				logger.error("Couldn't load the seen questions of %s", 
					username);
				return reject(new Error("Couldn't load the seen questions of " + 
					username));
			}

			var ret = {};
			docs.forEach(function(doc) {
				delete doc.username;
				delete doc.qid;
				ret[doc._id.toString()] = doc;
			});

			resolve(ret);
		});
	});
}

// do the search - combined with getseen, answers type 1 queries
function search(username, query, seen, sortby, sortord, limit, page) {
	init();
	return new Promise(function(resolve,reject) {
		getseen(username).then(function(seenones) {
			// search on title or question fields
			var findquery = {
				$or: [	{title: query},	{question: query}   ]
			};

			// choose unseen or seen questions based on `seen`
			if(seen !== true) {
				findquery._id = {
					$nin: Object.keys(seenones).map( q => new ObjectID(q._id) )
				};
			}
			else {
				findquery._id = {
					$in: Object.keys(seenones).map( q => new ObjectID(q._id) )
				};
			}

			var sort = { };
			sort.sortby = sortord;

			var search_cursor = 
			questions
				.find(findquery)
				// return only the following fields
				.project({
					_id: 1,
					categoryids: 1,
					ownerid: 1,
					title: 1,
					timelimit: 1,
					fastest: 1,
					votecount: 1,
					//upvotecount: 1,
					//downvotecount: 1,
					corrattempts: 1,
					incorrattempts: 1,
					successratio: 1,
					createdat: 1,
					editedat: 1
				})
				.sort(sort)
				.skip((page-1) * limit)
				.limit(limit);

			// return the attempt details too!
			if(seen) {
				search_cursor.map(function(q) {
					// this is correct. q._id is a string 
					// (that's how getseen() returns)
					q.timetoanswer = seenones[q._id].timetoanswer;
					q.attempt = seenones[q._id].attempt;
					q.seentime = seenones[q._id].seentime;
					q.points = seenones[q._id].points;
				});
			}

			search_cursor.toArray(function(err,ques) {
				if(err) {
					logger.error("Error in searching questions");
					throw new Error("Error in searching questions");
				}

				resolve(ques);
			});
		})
		.catch(function(err) {
			logger.debug(err.stack);
			reject(err);
		});
	});
}

// --------------------------------------------------------
// Type 2 queries
// --------------------------------------------------------

// gets the details of qid from `questions` collection
// we return everything. The caller will filter the details
// that is, the caller takes care to remove the answer 
// in case it must be removed.
function getquestionstats(qid) {
	init();
	return new Promise(function(resolve,reject) {
		questions.findOne({ _id: new ObjectID(qid) }, function(err,doc) {
			if(err) {
				logger.error("Couldn't get the question stats");
				return reject(new Error("Couldn't get the question stats"));
			}

			resolve(doc);
		});
	});
}

// assumes the question hasn't been seen.
// adds an entry to the `answerstats` collection
function markseen(username,qid) {
	init();
	return new Promise(function(resolve,reject) {
		answerstats.insertOne({
			qid: qid,
			username: username,
			seentime: Date.now()/1000,
			timetoanswer: null,
			points: 0,
			attempt: null
		}, function(err,doc) {
			if(err) {
				logger.error("Error marking the question as seen.");
				return reject(new Error("Error marking the quesion as seen."));
			}

			resolve();
		});
	});
}

// if qid is seen, returns the seen-data (everything)
// returns null otherwise.
function getseenstatus(username,qid) {
	init();
	return new Promise(function(resolve,reject) {
		answerstats.findOne({
			username: username,
			qid: qid
		}, function(err, doc) {
			if(err) {
				logger.error("Error getting the seen status of the" +
					" question.");
				return reject(new Error("Error getting the seen status of the" + 
					" question."));
			}

			resolve(doc);
		});
	});
}

// if the question isn't seen before - marks as seen NOW; returns null
// otherwise - 
// returns data regarding the attempt+question data by the user
function getquestion(username, qid) {
	init();
	return new Promise(function(resolve,reject) {
		// getting question-stats and seen-status
		// can be done in parallel. 
		// So, do it in parallel.
		// 
		// btw, errors aren't handled here. They'll bubble up.
		Promise.all([
			getquestionstats(qid),
			getseenstatus(username,qid)
		]).then(function(result) {
			var qstat = result[0],
				seenstatus = result[1];

			// as of now we do not return the list of people
			// who voted. This might be there in future.
			// Returning a few "relevant" upvotes. This might
			// either be done by returning a few usernames that
			// have the highest scores. Or, if following-system
			// is adopted, then a few of those guys.
			delete qstat.upvotes;
			delete qstat.downvotes;

			// if the question has been seen (doesn't mean attempted)
			// return the seen details. Careful - don't return the
			// answer and explanation if the question hasn't been
			// attempted (again. seen != attempted) and the user
			// hasn't timed out.
			if(seenstatus) {
				qstat.seentime = seenstatus.seentime;
				qstat.timetoanswer = seenstatus.timetoanswer;
				qstat.points = seenstatus.points;
				qstat.attempt = seenstatus.attempt;

				// qstat.attempt === null means the user hasn't
				// given his answer yet. Check the docs.
				// attempt: (`Number` - the option chosen by the user. 
				// 			-1 if the user chooses to not answer. 
				// 			0 if timeout. null if not answered yet.)
				var timeout = false;
				if(qstat.attempt === null && 
					istimeout(qstat.seentime,qstat.timelimit))
				{
					timeout = true;

					// tell the db that the user timed out
					// this function is a helper function under
					// type 3 queries
					timedout(username,qid);
				}

				// if the user hasn't attempted, and hasn't
				// timed out, don't reveal the answer and explanation!
				if(qstat.attempt === null && !timeout)
				{
					delete qstat.answer;
					delete qstat.explanation;
				}
				
				resolve(qstat);
			}
			// the question hasn't been seen.
			// hence, mark it as seen NOW. And return only
			// the question stats. Do NOT reveal the answer 
			else {
				delete qstat.answer;
				delete qstat.explanation;

				markseen(username,qid).then(function() { 
					logger.debug("%d Marked as seen.", qid); 
				});
				resolve(qstat);
			}
		})
		.catch(function(err) {
			logger.debug(err.stack);
			reject(err);
		});
	});
}

// --------------------------------------------------------
// Type 3
// --------------------------------------------------------

// tells if a timeout has occured. This function may be
// optimized in future by dealing with the latency of the 
// connection
function istimeout(seentime,timelimit) {
	return timeleft(seentime,timelimit) < 0;
}

// return value is negative in case of timeout
function timeleft(timelimit, seentime) {
	if(timelimit == Number.POSITIVE_INFINITY)
		return timelimit;

	return (seentime + timelimit) - Date.now()/1000;;
}

// does NOT calculate the score.
// simply dumps the score in the points field of `answerstats`
// and adds the score to the user's score
function updatescore(username,qid,points,attempt,timetaken) {
	init();
	return new Promise(function(resolve,reject) {
		var thingstodo = 2;		// 2 things to be done
								// updating `answerstats`
								// and updating `users`
		
		// update `answerstats`
		answerstats.updateOne(
			{ 	username:username,
				qid:qid  },
			{	$set: {	timetoanswer: timetaken,
						points: points,
						attempt: attempt } }, 
			function(err, doc) {
				if(err) {
					logger.error("Error in updating the score" +
						" in `answerstats`.");
					return reject(new Error("Error in updating the score."));
				}

				thingstodo--;

				if(!thingstodo)
					resolve();
			});

		// update the user's score.
		users.updateOne(
			{ username: username },
			{ $inc: {score: points} },
			function(err, user) {
				if(err) {
					logger.error("Error in updating the score in" +
						" `users`.",err);
					return reject(new Error("Error in updating the score."));
				}

				thingstodo--;

				if(!thingstodo)
					resolve();
			});
	});
}

// updates the following fields in `questions` collection.
// corrattempts, incorrattempts, successratio, fastest
// 
// In future, I also plan to update awesomeness, and difficulty.
function updateqstats(qid,username,success,timetaken) {
	init();
	return new Promise(function(resolve,reject) {
		questions.findOne({ _id: new ObjectID(qid) }, function(err,q) {
			if(err) {
				logger.error("Error reading the question stats.");
				return reject(new Error("Error reading the question stats."));
			}

			q.corrattempts += success ? 1 : 0;
			q.incorrattempts += success ? 0 : 1;

			q.successratio = (q.corrattempts - q.incorrattempts) / 
								(q.incorrattempts + q.corrattempts);

			if(timetaken > 0 && (q.fastest === null || timetaken < q.fastest))
				q.fastest = timetaken;

			questions.updateOne({ _id: new ObjectID(qid) }, q, function(err, q) {
				if(err) {
					logger.error("Error updating the question stats");
					return reject(new Error("Error udpating the questions stats"));
				}

				resolve();
			});
		});
	});
}

// called when some function detects that the user has
// timedout for a particular qid. Calls updatescore()
// and also marks in `answerstats`
function timedout(username,qid) {
	updatescore(username,qid,0,0,-1);
	updateqstats(qid,username,false,-1);
}

// calculate the score.
// checks if the user's answer is correct, and he hasn't
// timed out. If so, calculates the score, and calls
// updatescore(username,qid,score,attempt)
// 
// rejects if the user attempts an already attempted question.
// if everything goes smoothly, resolves with the points 
// earned by the user - zero in case of timeout
// negative in case of wrong answer.
// otherwise - score based on fastest, and the timeleft.
// As of now scoring is noob. +10/0/-10. To be changed. Soon!
function evaluate(username,qid,attempt) {
	//init();
	return new Promise(function(resolve, reject) {
		// getting question-stats and seen-status
		// can be done in parallel. 
		// So, do it in parallel.
		
		Promise.all([
			getquestionstats(qid),
			getseenstatus(username,qid)
		]).then(function(result) {
			var qstat = result[0],
				seenstatus = result[1];

			// trying to submit again, eh?
			if(seenstatus.attempt !== null) {
				return reject(new BadParameterError("Can't answer an " +
					"already attempted question."));
			}

			// check for timeout.
			if(istimeout(qstat.timelimit, seenstatus.seentime)) {
				timedout();
				resolve(0);
				return;
			}

			var t = timeleft(qstat.timelimit, seenstatus.seentime);
			var timetaken = qstat.timelimit - t;

			// gave up. Ha!
			if(attempt == -1) {
				updatescore(username,qid,0,attempt,-1);
				updateqstats(qid,username,false,-1);
				resolve(0);
			}
			
			// wrong answer. Ha. Ha. Ha. Die.
			if(qstat.answer != attempt) {
				updatescore(username,qid,-10,attempt,-1);
				updateqstats(qid,username,false,-1);
				resolve(-10);
				return;
			}

			// right answer? Meh.
			updatescore(username,qid,10,attempt,timetaken);
			updateqstats(qid,username,true,timetaken);
			resolve(10);
		});
	});
}

// --------------------------------------------------------
// Type 4
// --------------------------------------------------------

function vote(username, qid, type) {
	// make sure the guy doesn't keep upvoting again and again. :P
	init();
	return new Promise(function(resolve, reject) {
		type = type.toString();

		if(type !== "upvote" && type !== "downvote") {
			return reject(new BadParameterError("vote `type` must be either " +
				"'upvote' or 'downvote'"));
		}

		questions.findOne({ _id: new ObjectID(qid) }, function(err,q) {
			if(err) {
				logger.error("Error getting the question from the database");
				return reject(new Error("Error getting the question from the database"));
			}

			var votes = {};
			q.upvotes.forEach((uname) => {votes[uname] = 1;});
			q.downvotes.forEach((uname) => {votes[uname] = -1;});

			votes[username] = votes[username] || 0;
			if(type == "upvote" && votes[username] == 1) {
				return reject(new BadParameterError("You can upvote only once."));
			}
			if(type == "downvote" && votes[username] == -1) {
				return reject(new BadParameterError("You can downvote only once."));
			}

			if(type == "upvote") {
				q.votecount++;
			}
			else {
				q.votecount--;
			}


			q.upvotes = [];
			q.downvotes = [];

			for(var uname in votes) {
				if(votes[uname] == 1) {
					q.upvotes.push(uname);
				}
				else if(votes[uname] == -1) {
					q.downvotes.push(uname);
				}
			}

			// affects awesomeness? Yes. How? No clue. Yet.
			
			questions.updateOne({ _id: new ObjectID(qid) }, q,
				function(err, newq) {
					if(err) {
						logger.error("Error adding the vote to db.");
						return reject(new Error("Error adding the vote to db."));
					}

					resolve();
				});
		});
	});
}

// --------------------------------------------------------
// Type 5
// --------------------------------------------------------

// takes care of the filtering the input. 
// Callers needn't worry.
function createquestion(username,title,question,options,
		answer,explanation,qcats,timelimit) {

	// validation rules:
	// 
	// 1. qcats - all must be valid category ids, that exist.
	// 				 - max length = config.questions.MAX_CATEGORIES
	// 
	// [ username - valid (obtained from session data) ]
	// 
	// 2. title - length <= config.questions.MAX_TITLE_LENGTH chars.
	// 
	// 3. question - length <= config.questions.MAX_QUESTION_LENGTH chars.
	// 
	// 4. options - array of length 4. Each option, non-empty, 
	// 				maxlen = config.questions.MAX_OPTION_LENGTH
	// 
	// 5. answer - 1 or 2 or 3 or 4
	// 
	// 6. explanation - length <= 
	// 						config.questions.MAX_EXPLANATION_LENGTH
	// 
	// 7. timelimt - integer between config.questions.MIN_TIMELIMIT 
	// 					and config.questions.MAX_TIMELIMIT
	// 				or, Number.POSITIVE_INFINITY
	//
	
	init();
	return new Promise(function(resolve,reject) {
		// force convert the input to strings to avoid
		// mongodb injection
		title = title.toString();
		question = question.toString();
		options = options.map( x => x.toString() );
		explanation = explanation.toString();

		var thingstodo = 10;	// 7+3 because there are 4 options.
		function onedone() {
			thingstodo--;
			if(thingstodo === 0) {
				finalthing();
			}
		}

		var q = {};
		
		// called after all the validation is done.
		// inserts the question in the database and resolves
		// with the id. Otherwise throws an error.
		function finalthing() {
			questions.insertOne({
				categories: qcats.map(x => new ObjectID(x)),
				ownerid: username,
				title: title,
				question: question,
				options: options,
				answer: answer,
				explanation: explanation,
				timelimit: timelimit,
				fastest: null,
				upvotes: [],
				downvotes: [],
				votecount: 0,
				corrattempts: 0,
				incorrattempts: 0,
				successratio: 0,
				awesomeness: 1,
				createdat: Date.now()/1000,
				editedat: Date.now()/1000
			}, function(err,doc) {
				if(err) {
					logger.error("Error inserting the question in " +
						"the database");
					return reject(new Error("Error inserting the question in " + 
						"the database"));
				}

				// phew!
				resolve(doc._id);
			});
		}

		// validation starts.
		var qconf = config.questions;

		// verifying categories
		var cat_arr = [];
		if(qcats.length > qconf.MAX_CATEGORIES) {
			return reject(new BadParameterError("Too many categories for " +
				"the question."));
		}

		for(var i = 0; i < qcats.length; i++)
			cat_arr.push({ _id: new ObjectID(qcats[i].toString()) });

		categories.find({ $or: cat_arr }).count(function(err,len) {
			if(err) {
				logger.error("Error getting the list of categories.");
				return reject(new Error("Error getting the list of categories."));
			}

			if(len != cat_arr.length)
				return reject(new BadParameterError("Invalid category " +
					"ids provided."));

			onedone();
		});

		// function to verify lengths. 
		function throwiftoolong(what,howlong,name) {
			if(what.length > howlong)
				return reject(new BadParameterError(name + " too long."));
			else
				onedone();
		}

		// verifying title,question,each option,explanation
		// basically all strings.

		throwiftoolong(title,qconf.MAX_TITLE_LENGTH, "Title");
		throwiftoolong(question,qconf.MAX_QUESTION_LENGTH,"Question");
		throwiftoolong(options[0],qconf.MAX_OPTION_LENGTH,"Option 1");
		throwiftoolong(options[1],qconf.MAX_OPTION_LENGTH,"Option 2");
		throwiftoolong(options[2],qconf.MAX_OPTION_LENGTH,"Option 3");
		throwiftoolong(options[3],qconf.MAX_OPTION_LENGTH,"Option 4");
		throwiftoolong(explanation,qconf.MAX_OPTION_LENGTH,"Explanation");

		// verify answer
		answer = parseInt(answer,10);
		if(answer < 1 || answer > 4)
			return reject(new BadParameterError("Answer must be 1,2,3 or 4"));
		else
			onedone();

		// verify timelimit
		if(timelimit != Number.POSITIVE_INFINITY) {
			timelimit = parseInt(timelimit,10);
			if(timelimit > qconf.MAX_TIMELIMIT || 
				timelimit < qconf.MIN_TIMELIMIT)
			{
				return reject(new BadParameterError("Time limit must be between " +
					qconf.MIN_TIMELIMIT + " and " + qconf.MAX_TIMELIMIT));
			}
		}
		onedone();

		// all verification done by now. 
		// The verification of categories will take a while.
		// Async operation. When that's done,
		// finalthing() will be called.
	});
}

/* GET questions listing. */
router.get('/', function(req, res) {
	//var db = db_connect.reuse();
	//var questions = db.collection('questions');
	var Q = req.query;

	// filter paramaters - use defaults if clean_*() fail
	var searchq	= util.clean_search(Q.search, ['main']);
	var view 	= util.clean_view(Q.view) || "html";
	var sortby 	= util.clean_sortby(Q.sortby, ['awesomeness','createdat',
					'timelimit','fastest','successratio', 
					'votecount']) || "awesomeness";
	var sortord = util.clean_sortord(Q.sortord) || -1;
	var limit 	= util.clean_limit(Q.limit) || 20;
	var page 	= util.clean_page(Q.page) || 1;
	var seen 	= Q.seen;

	var username = req.session.username;

	if(seen == "1")
		seen = 1;
	else
		seen = 0;	// default: unseen

	search(username, searchq.main, seen, sortby, sortord, limit, page)
		.then(function(result) {
			if(view == 'json') {
				res.json(result);
			}
			else {
				res.render('questions', {
					username: req.session.username,
					name: req.session.name,
					score: req.session.score,
					questions: result
				});
			}
		})
		.catch(function(err) {
			// notify user of his error. 
			// coz we like pointing out mistakes.
			if(err instanceof BadParameterError) {
				res.status(400).end(err.message);
				return;
			}

			logger.error("Error fetching questions-list from database", 
				err);
			res.status(500).end();
			return;
		});

});

// POST /questions/{qid}
router.post('/:qid', function(req, res) {
	var view = req.query.view || "";
		view = view.toString();
	
	var qid = req.params.qid.toString();
	var username = req.session.username;

	// the difference between the previous the method and this
	// is that here we show a 404 on not finding the question.
	// that makes sense, because the previous method is a search
	// method and this is asking for a particular resource.
	function _404() {
		if(view == 'json')
			res.status(404).end();
		else {
			res.render('404', {
				message: "Sorry, but the question doesn't seem to be " +
					"available"
			});
		}
	}

	function _200(question) {
		if(view == 'json') {
			res.json(question);
		}
		else {
			res.render('question', {
				username: req.session.username,
				name: req.session.name,
				score: req.session.score,
				question: question
			});
		}
	}

	getquestion(username,qid).then(function(question) {
		if(!question) {
			_404();
			return;
		}

		_200(question);
	}).catch(function(err) {
		// notify user of his error. 
		// coz we like pointing out mistakes.
		if(err instanceof BadParameterError) {
			res.status(400).end(err.message);
			return;
		}

		if(err) {
			logger.error("Error retrieving the question data from the" +
				" database", err);
			res.status(500).end();
			return;
		}
	});
});

router.post('/:qid/submit', function(req,res) {
	var username = req.session.username;
	var answer = req.body.answer;

	var view = req.query.view || "";
		view = view.toString();


	evaluate(username,req.params.qid.toString(),answer)
		.then(function(points) {
			if(view == 'json') {
				res.status(200).json(points);
			}
			else {
				res.status(200).render('points', points);
			}
		})
		.catch(function(err) {
			if(err instanceof BadParameterError) {
				res.status(400).send(err.message);
				return;
			}

			if(err) {
				logger.error("Error in submitting the answer to the db.", 
					err);
				res.status(500).end();
				return;
			}
		});
});

router.post('/:qid/vote', function(req,res) {
	var username = req.session.username;

	var view = req.query.view || "";
		view = view.toString();

	var type = req.body.type || "";
		type = type.toString();

	var qid = req.params.qid.toString();

	vote(username,qid,type)
		.then(function() {
			res.status(200).end("Success");
		})
		.catch(function(err) {
			if(err instanceof BadParameterError) {
				res.status(400).end(err.message);
				return;
			}

			if(err) {
				logger.error("Error in adding the vote to db.", 
					err);
				res.status(500).end();
				return;
			}
		});
});

router.post('/', function(req,res) {
	var username = req.session.username;

	var title = req.body.title,
		question = req.body.question,
		options = req.body.options,
		answer = req.body.answer,
		explanation = req.body.explanation,
		qcats = req.body.categories,
		timelimit = req.body.timelimit;

	// this part is just a hack for testing. Proper input yet to be done.
	// But the main function that interface with the database work. 
	options = [ req.body['options[0]'], req.body['options[1]'], req.body['options[2]'], req.body['options[3]'] ];
	qcats = [ req.body['categories[0]'] ];

	createquestion(username,title,question,options,answer,
		explanation,qcats,timelimit).then(function(qid) {
			res.status(200).end(qid);
		})
		.catch(function(err) {
			if(err instanceof BadParameterError) {
				res.status(400).end(err.message);
				return;
			}

			if(err) {
				logger.error("Error in adding question to db.", 
					err);
				res.status(500).end();
				return;
			}
		});
});

router.get('/ask', function(req, res) {
	res.render('tmp-ask', { 
		username: req.session.username, 
		name: req.session.name 
	});
});

module.exports = router;
