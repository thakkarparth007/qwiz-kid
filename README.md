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
	* username
	* passwordhash
	* name
	* email
	* emailpublic		(`boolean`. Email will be publicly visible if true.)
	* college
	* state
	* country
	* score
	* categories:		```[{ categoryid, corattempts, incorattempts }]```
	* joindate:			(`UTC timestamp`)
2. `questions`
	* id
	* categoryids:		```[]```
	* ownerid
	* title
	* question
	* options:			```[]```
	* answer
	* explanation		(optional `text`)
	* timelimit			(`number`. Number of seconds after which the user isn't allowed to answer. -1 if no such limit should be applied.)
	* votes: 			```[{ username: '', type: {1 or -1}	}]```
	* corattempts		(correct attempts : `number`)
	* incorattempts	(incorrect attempts : `number`)
	* createdat			(`UTC timestamp`)
	* editedat			(`UTC timestamp`)
3. `categories`
	* id
	* name
4. `answerstats`
	* qid
	* username			
	* seentime			(`UTC timestamp`)
	* answeredtime		(`UTC timestamp`. Time taken to answer (ms) = answeredtime-seentime)
	* points			(points scored by the user who answered the question)
5. `colleges`
	* id
	* name
	* city
	* country
	* members			(`integer`)

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
		* score

If the user account is created successfully, redirects to `/users/{username}`.

Otherwise, shows the errors on the signup page.


---

`/users[.json]`
- **GET**: Returns a list of users

	If the `.json` is added at the end, then the returned data is in JSON format. Otherwise an html page is sent.

	- Params:
		- `search`: A search query string.
		- `sortby`: Default: 'score'. Can be 'college', 'state', 'country', 'score' or 'joindate'.
		- `sortord`: Default: '-1'. Can be '1' (ascending) or '-1' (descending).
		- `limit`: Default: 20. Can be a positive integer less than or equal to 100.
		- `page`: Default: 1. The page number of the returned results.

---

`/users/{username}[.json]`
- **GET**: Returns user-profile.

	If the `.json` is added at the end, then the returned data is in JSON format. Otherwise an html page is sent.

	If the `username` is that of the currently logged in user, then returns the dashboard page.

---

`/users/{username}/{questions}[.json]`

- **GET**: Returns the questions set by the user (only appropriate fields are sent - see `/questions`).

	If the `.json` is added at the end, then the returned data is in JSON format. Otherwise an html page is sent.
	- Params:
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

`/categories[.json]`

- **GET**: Returns a list of categories and the number of questions in each category.

	If the `.json` is added at the end, then the returned data is in JSON format. Otherwise an html page is sent.

---
`/questions[.json]`

- **GET**: Returns a list of questions (only `id`, `categoryids`, `ownerid`, `title`, `timelimit`, `votecount`, `corrattempts`, `incorattempts`, `createdat`, `editedat` are sent).

	If the `.json` is added at the end, then the returned data is in JSON format. Otherwise an html page is sent.
	- Params:
		- `search`: A search query string.
		- `sortby`: Default: 'createdat'. Can be 'awesomeness', 'createdat' or 'votes'.
		- `sortord`: Default: '-1'. Can be '1' (ascending) or '-1' (descending).
		- `limit`: Default: 20. Can be a positive integer less than or equal to 100.
		- `page`: Default: 1. The page number of the returned results.
		
	`awesomeness` and `votes` are different. `awesomeness` is a function of various parameters including votes and difficulty. (Will be implemented later. Till then, is equal to `votes`).

---

`/questions/{qid}[.json]`

- **GET**: Returns the question with `id` = `qid`. Returns (`id`, `categoryids`, `ownerid`, `title`, `question`, `options`, `timelimit`, `votecount`, `corrattempts`, `incorattempts`, `createdat`, `editedat`). Note that the server will not give points to answers submitted after `timelimit` seconds (if `timelimit != -1`). Hence, the answers must be submitted *quickly*.

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
