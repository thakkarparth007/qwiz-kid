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
	* categoryids:		```[]``` *indexed*
	* ownerid 			*indexed*
	* title
	* question 			*text index*
	* options:			```[]```
	* answer
	* explanation		(optional `text`)
	* timelimit			(`number`. Number of seconds after which the user isn't allowed to answer. Infinity if no such limit should be applied.) *indexed*
	* fastest 			(`number`. Time taken by the fastest solver. null if no one solved so far)       *indexed*
	* upvotes: 			```[ [ usernames, 1/-1] ]```
	* downvotes: 		```[ [ usernames, 1/-1] ]```
	* votecount:		(`number`) *indexed*
	* corattempts		(correct attempts : `number`)
	* incorattempts		(incorrect attempts : `number`)
	* successratio 		(`number` : corattempts.len / incorattempts.len)   *indexed*
	* awesomeness 		(`number` : a function that's yet to be decided)   *indexed*
	* createdat			(`UTC timestamp`) *indexed*
	* editedat			(`UTC timestamp`) *indexed*

3. `categories`
	* _id
	* name

4. `answerstats`
	* qid 				*indexed*
	* username			*indexed*
	* seentime			(`UTC timestamp`)
	* timetoanswer 		(`Number` - seconds: -1 if timeout/gaveup/wrong answer) *indexed*
	* points			(points scored by the user who answered the question) *indexed*
	* attempt 			(`Number` - the option chosen by the user. -1 if the user chooses to not answer. 0 if timeout. null if not answered yet.)

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

`/categories[.json]`

- **GET**: Returns a list of categories and the number of questions in each category.

	- Params:
		- `view`: Default: 'html'. ('html' or 'json')

---
`/questions[.json]`

- **GET**: Returns a list of questions (only `id`, `categoryids`, `ownerid`, `title`, `timelimit`, `fastest`, `upvotecount`, `downvotecount`, `corrattempts`, `incorattempts`, `successratio`, `createdat`, `editedat` are sent)

	- Params:
		- `view`: Default: 'html'. ('html' or 'json')
		- `seen`: Default: 0. Allowed values:
			- 0: Unseen questions
			- 1: Seen

		- `search`: A json object with these fields
			- `main` 	(matches `title` or `question`)

			The filtering works by "AND"ing.
			(Only one field is involved here - `main`, but this is just to make the search queries consistent in format.)

		- `ownerid`


		- `sortby`: Default: `awesomeness`. Can be `createdat`, `timelimit`, `fastest`, `successratio` or `votecount`.
		- `sortord`: Default: '-1'. Can be '1' (ascending) or '-1' (descending).
		- `limit`: Default: 20. Can be a positive integer less than or equal to 100.
		- `page`: Default: 1. The page number of the returned results.
		
- **POST**: To submit a question.
	- Params:
		- `categories`	(**required**. Array of strings)
		- `title`		(**required**. String)
		- `question`	(**required**. String)
		- `options`		(**required**. Array of 4 strings)
		- `answer`		(**required**. Either of 1,2,3 or 4)
		- `explanation`	(*optional*. A brief explanation about the answer)


---

`/questions/{qid}`

- **POST**: Returns the question with `id` = `qid`. Returns (`_id`, `categoryids`, `ownerid`, `title`, `question`, `options`, `timelimit`, `fastest`, `upvotecount`, `downvotecount`, `corrattempts`, `incorattempts`, `createdat`, `editedat`). Note that the server will not give points to answers submitted after `timelimit` seconds (if `timelimit != -1`). Hence, the answers must be submitted *quickly*.

	If the question has already been attempted by the person, then the server also returns the `answer`, `explanation` and the attempt details (`attempt` - the option chosen by the user, `seentime` - the time when the user saw the question, `duration` - the number of seconds taken by the user to answer)

	- Params (QueryString):
		- `view`: Default: 'html'. ('html' or 'json')

	Returns the question either in the html format or json.
	The timer for the question starts.

---

`/questions/{qid}/submit`

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
