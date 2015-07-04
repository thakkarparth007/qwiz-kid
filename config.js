module.exports = 
{
	"is_proxied": false,			// is the server behind a proxy?
	"env": "dev",					// what is the environment? production or development?
	"log": console.log,				// what log function should be used?

	"host": "localhost",
	"port": 3000,

	"BCRYPT_ROUNDS": 8,

	"validation": {
		// so far only the max/min string lengths are defined here.
		
		// ----------- users --------------
		// username
		"MAX_USERNAME_LENGTH": 20,

		// password
		"MIN_PASSWORD_LEN": 8,
		"MAX_PASSWORD_LEN": 25,

		// email
		// nothing
		
		// college
		"MAX_COLLEGE_LENGTH": 100,

		// state
		"MAX_STATE_LENGTH": 40,

		// country
		"MAX_COUNTRY_LENGTH": 40,

		// ----------- questions --------------
		// title
		
		// question
		
		// options
		
		// explanation
		
		// ----------- categories -------------
		// name
	},

	"questions": {
		"MAX_TITLE_LENGTH": 200,

		"MAX_QUESTION_LENGTH": 1500,

		"MAX_CATEGORIES": 5,

		"MAX_EXPLANATION_LENGTH": 1500,

		"MIN_TIMELIMIT": 60,

		"MAX_TIMELIMIT": 180,
	},

	"logger": {
		"development": {
			"console": {
				"colorize": true,
				"timestamp": true,
				"prettyPrint": true,
				"level": "debug"
			},
			"file": {
				"filename": './logs/qwiz-kid.log',
				"timestamp": true,
				"maxSize": 5242880,	// 5 MB
				"prettyPrint": true,
				"level": "debug"
			}
		},
		"production": {
			"file": {
				"filename": './logs/qwiz-kid.log',
				"timestamp": true,
				"maxSize": 5242880,	// 5 MB
				"prettyPrint": true,
				"level": "debug"
			}
		}
	},

	// database credentials.
	"database": {
		"db_name": "qwiz-kid",
		"host": "localhost",
		"port": 27017,
		"username": "",
		"password": "",

		"TRY_AGAIN_TIME": 1000		// wait for 1000ms before retrying to connect to the db.
	},
	"abuse_filter": {
		"ABUSE_DEFINITION": 150,	// number of requests allowed per minute. Above this, you're abusive.
		"EXPIRE_AFTER_SECONDS": 60,	// number of seconds for which mongodb stores the ip-records,
		"BLOCK_TIME": 900000,		// block a bad guy for 15 minutes. (15*60*1000ms)

		"db_name": "qwiz-kid-abuse-filter"
	}
};