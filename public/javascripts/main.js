// namespace QwizKid
// 
// File: /public/javascripts/main.js
// Description: Contains code for the questions page on the client.

(function() {

var QK = window.QwizKid = window.QwizKid || {};

//
// handlebars helpers
//

// rounds to two-decimal places
Handlebars.registerHelper('round',function(num) { return num.toFixed(2); });
Handlebars.registerHelper('toPercentage',function(num) { 
	return Math.round(num * 100) + '%';
});

QK.Routes = QK.Routes || {}; 
QK.Models = QK.Models || {};
QK.Collections = QK.Collections || {};

QK.Collections.Categories = new (Backbone.Collection.extend({
	idAttribute: "_id",
	url: '/ajax/categories'
}))();

QK.Collections.Categories.fetch();

QK.ErrorFactory = function(elem, message, options) {
	if(typeof options == "string") {
		var dir = options;
		options = {
			direction: dir
		};
	}
	options = options || {};

	function _get_offset() {
		if(options.offset) return options.offset;
		if(!options.direction) 
			return options.offset || [1,0];	// default: right

		switch(options.direction) {
			case 'top': 	return [0,-1];
			case 'left': 	return [-1,0];
			case 'bottom': 	return [0,1];
			case 'right': 	return [1,0];
			default: 		return [1,0];
		}
	}

	function _get_classname() {
		// offset has higher priority than direction
		if(!options.offset) {
			if(options.direction) {
				return 'tooltipsy' + options.direction;
			}
			else {
				return 'tooltipsyright';
			}
		}

		if(options.offset[0] === 0) {
			if(options.offset[1] > 0)
				return 'tooltipsybottom';
			else
				return 'tooltipsytop';
		}

		if(options.offset[1] === 0) {
			if(options.offset[0] > 0)
				return 'tooltipsyright';
			else
				return 'tooltipsyleft';
		}
	}

	return $(elem)
		.addClass('error')
		.tooltipsy({
			alignTo: options.alignTo || 'element',
			offset: _get_offset(),
			className: _get_classname(),
			content: message instanceof Error
							? message.originalMessage || message.message 
							: message,
			hideEvent: options.hideEvent || 'input'
		})
		.on(options.hideEvent || 'input', function() {
			$(elem).data('tooltipsy').destroy();
		})
		.data('tooltipsy').show();
};

QK.AppRouter = Backbone.Router.extend({
	routes: {
		"(/)": 						"toquestions",	// redirect to questions
		"questions(/)": 			"toquestions",
		"questions/new(/)": 		"newquestions",
		"questions/unattempted(/)": "unattemptedquestions",
		"questions/attempted(/)": 	"attemptedquestions",
		"questions/yours(/)": 		"yourquestions",
		"questions/by(/:ownerid)": 	"questionsby",
		"users(/)": 				"users",
		"questions/ask(/)": 		"ask",
		"questions/:id": 			"solveit",
		"leaderboard(/)": 			"leaderboard"
	},
	toquestions: function() {
		Backbone.history.navigate("/questions/new/", true);
	},
	newquestions: function() {
		QK.Routes.QuestionsPage.handle("new");
	},
	unattemptedquestions: function() {
		QK.Routes.QuestionsPage.handle("unattempted");
	},
	attemptedquestions: function() {
		QK.Routes.QuestionsPage.handle("attempted");
	},
	yourquestions: function() {
		Backbone.history.navigate("/questions/by/" + 
			$("#a-account").html(), true );
	},
	questionsby: function(ownerid) {
		QK.Routes.QuestionsPage.handle("by", ownerid);
	},
	users: function() {
		alert("YO! users!");
	},
	ask: function() {
		QK.Routes.AskPage.handle();
	},
	leaderboard: function() {
		QK.Routes.LeaderboardPage.handle();
	},
	solveit: function(id) {
		QK.Routes.SolveItPage.handle(id);
	}
});

$(document).on("click", "a:not([data-bypass])", function(evt) {
	// Get the anchor href and protcol
	var href = $(this).attr("href");
	var protocol = this.protocol + "//";

	// Ensure the protocol is not part of URL, meaning its relative.
	if (href && href.slice(0, protocol.length) !== protocol &&
		href.indexOf("javascript:") !== 0) {
		// Stop the default event to ensure the link will not cause a page
		// refresh.
		evt.preventDefault();

		// `Backbone.history.navigate` is sufficient for all Routers and will
		// trigger the correct events. The Router's internal `navigate` method
		// calls this anyways.
		Backbone.history.navigate(href, true);
	}
});

var App = new QK.AppRouter();
Backbone.history.start({ pushState: true, root: "/home/" });

})();