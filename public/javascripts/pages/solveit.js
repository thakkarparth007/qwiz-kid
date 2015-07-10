// namespace QwizKid
// 
// File: /public/javascripts/routes/solveit.js
// Description: Contains code for the page that will load
// 				a question with the given id.

(function() {
var QK = window.QwizKid = window.QwizKid || {};

QK.Routes = QK.Routes || {}; 
QK.Models = QK.Models || {};

var QuestionModel = Backbone.Model.extend({
	idAttribute: "_id",
});

var SolveItPage = Backbone.View.extend({

	topbarTmpl: 	Handlebars.templates.solveit_topbar,
	pagecontentTmpl:Handlebars.templates.solveit_pagecontent,

	events: {
		"click .option-wrapper input": 		"markResponse"
	},

	initialize: function() {
		// don't render yet.
		// called only once. 
		// handle() is called by the main Router.
		

	},
	handle: function(qid) {
		var that = this;
		$.ajax({
			url: '/ajax/questions/' + qid + '?view=json',
			method: 'POST',
			dataType: 'json',
			success: function(data,textstatus,xhr) {
				that.qid = qid;
				
				data.option1 = data.options[0];
				data.option2 = data.options[1];
				data.option3 = data.options[2];
				data.option4 = data.options[3];

				$("#top-bar").html( that.topbarTmpl(data) );
				$("#page-content").html( that.pagecontentTmpl(data) );
				if(data.attempt)
					$("#page-solveit").addClass("solved");
			},
			error: function(xhr,textstatus,err) {
				that.error(null,err);
			}
		});
		this.render();
	},
	error: function(model,err) {
		alert("Error occured while fetching data from server");
		console.log(err);
	},
	markResponse: function(ev) {
		var that = this;
		var answer = (ev.target.id.match(/option(\d)/)[1]);
		$.ajax({
			url: '/ajax/questions/' + that.qid + '/submit?view=json',
			method: 'POST',
			data: {
				answer: answer
			},
			success: function(data,textstatus,xhr) {
				alert("You earned " + data + "points");
			},
			error: function(xhr,textstatus,err) {
				that.error(err);
			}
		});
	},
	render: function() {
		this.setElement(document.body);

		$("[id*=tooltipsy]").remove();
		$("nav a").removeClass("selected");
		$("#a-questions").addClass("selected");
		$(".main").attr('id', 'page-solveit');

		$("#top-bar").html( this.topbarTmpl() );
		$("#page-content").html( this.pagecontentTmpl() );
	}
});

QK.Routes.SolveItPage = new SolveItPage();

})();

