// namespace QwizKid
// 
// File: /public/javascripts/routes/questions.js
// Description: Contains code for the questions page on the client.

(function() {
var QK = window.QwizKid = window.QwizKid || {};

QK.Routes = QK.Routes || {}; 
QK.Models = QK.Models || {};

var QuestionModel = Backbone.Model.extend({
	urlRoot: '/ajax/questions?view=json'
});

var AskPage = Backbone.View.extend({

	topbarTmpl: 	Handlebars.templates.ask_topbar,
	pagecontentTmpl:Handlebars.templates.ask_pagecontent,

	events: {
		
	},

	initialize: function() {
		// don't render yet.
		// called only once. 
		// handle() is called by the main Router.
		
		
	},
	handle: function() {
		this.render();
	},
	error: function(err) {
		alert("Error occured while fetching data from server");
		console.log(err);
	},
	render: function() {
		this.setElement(document.body);

		$("nav a").removeClass("selected");
		$("#a-ask").addClass("selected");
		$(".main").attr('id', 'page-ask');

		$("#top-bar").html( this.topbarTmpl() );
		$("#page-content").html( this.pagecontentTmpl() );
	}
});

QK.Routes.AskPage = new AskPage({
	model: new QuestionModel()
});

})();

