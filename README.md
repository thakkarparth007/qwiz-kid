# Quiz-Kid
### Description
A basic quizzing platform

## TOC
- [Build Instructions](#buildinstr)
	- [Prerequisite Software](#prereq)
	- [Steps to build](#stepstobuild)
	- [Steps to run](#stepstorun)
- [Internals](#internals)
	- [Database Collections](#database)
	- [Routes](#routes)

---

### <a name="buildinstr"></a> Build Instructions

<a name="prereq"></a>**Prerequisite Software**:

> 	- Node.js
> 	- MongoDB

<a name="stepstobuild"></a>**Steps to build**:

> 1. Clone the repository to your computer
> 2. `cd` to the repo-directory.
> 3. Run `npm install` in the shell.
> 4. That's it.

<a name="stepstorun"></a>**Steps to run**:

> 1. `cd` to the repo-directory.
> 2. Run `npm start`.
> 3. If you want to change the run-time settings, make required changes to the `./config.js` file.

----
## <a name="internals"></a> Internals

### <a name="database"></a> Database collections
1. `users`
	* username			*indexed*
	* passwordhash
	* name 				*indexed*
	* email 			*indexed*
	* emailpublic		(`boolean`. Email will be publicly visible if true.)
	* college
	* state
	* country
	* score 			*indexed*
	* categories:		```[{ categoryid, corattempts, incorattempts }]```
	* joindate:			(`UTC timestamp`) *indexed*
2. `questions`
	* _id 				*indexed*
	* categoryids:		```[]```
	* ownerid 			*indexed*
	* title
	* question
	* options:			```[]```
	* answer
	* explanation		(optional `text`)
	* timelimit			(`number`. Number of seconds after which the user isn't allowed to answer. -1 if no such limit should be applied.)
	* votes: 			```[{ username: '', type: {1 or -1}	}]``` *indexed*
	* corattempts		(correct attempts : `number`) *indexed*
	* incorattempts	(incorrect attempts : `number`) *indexed*
	* createdat			(`UTC timestamp`) *indexed*
	* editedat			(`UTC timestamp`) *indexed*
3. `categories`
	* _id
	* name
4. `answerstats`
	* qid 				*indexed*
	* username			*indexed*
	* seentime			(`UTC timestamp`)
	* timetoanswer 		(`Number` - seconds) *indexed*
	* points			(points scored by the user who answered the question) *indexed*
5. `colleges`
	* _id				*indexed*
	* name
	* city
	* country
	* membercount		(`integer`)

### <a name="routes"></a> Routes
`/login`
- **GET**: Returns the login/signup page.
- **POST**: Send the login credentials to login.
	- Params:
		- `username`
		- `password`

---
`/logout`
- **GET**: Logs out the user.

---

`/signup`
- **GET**: Returns the login/signup page.
- **POST**: Register a user.
	- Params:
		* username
		* password
		* cnfmpassword
		* name
		* email
		* emailpublic		(`boolean`. Email will be publicly visible if true.)
		* college
		* state
		* country

If the user account is created successfully, redirects to `/users/{username}`.

Otherwise, shows the errors on the signup page.


---

`/`
- **GET**: Returns the home page.
	
	For a logged in user, this returns the dashboard.

`/users`
- **GET**: Returns a list of users

	- Params:
		- `view`: Default: 'html'. ('html' or 'json')
		- `search`: A json object with these fields
			- `main`	(matches either name or username)
			- `email`
			- `college`
			- `state`
			- `country`

			The filtering works by "AND"ing.

		- `sortby`: Default: 'score'. Can be 'college', 'state', 'country', 'score' or 'joindate'.
		- `sortord`: Default: '-1'. Can be '1' (ascending) or '-1' (descending).
		- `limit`: Default: 20. Can be a positive integer less than or equal to 100, and greater than or equal to 10.
		- `page`: Default: 1. The page number of the returned results.

	Returns only `username`, `name`, `email` (if `emailpublic` is `"true"`), `emailpublic`, `college`, `state`, `country`,`score`.
	
---

`/users/{username}`
- **GET**: Returns user-profile.

	- Params:
		- `view`: Default: 'html'. ('html' or 'json')

---

`/users/{username}/{questions}`

- **GET**: Returns the questions set by the user (only appropriate fields are sent - see `/questions`).

	- Params:
		- `view`: Default: 'html'. ('html' or 'json')
		- `search`: A search query string.
		- `sortby`: Default: 'createdat'. Can be 'awesomeness', 'createdat' or 'votes'.
		- `sortord`: Default: '-1'. Can be '1' (ascending) or '-1' (descending).
		- `limit`: Default: 20. Can be a positive integer less than or equal to 100.
		- `page`: Default: 1. The page number of the returned results.
	
	`awesomeness` and `votes` are different. `awesomeness` is a function of various parameters including votes and difficulty. (Will be implemented later. Till then, is equal to `votes`).

---

`/categories[.json]`

- **GET**: Returns a list of categories and the number of questions in each category.

	- Params:
		- `view`: Default: 'html'. ('html' or 'json')

---
`/questions[.json]`

- **GET**: Returns a list of questions (only `id`, `categoryids`, `ownerid`, `title`, `timelimit`, `votecount`, `corrattempts`, `incorattempts`, `createdat`, `editedat` are sent).

	- Params:
		- `view`: Default: 'html'. ('html' or 'json')
		- `search`: A search query string.
		- `sortby`: Default: 'createdat'. Can be 'awesomeness', 'createdat' or 'votes'.
		- `sortord`: Default: '-1'. Can be '1' (ascending) or '-1' (descending).
		- `limit`: Default: 20. Can be a positive integer less than or equal to 100.
		- `page`: Default: 1. The page number of the returned results.
		
	`awesomeness` and `votes` are different. `awesomeness` is a function of various parameters including votes and difficulty. (Will be implemented later. Till then, is equal to `votes`).

- **POST**: To submit a question.
	- Params:
		- `categories`	(**required**. Array of strings)
		- `title`			(**required**. String)
		- `question`		(**required**. String)
		- `options`		(**required**. Array of 4 strings)
		- `answer`		(**required**. Either of 1,2,3 or 4)
		- `explanation`	(*optional*. A brief explanation about the answer)


---

`/questions/{qid}`

- **GET**: Returns the question with `id` = `qid`. Returns (`id`, `categoryids`, `ownerid`, `title`, `question`, `options`, `timelimit`, `votecount`, `corrattempts`, `incorattempts`, `createdat`, `editedat`). Note that the server will not give points to answers submitted after `timelimit` seconds (if `timelimit != -1`). Hence, the answers must be submitted *quickly*.

	- Params:
		- `view`: Default: 'html'. ('html' or 'json')

- **POST**: Submit the answer to the question. 

	- Params:
		- `answer`	(1, 2, 3, or 4)

	Returns the following object:

	```javascript
	{
		result:       STRING,   // "correct" or "incorrect"
		pointsscored: NUMBER,   // 0 if result === "incorrect"
		timeused:     NUMBER,   // number of seconds taken
	}
	```	
