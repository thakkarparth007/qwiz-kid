// namespace QwizKid
// 
// File: /public/javascripts/routes/questions.js
// Description: Contains code for the questions page on the client.

(function() {
var QK = window.QwizKid = window.QwizKid || {};

QK.Routes = QK.Routes || {}; 
QK.Models = QK.Models || {};

var QuestionModel = Backbone.Model.extend({
	idAttribute: "_id",
});

var NewQuestionsCollection = Backbone.Collection.extend({
	url: '/ajax/questions?view=json&seen=0',
	model: QuestionModel
});

var SeenQuestionsCollection = Backbone.Collection.extend({
	url: '/ajax/questions?view=json&seen=1',
	model: QuestionModel
});

var ByQuestionsCollection  = Backbone.Collection.extend({
	basicurl: '/ajax/questions?view=json',
	model: QuestionModel,
	fetch: function(options, type, ownerid) {
		this.url = this.basicurl + "&ownerid=" + ownerid;
		Backbone.Collection.prototype.fetch.call(this,options);
	}
});

var QuestionsPage = Backbone.View.extend({

	topbarTmpl: 	Handlebars.templates.questions_topbar,
	pagecontentTmpl:Handlebars.templates.questions_pagecontent,
	questionTmpl: 	Handlebars.templates.questions_QuestionEntry,
	emptyTmpl: 		Handlebars.templates.questions_empty,

	events: {
		"click #btn-search-questions": 	"search"
	},

	search: function() {
		alert($("#txt-search-questions").val());
	},

	initialize: function(opts) {
		// don't render yet.
		// called only once. 
		// handle() is called by the main Router.
		
		//this.listenTo(this.collection, 'add', this.addQuestion);
		//this.listenTo(this.collection, 'reset', this.renderPageContent);
		//this.listenTo(this.collection, 'error', this.error);
		
		this.seenQuestions = opts.seenQuestions;
		this.newQuestions = opts.newQuestions;
		this.byQuestions = opts.byQuestions;
	},
	handle: function(type, ownerid) {
		this.renderStaticContent();

		this.collection = null;
		this._type = type;
		$(".questiontypes a").removeClass("selected");
		switch(type) {
			case "by":
				if(ownerid == $("#a-account").html()) {
					$("#qtype-yours").addClass("selected");
				}
				this.collection = this.byQuestions;
				break;
			case "attempted":
			case "unattempted":
				$("#qtype-" + type).addClass("selected");
				console.log($("#qtype-" + type));
				this.collection = this.seenQuestions;
				break;
			case "new":
				$("#qtype-new").addClass("selected");
				this.collection = this.newQuestions;
				break;
		}
		if(!this.collection.length) {
			this.collection.fetch({ reset: true }, type, ownerid);
			this.collection.once('add reset', _, this);
		}
		else {
			_.apply(this);
		}

		function _() {
			this.renderPageContent();
		}
	},
	renderPageContent: function() {
		if(this.collection.length)
			$(".empty").remove();

		this.collection.forEach(function(q) {
			if(this._type == "unattempted" && q.get('attempt') !== null)
				return;
			if(this._type == "attempted" && q.get('attempt') === null)
				return;

			this.addQuestion(q);
		},this);
	},
	addQuestion: function(q) {
		$("#tbl-questions-header").after( this.questionTmpl(q.toJSON()) );
	},
	error: function(model,err) {
		alert("Error occured while fetching data from server");
		console.log(err);
	},
	renderStaticContent: function() {
		this.setElement(document.body);

		$("[id*=tooltipsy]").remove();
		$("nav a").removeClass("selected");
		$("#a-questions").addClass("selected");
		$(".main").attr('id', 'page-questions');

		$("#top-bar").html( this.topbarTmpl() );
		$("#page-content").html( this.pagecontentTmpl() );
		$("#tbl-questions").append( this.emptyTmpl() );
	}
});

QK.Routes.QuestionsPage = new QuestionsPage({
	newQuestions: new NewQuestionsCollection(),
	seenQuestions: new SeenQuestionsCollection(),
	byQuestions: new ByQuestionsCollection()
});

})();

