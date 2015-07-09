var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	if(req.session.isloggedin) {
		res.redirect('/home');
	}
	else {
		res.set('Cache-Control', 'no-cache, max-age=0, must-revalidate, no-store');
		res.render('index');
	}
});

module.exports = router;
