// app/routes.js
module.exports = function(app, passport) {

// This get the sql library

var mysql = require('mysql');
//database configuration set up for local connection
var dbconfig = require('../config/database_2');


//Create conection with current db configuration
var con = mysql.createConnection(dbconfig.connection);
// Make sure to use the correct database
con.query('USE '+ dbconfig.database);
	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
//Get names funciton gets users from users table and passes it to the ejs form
		getNames(con,function(err,resu){
			if(err) console.log(err);
			else{
				//render land.ejs and pass result from query
				res.render('land.ejs',{ result : resu});
			}
		});

		 // load the index.ejs file
	});
	// Home page post section

	app.post('/', function(req, res){
		//Get posted information
		console.log(req.body.user);
		//Check for input to search projects
		if(typeof req.body.user != "undefined"){
	// Divides name and user number in a 3 index array
		var name = req.body.user.split(" ");
	// Set time range for one month
		var dateB = req.body.date+"-01";
		var dateE = req.body.date+"-31";
		//Get ID from user name
		getProject(con,name[2],dateB,dateE,function(err,result){
			if(err) console.log(err);
			else{
				console.log(result);
		// We still need the names to pass to the land.ejs page to display drop down menu
				getNames(con,function(err,resu){
					if(err) console.log(err);
					else{
						//render land ejs passing result of query user name and bunch of other things!
						res.render('land.ejs',{ result : resu, query : result, user: name });
					}
				});
			}
		})
	}
//This checks for new entrie creation if we have an user id deffined
	else if (typeof req.body.ID !="undefined") {
		//This is oging to split hte name last name and id into an array
			var id = req.body.ID.split(",");
		console.log("We got the Id "+ id[2]);
		insertNew(con,id[2],req.body.date,req.body.project,req.body.description,req.body.timeI,req.body.timeO,function(err,result){
			if(err) {
				console.log(err);
				getNames(con,function(err,resu){
					if(err) console.log(err);
					else{
						//console.log(resu[0]);
						res.render('land2.ejs',{ result : resu, status : false});
					}
				});


			}

			else{
				console.log(result);
				getNames(con,function(err,resu){
					if(err) console.log(err);
					else{
						//console.log(resu[0]);
						res.render('land2.ejs',{ result : resu, status : true});
					}
				});
			}

		})

	}


	else{
		res.render('land.ejs');
	}



	});

	app.get('/index', function(req, res) {
		res.render('index.ejs'); // load the index.ejs file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};
// Funciton get name
function getNames(con,callback){
	con.query("SELECT * from hcdd1user ",function (err,res){
		if(err) callback(err,null);
		else{
			callback(null,res);
		}

	})
}

//function to get prject info and calculate time

function getProject(con,id,dateB,dateE,callback){
	con.query("SELECT * , TIMESTAMPDIFF(MINUTE,TimeIn,TimeOut) AS 'Total' from hcdd1swt WHERE TimeDate BETWEEN ? AND ? AND User_ID=?  ",[dateB,dateE,id],function(err,res){
		if(err) callback(err,null);
		else{
			callback(null,res);
		}
	})
}

function insertNew(con,id,date,project,description,timeI,timeO,callback){
	var dialog = require('dialog');
	con.query("INSERT INTO hcdd1swt(User_ID,TimeDate,Proj_ID,PDesc,TimeIn,TimeOut) VALUES(?,?,?,?,?,?) ",[id,date,project,description,timeI,timeO],function(err,res){
		if(err) callback(err,null);
		else{
			dialog.info('New Entry Created!');
			callback(null,res);
		}
	})
}
// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
