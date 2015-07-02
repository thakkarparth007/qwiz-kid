
// Used to escape (user-generated) strings that'll be used 
// in regexes. Function taken from:
// http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
function escape_regex(str) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function clean_search(searchstr, fields) {
	var search = {};
	try {
		search = JSON.parse(searchstr);
	}
	catch(e) {
		search = {};
	}

	var ret = {};
	var s = "";
	for(var i in fields) {
		var key = fields[i];
		s = search[key];

		if(!s) {
			ret[key] = /.*/;
			continue;
		}

		s = escape_regex(s.toString());
		s = s.split(" ").join("|");
		
		ret[key] = new RegExp("(" + s + ")", "i");
	}
	return ret;
}

function clean_view(view) {
	view = view || "";
	view = view.toString();
	if(/^(html|json)$/.test(view)) {
		return view;
	}
	return "";
}

function clean_sortby(sortby, values) {
	sortby = sortby || "";
	sortby = sortby.toString();
	for(var i = values.length-1; i >= 0 ; i--)
		if(values[i] == sortby) break;

	if(i == -1)
		return "";	// default
	return sortby;
}

function clean_sortord(sortord) {
	sortord = sortord || "-1";
	try {
		sortord = parseInt(sortord);
		if(sortord == -1 || sortord == 1)
			return sortord;
	} 
	catch(e) { }
	return "";
}

function clean_limit(limit) {
	limit = limit || "";
	try {
		limit = parseInt(limit);
		if(limit < 101)
			return limit;
	}
	catch(e) { }
	return "";
}

function clean_page(page) {
	page = page || "";
	try {
		page = parseInt(page);
		if(page > 0)
			return page;
	}
	catch(e) { }
	return "";
}

exports.clean_search = clean_search;
exports.clean_view = clean_view;
exports.clean_sortord = clean_sortord;
exports.clean_sortby = clean_sortby;
exports.clean_limit = clean_limit;
exports.clean_page = clean_page;

exports.escape_regex = escape_regex;