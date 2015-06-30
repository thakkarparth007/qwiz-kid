var express = require('express');

module.exports = function(req,res,next) {
	if(!req.session.isLoggedIn) {
		res.redirect('/login');
	}
	else {
		next();
	}
};
