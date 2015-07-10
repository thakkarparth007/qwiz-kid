// namespace QwizKid
// 
// File: /public/javascripts/routes/questions.js
// Description: Contains code for the questions page on the client.

(function() {
var QK = window.QwizKid = window.QwizKid || {};

QK.Routes = QK.Routes || {}; 
QK.Models = QK.Models || {};
QK.Collections = QK.Collections || {};

function BadParameterError(field,msg) {
	this.field = field;
	this.message = field + ":" + msg;
	this.originalMessage = msg;
	this.stack = (new Error()).stack;
}
BadParameterError.prototype = new Error();
BadParameterError.prototype.constructor = BadParameterError;

// data for validation.
var qconf = {
	"MAX_TITLE_LENGTH": 200,

	"MAX_QUESTION_LENGTH": 1500,

	"MAX_CATEGORIES": 5,

	"MAX_EXPLANATION_LENGTH": 1500,

	"MIN_TIMELIMIT": 60,

	"MAX_TIMELIMIT": 180,
};



var QuestionModel = Backbone.Model.extend({
	urlRoot: '/ajax/questions?view=json',
	idAttribute: "_id",
	validateTitle: function(title) {
		title = title.toString().trim();

		if(title === "")
			return new BadParameterError("title","Title is required");

		if(title.length > qconf.MAX_TITLE_LENGTH)
			return new BadParameterError("title","Title too long");

		return title;
	},
	validateQuestion: function(question) {
		question = question.toString().trim();

		if(question === "")
			return new BadParameterError("question","Question is required");
		if(question.length > qconf.MAX_QUESTION_LENGTH)
			return new BadParameterError("question","Question too long");

		return question;
	},
	validateOption: function(option) {
		option = option.toString().trim();

		if(option === "")
			return new BadParameterError("option", "Option is required");
		if(option.length > qconf.MAX_OPTION_LENGTH)
			return new BadParameterError("option", "Option too long");

		return option;
	},
	validateExplanation: function(explanation) {
		explanation = explanation.toString().trim();

		// default explantion. :P
		if(explanation === "")
			explanation = "Trivial!";

		if(explanation.length > qconf.MAX_EXPLANATION_LENGTH)
			return new BadParameterError("explanation","Explanation too long");

		return explanation;
	},
	validateAnswer: function(answer) {
		answer = parseInt(answer,10);
		if(!answer || answer > 4 || answer < 1) {
			return new BadParameterError("answer","Bad Answer");
		}
		return answer;
	},
	validateTimeLimit: function(timelimit) {
		// default : no-timelimit
		if(timelimit == 0)	// deliberately used == over ===
			return Number.POSITIVE_INFINITY;

		if(timelimit != Number.POSITIVE_INFINITY) {
			timelimit = parseInt(timelimit,10);
			if(timelimit > qconf.MAX_TIMELIMIT || 
				timelimit < qconf.MIN_TIMELIMIT)
			{
				return (new BadParameterError("timelimit","Time limit must be between " +
					qconf.MIN_TIMELIMIT + " and " + qconf.MAX_TIMELIMIT));
			}
		}

		return timelimit;
	},
	validateCategories: function(categories) {
		if(categories.length > qconf.MAX_CATEGORIES) {
			return (new BadParameterError("categories", "Too many categories for " +
				"the question."));
		}
		if(categories.length === 0) {
			return (new BadParameterError("categories", "Category is required"));
		}

		// check if the categories given here actually exist
		// we use the QK.Collections.Categories collection
		// that contains the list all the categories along
		// with their ids and names.
		// use get(id) on the collection to check if the id
		// and the name match
		for(var i = 0; i < categories.length; i++) {
			categories[i] = categories[i].trim();

			if(QK.Collections.Categories.where({_id: categories[i]}) === null) {
				return (new BadParameterError("categories", "Invalid category " +
					"ids provided."));
			}
		}

		return categories;
	},
	validate: function(attr, options) {
		// validation rules:
		// 
		// 1. categories - all must be valid category ids, that exist.
		// 				 - max length = config.questions.MAX_CATEGORIES
		// 
		// 2. title - length <= config.questions.MAX_TITLE_LENGTH chars.
		// 
		// 3. question - length <= config.questions.MAX_QUESTION_LENGTH chars.
		// 
		// 4. options - array of length 4. Each option, non-empty, 
		// 				maxlen = config.questions.MAX_OPTION_LENGTH
		// 
		// 5. answer - 1 or 2 or 3 or 4
		// 
		// 6. explanation - length <= 
		// 						config.questions.MAX_EXPLANATION_LENGTH
		// 
		// 7. timelimt - integer between config.questions.MIN_TIMELIMIT 
		// 					and config.questions.MAX_TIMELIMIT
		// 				or, Number.POSITIVE_INFINITY
		//
		
		var that = this;
		var opts = attr.options.map(that.validateOption);
		var erropts = [];
		for(var i = 0; i < 4; i++) {
			if(opts[i] instanceof Error) {
				break;
			}
		}
		if(i < 4) {
			erropts = opts;
			opts = new BadParameterError("options","Bad options");
			opts.details = erropts;
		}

		var clean = {
			title: 		that.validateTitle(attr.title),
			question: 	that.validateQuestion(attr.question),
			options: 	opts,
			explanation:that.validateExplanation(attr.explanation),
			answer: 	that.validateAnswer(attr.answer),
			timelimit: 	that.validateTimeLimit(attr.timelimit),
			categories: that.validateCategories(attr.categories)
		};

		var errors = [];
		for(var key in clean) {
			if(clean[key] instanceof Error)
				errors.push(clean[key]);
		}

		// if errors were found, return them.
		if(errors.length)
			return errors;

		// return nothing. Things are safe.
		// override model values with the normalized
		// values. Use silent: true so that any 
		// changes there don't get affected in the
		// UI. Otherwise, trimming off extra 
		// whitespace will trigger renders of
		// the UI. Useless thing.
		this.set(clean, { silent: true });
	}
		
});

var AskPage = Backbone.View.extend({

	topbarTmpl: 	Handlebars.templates.ask_topbar,
	pagecontentTmpl:Handlebars.templates.ask_pagecontent,

	events: {
		"click #btn-question-save": 		"saveQuestion",
		"click #answers-drop-down>div": 	"changeOption",

		// validation bbz
		"blur #txt-question-title": 	"validateTitle",
		"blur #txt-question": 			"validateQuestion",
		"blur .option-wrapper input": 	"validateOption",
		"blur #txt-explanation": 		"validateExplanation",
		"blur #txt-categories": 		"validateCategories",
		"blur #txt-time-limit": 		"validateTimeLimit",
		"change #correct-answer": 		"validateAnswer"

	},

	initialize: function() {
		// don't render yet.
		// called only once. 
		// handle() is called by the main Router.
		
		this.listenTo(this.model,'error',this.error);
		this.listenTo(this.model,'invalid',this.invalid);
	},
	handle: function() {
		this.render();

		this.$title = $("#txt-question-title");
		this.$question = $("#txt-question");
		this.$option1 = $("#option1");
		this.$option2 = $("#option2");
		this.$option3 = $("#option3");
		this.$option4 = $("#option4");
		this.$explanation = $("#txt-explanation");
		this.$categories = $("#txt-categories");
		this.$answer = $("#correct-answer");
		this.$answerdropdown = $("#answers-drop-down");
		this.$timelimit = $("#txt-time-limit");
	},
	changeOption: function(ev) {
		this.$answer.val( $(ev.target).html() );
	},
	_validateX: function(elem,what,where) {
		var $elem = elem;
		if(typeof elem !== 'object') {
			$elem = this['$' + elem];
		}
		var val = $elem.val();
		if(elem == 'categories')
			val = this.getCategoriesFromInput();
		else if(elem == 'answer')
			val = this.getAnswerFromInput();

		var result = this.model[what].call(this.model, val);
		if(result instanceof Error)
			QK.ErrorFactory($elem,result,where || 'right');
		else
			$elem.removeClass('error').addClass('success');
	},
	validateTitle: function(ev) {
		this._validateX('title','validateTitle','bottom');
	},
	validateQuestion: function(ev) {
		this._validateX('question','validateQuestion','right');
	},
	validateOption: function(ev) {
		// 'top' for option1 and option2,
		// right for the other two.
		var dir = /[12]/.test(ev.target.id) ? 'top' : 'right';
		this._validateX(ev.target.id,'validateOption',dir);
	},
	validateExplanation: function(ev) {
		this._validateX('explanation','validateExplanation','bottom');
	},
	validateCategories: function(ev) {
		this._validateX('categories','validateCategories','top');
	},
	validateTimeLimit: function(ev) {
		this._validateX('timelimit','validateTimeLimit','bottom');
	},
	validateAnswer: function(ev) {
		this._validateX('answer','validateAnswer','bottom');
	},
	saveQuestion: function() {
		this.model.set("title", this.$title.val());
		this.model.set("question", this.$question.val());
		this.model.set("options", [
			this.$option1.val(),
			this.$option2.val(),
			this.$option3.val(),
			this.$option4.val()
		]);
		this.model.set("explanation", this.$explanation.val());
		this.model.set("categories", this.getCategoriesFromInput());
		this.model.set("answer", this.getAnswerFromInput());
		this.model.set("timelimit", this.$timelimit.val());

		this.model.save(null, {
			success: function(model, resp) {
				alert("Successfully saved!");
			},
			error: function(model, resp) {
				alert("Oops!");
				console.log(resp);
			}
		});
		
		// this part - saving of a question shouldn't
		// be dynamic - in the sense, it shouldn't 
		// allow the user to create a new question
		// before the server confirms that this one 
		// has been successfully saved.
		// 
		// yet to implement this.
	},
	error: function(model,err) {
		alert("Error occured while fetching data from server");
		console.log(err);
	},
	invalid: function(model,errors) {
		for(var i = 0; i < errors.length; i++) {
			switch(errors[i].field) {
				case "title":
					QK.ErrorFactory(this.$title,errors[i],'bottom');
					break;

				case "explanation":
					QK.ErrorFactory(this.$explanation,errors[i],'bottom');
					break;

				case "answer":
					QK.ErrorFactory(this.$answer,errors[i],{
						direction: 'top',
						hideEvent: 'change'
					});
					break;

				case "timelimit":
					QK.ErrorFactory(this.$timelimit,errors[i],'bottom');
					break;

				case "question":
					QK.ErrorFactory(this.$question,errors[i],'right');
					break;

				case "options":
					for(var j = 0; j < 4; j++) {
						if(errors[i].details[j] instanceof Error) {
							QK.ErrorFactory(this['$option' + (j+1)],
								errors[i].details[j], (j < 2 ? 'top' : 'right'));
						}
					}
					break;

				case "categories":
					QK.ErrorFactory(this.$categories,errors[i],'top');
					break;
			}
		}
	},
	getCategoriesFromInput: function() {
		// this function implements the logic to 
		// acquire the categories from the form. 
		// This is separated from saveQuestion() 
		// because we might implement a suggestion-box
		// type feature for categories.
		// In that case, the input for categories might
		// not be a simple text-box
		
		if(this.$categories.val().trim()) {
			return this.$categories.val().split(",").map(function(x) {
				return x.trim();
			});
		}

		return [];
	},
	getAnswerFromInput: function() {
		// this function implements the logic to 
		// acquire the answer from the form. 
		switch(this.$answer.val()) {
			case 'A':
				return 1;
			case 'B':
				return 2;
			case 'C':
				return 3;
			case 'D':
				return 4;
		}
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

