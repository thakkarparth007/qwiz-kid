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