(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['ask_pagecontent'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"pane\">\n	<div id=\"question-wrapper\">\n		<label for=\"txt-question\">Question</label>\n		<textarea id=\"txt-question\" name=\"question\" placeholder=\"Type your question here...\"></textarea>\n	</div>\n\n	<div id=\"options-wrapper\">\n		<div class=\"option-wrapper\">\n			<label for=\"option1\">A</label>\n			<input type=\"text\" id=\"option1\" name=\"option1\" placeholder=\"Option 1\">\n		</div>\n\n		<div class=\"option-wrapper\">\n			<label for=\"option1\">B</label>\n			<input type=\"text\" id=\"option2\" name=\"option2\" placeholder=\"Option 2\">\n		</div>\n\n		<div class=\"option-wrapper\">\n			<label for=\"option1\">C</label>\n			<input type=\"text\" id=\"option3\" name=\"option3\" placeholder=\"Option 3\">\n		</div>\n\n		<div class=\"option-wrapper\">\n			<label for=\"option1\">D</label>\n			<input type=\"text\" id=\"option4\" name=\"option4\" placeholder=\"Option 4\">\n		</div>\n	</div>\n</div>\n\n<div class=\"pane\">\n	<div id=\"explanation-wrapper\">\n		<label for=\"txt-explanation\">Explanation</label>\n		<textarea placeholder=\"Type your explanation here...\" id=\"txt-explanation\" name=\"explanation\"></textarea>\n	</div>\n\n	<div id=\"categories-wrapper\">\n		<label for=\"txt-categories\">Categories</label>\n		<input type=\"text\" id=\"txt-categories\" name=\"categories\" placeholder=\"Add categories...\">\n	</div>\n</div>\n</div>";
},"useData":true});
templates['ask_topbar'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"question-title-wrapper\">\n	<input type=\"text\" name=\"title\" id=\"txt-question-title\" placeholder=\"Title of the question...\"> \n	<input type=\"button\" id=\"btn-question-save\" value=\"Save!\">\n</div>\n\n<div id=\"correct-answer-wrapper\">\n	<span>Correct Answer</span>\n	<div id=\"answer-choices-container\">\n		<input id=\"correct-answer\" value=\"Choose\">\n		<div id=\"answers-drop-down\">\n			<div id=\"option-a\">A</div>\n			<div id=\"option-b\">B</div>\n			<div id=\"option-c\">C</div>\n			<div id=\"option-d\">D</div>\n		</div>\n	</div>\n</div>\n\n<div id=\"time-limit-wrapper\">\n	<span>Time Limit</span>\n	<input type=\"number\" id=\"txt-time-limit\" placeholder=\"None\">\n</div>";
},"useData":true});
templates['questions_QuestionEntry'] = template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return "				"
    + this.escapeExpression(((helper = (helper = helpers.fastest || (depth0 != null ? depth0.fastest : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"fastest","hash":{},"data":data}) : helper)))
    + "\n";
},"3":function(depth0,helpers,partials,data) {
    return "				N/A\n";
},"5":function(depth0,helpers,partials,data) {
    var alias1=this.lambda, alias2=this.escapeExpression;

  return "			<a href=\"/categories/"
    + alias2(alias1(depth0, depth0))
    + "\">"
    + alias2(alias1(depth0, depth0))
    + "</a>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<tr>\n	<td class=\"question-title\">\n		<a href=\"/questions/"
    + alias3(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"_id","hash":{},"data":data}) : helper)))
    + "\">"
    + alias3(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper)))
    + "</a>\n	</td>\n	<td class=\"votes\">\n		<span>"
    + alias3(((helper = (helper = helpers.votecount || (depth0 != null ? depth0.votecount : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"votecount","hash":{},"data":data}) : helper)))
    + "</span>\n	</td>\n	<td class=\"success-ratio\">\n		<span>"
    + alias3(((helper = (helper = helpers.successratio || (depth0 != null ? depth0.successratio : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"successratio","hash":{},"data":data}) : helper)))
    + "</span>\n	</td>\n	<td class=\"fastest\">\n		<span>\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.fastest : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "		</span>\n	</td>\n	<td class=\"question-setter\">\n		<a href=\"/users/"
    + alias3(((helper = (helper = helpers.ownerid || (depth0 != null ? depth0.ownerid : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"ownerid","hash":{},"data":data}) : helper)))
    + "\">"
    + alias3(((helper = (helper = helpers.ownerid || (depth0 != null ? depth0.ownerid : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"ownerid","hash":{},"data":data}) : helper)))
    + "</a>\n	</td>\n	<td class=\"categories\">\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.categories : depth0),{"name":"each","hash":{},"fn":this.program(5, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "	</td>\n</tr>";
},"useData":true});
templates['questions_pagecontent'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<table id=\"tbl-questions\" class=\"transition-children\">\n	<tr id=\"tbl-questions-header\">\n		<th id=\"th-question-title\">Title</th>\n		<th id=\"th-votes\">Votes</th>\n		<th id=\"th-success-ratio\">Success Ratio</th>\n		<th id=\"th-fastest\">Fastest</th>\n		<th id=\"th-question-setter\">Setter</th>\n		<th id=\"th-categories\">Categories</th>\n	</tr>\n</table>";
},"useData":true});
templates['questions_topbar'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"search-wrapper transition-children\">\n	<input type=\"text\" id=\"txt-search-questions\" placeholder=\"Search Questions...\"> \n	<input type=\"button\" id=\"btn-search-questions\" value=\"Search\">\n</div>";
},"useData":true});
})();