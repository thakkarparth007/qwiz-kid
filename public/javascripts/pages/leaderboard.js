// namespace QwizKid
// 
// File: /public/javascripts/routes/questions.js
// Description: Contains code for the questions page on the client.

(function() {
var QK = window.QwizKid = window.QwizKid || {};

QK.Routes = QK.Routes || {}; 
QK.Models = QK.Models || {};

var UserLeaderBoardModel = Backbone.Model.extend({
	idAttribute: "username",
});

var LeaderboardCollection = Backbone.Collection.extend({
	url: '/ajax/leaderboard?view=json',
	model: UserLeaderBoardModel,
	comparator: function(a,b) {
		if(a.get('rank') < b.get('rank'))
			return -1;
		if(a.get('rank') > b.get('rank'))
			return 1;
		return 0;
	},
	parse: function(data) {
		this.score = data.score;
		this.rank = data.rank;
		return data.leaderboard;
	}
});

var LeaderboardPage = Backbone.View.extend({

	topbarTmpl: 	Handlebars.templates.leaderboard_topbar,
	pagecontentTmpl:Handlebars.templates.leaderboard_pagecontent,
	userTmpl: 		Handlebars.templates.leaderboard_entry,

	events: {
		
	},

	search: function() {
		
	},

	initialize: function() {
		// don't render yet.
		// called only once. 
		// handle() is called by the main Router.
		
		this.listenTo(this.collection, 'add', this.addUser);
		this.listenTo(this.collection, 'reset', this.resetView);
		this.listenTo(this.collection, 'error', this.error);
	},
	handle: function() {
		if(!this.collection.length)
			this.collection.fetch({reset: true});

		this.render();
		this.resetView();
	},
	resetView: function() {
		var that = this;
		$("#top-bar").html(this.topbarTmpl({
			score: that.collection.score,
			rank: that.collection.rank
		}));
		this.collection.forEach(this.addUser,this);
	},
	addUser: function(u) {
		$("#tbl-leaderboard").append( this.userTmpl(u.toJSON()) );
	},
	error: function(model,err) {
		alert("Error occured while fetching data from server");
		console.log(err);
	},
	render: function() {
		this.setElement(document.body);

		$("[id*=tooltipsy]").remove();
		$("nav a").removeClass("selected");
		$("#a-leaderboard").addClass("selected");
		$(".main").attr('id', 'page-leaderboard');

		$("#top-bar").html( this.topbarTmpl() );
		$("#page-content").html( this.pagecontentTmpl() );
	}
});

QK.Routes.LeaderboardPage = new LeaderboardPage({
	collection: new LeaderboardCollection()
});

})();

