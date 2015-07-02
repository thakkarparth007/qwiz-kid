var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	if(req.session.isloggedin) {
		res.render('dashboard', { 
			username: req.session.username, 
			name: req.session.name 
		});
	}
	else {
		res.set('Cache-Control', 'no-cache, max-age=0, must-revalidate, no-store');
		res.render('index', { title: 'Express' });
	}
});

module.exports = router;
