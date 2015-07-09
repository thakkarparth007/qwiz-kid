// namespace QwizKid
// 
// File: /public/javascripts/routes/questions.js
// Description: Contains code for the questions page on the client.

(function() {
var QK = window.QwizKid = window.QwizKid || {};

QK.Routes = QK.Routes || {}; 
QK.Models = QK.Models || {};

var QuestionModel = Backbone.Model.extend({

});

var QuestionsCollection = Backbone.Collection.extend({
	url: '/ajax/questions?view=json'
});

var QuestionsPage = Backbone.View.extend({

	topbarTmpl: 	Handlebars.templates.questions_topbar,
	pagecontentTmpl:Handlebars.templates.questions_pagecontent,
	questionTmpl: 	Handlebars.templates.questions_QuestionEntry,

	events: {
		"click #btn-search-questions": 	"search"
	},

	search: function() {
		alert($("#txt-search-questions").val());
	},

	initialize: function() {
		// don't render yet.
		// called only once. 
		// handle() is called by the main Router.
		
		this.listenTo(this.collection, 'add', this.addQuestion);
		this.listenTo(this.collection, 'error', this.error);
	},
	handle: function() {
		this.collection.fetch();
		this.render();
	},
	addQuestion: function(q) {
		console.log(q.attributes);
		$("#tbl-questions-header").after( this.questionTmpl(q.toJSON()) );
	},
	error: function(err) {
		alert("Error occured while fetching data from server");
		console.log(err);
	},
	render: function() {
		this.setElement(document.body);

		$("nav a").removeClass("selected");
		$("#a-questions").addClass("selected");
		$(".main").attr('id', 'page-questions');

		$("#top-bar").html( this.topbarTmpl() );
		$("#page-content").html( this.pagecontentTmpl() );
	}
});

QK.Routes.QuestionsPage = new QuestionsPage({
	collection: new QuestionsCollection()
});

})();

