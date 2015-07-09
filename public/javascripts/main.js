// namespace QwizKid
// 
// File: /public/javascripts/main.js
// Description: Contains code for the questions page on the client.

(function() {

var QK = window.QwizKid = window.QwizKid || {};

QK.Routes = QK.Routes || {}; 

QK.AppRouter = Backbone.Router.extend({
	routes: {
		"(/)": 					"questions",
		"users(/)": 			"users",
		"questions/ask(/)": 	"ask",
		"leaderboard(/)": 		"leaderboard"
	},

	questions: function() {
		QK.Routes.QuestionsPage.handle();
	},
	users: function() {
		alert("YO! users!");
	},
	ask: function() {
		QK.Routes.AskPage.handle();
	},
	leaderboard: function() {
		alert("YO! leaderboard!");
	},

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