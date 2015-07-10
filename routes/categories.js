var express = require('express');
var router = express.Router();
var db_connect = require('../db_connect');
var logger = require('../logger').getLogger();
var config = require('../config');

// Returns a list of all categories
// 
// in future, should allow adding categories.

var categories = null;

router.get('/', function(req, res) {
	if(!categories) 
		categories = db_connect.reuse().collection('categories');

	categories.find({}).toArray(function(err,result) {
		res.json(result);
	});
});

module.exports = router;