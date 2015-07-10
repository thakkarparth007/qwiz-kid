(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['ask_pagecontent'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"pane\">\n	<div id=\"question-wrapper\">\n		<label for=\"txt-question\">Question</label>\n		<textarea id=\"txt-question\" name=\"question\" placeholder=\"Type your question here...\"></textarea>\n	</div>\n\n	<div id=\"options-wrapper\">\n		<div class=\"option-wrapper\">\n			<label for=\"option1\">A</label>\n			<input type=\"text\" id=\"option1\" name=\"option1\" placeholder=\"Option 1\">\n		</div>\n\n		<div class=\"option-wrapper\">\n			<label for=\"option1\">B</label>\n			<input type=\"text\" id=\"option2\" name=\"option2\" placeholder=\"Option 2\">\n		</div>\n\n		<div class=\"option-wrapper\">\n			<label for=\"option1\">C</label>\n			<input type=\"text\" id=\"option3\" name=\"option3\" placeholder=\"Option 3\">\n		</div>\n\n		<div class=\"option-wrapper\">\n			<label for=\"option1\">D</label>\n			<input type=\"text\" id=\"option4\" name=\"option4\" placeholder=\"Option 4\">\n		</div>\n	</div>\n</div>\n\n<div class=\"pane\">\n	<div id=\"explanation-wrapper\">\n		<label for=\"txt-explanation\">Explanation</label>\n		<textarea placeholder=\"Type your explanation here...\" id=\"txt-explanation\" name=\"explanation\"></textarea>\n	</div>\n\n	<div id=\"categories-wrapper\">\n		<label for=\"txt-categories\">Categories</label>\n		<input type=\"text\" id=\"txt-categories\" name=\"categories\" placeholder=\"Add categories...\">\n	</div>\n</div>\n</div>";
},"useData":true});
templates['ask_topbar'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"question-title-wrapper\">\n	<input type=\"text\" name=\"title\" id=\"txt-question-title\" placeholder=\"Title of the question...\"> \n	<input type=\"button\" id=\"btn-question-save\" value=\"Save!\">\n</div>\n\n<div id=\"correct-answer-wrapper\">\n	<span>Correct Answer</span>\n	<div id=\"answer-choices-container\">\n		<input id=\"correct-answer\" value=\"Choose\">\n		<div id=\"answers-drop-down\">\n			<div id=\"option-a\">A</div>\n			<div id=\"option-b\">B</div>\n			<div id=\"option-c\">C</div>\n			<div id=\"option-d\">D</div>\n		</div>\n	</div>\n</div>\n\n<div id=\"time-limit-wrapper\">\n	<span>Time Limit</span>\n	<input type=\"number\" id=\"txt-time-limit\" placeholder=\"None\">\n</div>";
},"useData":true});
templates['leaderboard_entry'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<tr>\n	<td class=\"user-rank\">\n		"
    + alias3(((helper = (helper = helpers.rank || (depth0 != null ? depth0.rank : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"rank","hash":{},"data":data}) : helper)))
    + "\n	</td>\n	<td class=\"user-username\">\n		<span>"
    + alias3(((helper = (helper = helpers.username || (depth0 != null ? depth0.username : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"username","hash":{},"data":data}) : helper)))
    + "</span>\n	</td>\n	<td class=\"user-name\">\n		<span>"
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</span>\n	</td>\n	<td class=\"user-score\">\n		<span>"
    + alias3(((helper = (helper = helpers.score || (depth0 != null ? depth0.score : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"score","hash":{},"data":data}) : helper)))
    + "</span>\n	</td>\n</tr>";
},"useData":true});
templates['leaderboard_pagecontent'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<table id=\"tbl-leaderboard\" class=\"transition-children\">\n	<tr id=\"tbl-leaderboard-header\">\n		<th id=\"th-rank\">Rank</th>\n		<th id=\"th-username\">Username</th>\n		<th id=\"th-name\">Name</th>\n		<th id=\"th-score\">Score</th>\n	</tr>\n</table>";
},"useData":true});
templates['leaderboard_topbar'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class=\"page-title\">\n	Leaderboard\n</div>\n\n<div class=\"score\">\n	Your Score : <span class=\"value\">"
    + alias3(((helper = (helper = helpers.score || (depth0 != null ? depth0.score : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"score","hash":{},"data":data}) : helper)))
    + "</span>\n</div>\n\n<div class=\"rank\">\n	Your Rank : <span class=\"value\">"
    + alias3(((helper = (helper = helpers.rank || (depth0 != null ? depth0.rank : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"rank","hash":{},"data":data}) : helper)))
    + "</span>\n</div>\n\n";
},"useData":true});
templates['questions_QuestionEntry'] = template({"1":function(depth0,helpers,partials,data) {
    return "				"
    + this.escapeExpression((helpers.round || (depth0 && depth0.round) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.fastest : depth0),{"name":"round","hash":{},"data":data}))
    + "s\n";
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
    + alias3((helpers.toPercentage || (depth0 && depth0.toPercentage) || alias1).call(depth0,(depth0 != null ? depth0.successratio : depth0),{"name":"toPercentage","hash":{},"data":data}))
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
templates['solveit_pagecontent'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class=\"pane\">\n	<div id=\"question-wrapper\">\n		<label>Question</label>\n		<div id=\"question\">\n			<p>"
    + alias3(((helper = (helper = helpers.question || (depth0 != null ? depth0.question : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"question","hash":{},"data":data}) : helper)))
    + "</p>\n		</div>\n	</div>\n\n	<div id=\"options-wrapper\">\n		<div class=\"option-wrapper\">\n			<label for=\"option1\">A</label>\n			<input type=\"button\" id=\"option1\" name=\"option1\" value=\""
    + alias3(((helper = (helper = helpers.option1 || (depth0 != null ? depth0.option1 : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"option1","hash":{},"data":data}) : helper)))
    + "\">\n		</div>\n\n		<div class=\"option-wrapper\">\n			<label for=\"option1\">B</label>\n			<input type=\"button\" id=\"option2\" name=\"option2\" value=\""
    + alias3(((helper = (helper = helpers.option2 || (depth0 != null ? depth0.option2 : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"option2","hash":{},"data":data}) : helper)))
    + "\">\n		</div>\n\n		<div class=\"option-wrapper\">\n			<label for=\"option1\">C</label>\n			<input type=\"button\" id=\"option3\" name=\"option3\" value=\""
    + alias3(((helper = (helper = helpers.option3 || (depth0 != null ? depth0.option3 : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"option3","hash":{},"data":data}) : helper)))
    + "\">\n		</div>\n\n		<div class=\"option-wrapper\">\n			<label for=\"option1\">D</label>\n			<input type=\"button\" id=\"option4\" name=\"option4\" value=\""
    + alias3(((helper = (helper = helpers.option4 || (depth0 != null ? depth0.option4 : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"option4","hash":{},"data":data}) : helper)))
    + "\">\n		</div>\n	</div>\n</div>\n\n<div class=\"pane\">\n	<div id=\"explanation-wrapper\">\n		<label>Explanation</label>\n		<div id=\"explanation\">\n			<p>"
    + alias3(((helper = (helper = helpers.explanation || (depth0 != null ? depth0.explanation : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"explanation","hash":{},"data":data}) : helper)))
    + "</p>\n		</div>\n	</div>\n\n	<div id=\"categories-wrapper\">\n		<label>Categories</label>\n		<div id=\"categories\">"
    + alias3(((helper = (helper = helpers.categories || (depth0 != null ? depth0.categories : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"categories","hash":{},"data":data}) : helper)))
    + "</div>\n	</div>\n</div>\n</div>";
},"useData":true});
templates['solveit_topbar'] = template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return "		<span class=\"question-attempted\">"
    + this.escapeExpression(((helper = (helper = helpers.attempt || (depth0 != null ? depth0.attempt : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"attempt","hash":{},"data":data}) : helper)))
    + "</span>\n";
},"3":function(depth0,helpers,partials,data) {
    var helper;

  return "		"
    + this.escapeExpression(((helper = (helper = helpers.timelimit || (depth0 != null ? depth0.timelimit : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"timelimit","hash":{},"data":data}) : helper)))
    + "\n";
},"5":function(depth0,helpers,partials,data) {
    return "		None\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class=\"question-title\">\n	<strong>Title</strong>: \n	<span class=\"value\">"
    + alias3(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper)))
    + "</span>\n\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.attempt : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "</div>\n\n<div class=\"question-setter\">\n	<strong>Setter</strong>: \n	<span class=\"value\">"
    + alias3(((helper = (helper = helpers.ownerid || (depth0 != null ? depth0.ownerid : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"ownerid","hash":{},"data":data}) : helper)))
    + "</span>\n</div>\n\n<div class=\"question-time-limit\">\n	<strong>Time Limit</strong>:\n\n	<span class=\"value\">\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.timelimit : depth0),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.program(5, data, 0),"data":data})) != null ? stack1 : "")
    + "	</span>\n</div>";
},"useData":true});
})();