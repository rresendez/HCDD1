// app/routes.js
module.exports = function(app, passport) {

// This get the sql library

var mysql = require('mysql');
//database configuration set up for local connection
var dbconfig = require('../config/database_2');
// routes


//Create conection with current db configuration
var con = mysql.createPool(dbconfig.connection);
// Make sure to use the correct database
con.query('USE '+ dbconfig.database);
//New crazy routes yo

// Get time
app.get('/time', function(req,res){
	res.render('img.ejs');
});

// Post time
app.post('/time', function(req,res){
	message = '';
	if(req.method == "POST"){
		 var post  = req.body;
		 var name= post.user_name;
		 var pass= post.password;
		 var fname= post.first_name;
		 var lname= post.last_name;
		 var mob= post.mob_no;

	 if (!req.files)
			 return res.status(400).send('No files were uploaded.');

	 var file = req.files.uploaded_image;
	 var img_name=file.name;

			if(file.mimetype == "image/jpeg" ||file.mimetype == "image/png"||file.mimetype == "image/gif" ){

						 file.mv('./public/images/upload_images/'+file.name, function(err) {

							 if (err)

								 return res.status(500).send(err);
							 var sql = "INSERT INTO `users_image`(`first_name`,`last_name`,`mob_no`,`user_name`, `password` ,`image`) VALUES ('" + fname + "','" + lname + "','" + mob + "','" + name + "','" + pass + "','" + img_name + "')";

							 var query = con.query(sql, function(err, result) {
								 if(err) console.log(err);
								 console.log(result);
									res.redirect('profile/'+result.insertId);
							 });
						});
				 } else {
					 message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
					 res.render('img.ejs',{message: message});
				 }
	}

});

// route to display profile
	app.get('/profile/:id', function(req,res){
		var message = '';
		var id = req.params.id;
	 var sql="SELECT * FROM `users_image` WHERE `id`='"+id+"'";
	 con.query(sql, function(err, result){
	if(result.length <= 0)
	message = "Profile not found!";

		 res.render('profile2.ejs',{data:result, message: message});
	});

	})

// Temporary route for project screen

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/timesheet',  function(req, res) {
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

	app.post('/timesheet',  function(req, res){
		//DB connection
		var con = mysql.createConnection(dbconfig.connection);
		// Make sure to use the correct database
		con.query('USE '+ dbconfig.database);
		//Get posted information
		console.log(req.body.user);
		//Bunch of informaiton on the project
		console.log("Project Id: "+req.body.pid);
		console.log("Type of Project Id: "+ typeof(req.body.pid));
		//Check for input of user but no project id
		if(typeof req.body.pid =="undefined"){
			req.body.pid="";
		}
		if((typeof req.body.user != "undefined" ) && req.body.pid.length<1 && typeof req.body.ID =="undefined" ){
	// Divides name and user number in a 3 index array
		var name = req.body.user.split(" ");
	// Set time range for one month
		var dateB = req.body.date+"-01";
		var dateE = req.body.date+"-31";
		// Get date of the week
		var weekNum = req.body.week;
		console.log("Week number: "+weekNum);
		//Get ID from user name

		getProject(con,name[2],dateB,dateE,function(err,result){
			if(err) console.log(err);
			else{
				console.log(result);
				console.log("Project number: "+ req.body.pid);
		// We still need the names to pass to the land.ejs page to display drop down menu
				getNames(con,function(err1,resu){
					if(err1) console.log(err1);
					else{
						getPInfo(con,function(err2,proj){
						//render land ejs passing result of query user name and bunch of other things!
						if(err2)console.log(err2);
						else{
						res.render('land.ejs',{ result : resu, query : result, user: name, dateF: req.body.date, weekN: weekNum, projI: proj, weekF: req.body.week });
						con.end(); console.log("end");

						}})
					}
				});
			}
		})
		//If process Id is defined then make search using process id
	} else if(typeof req.body.pid != "undefined"  && typeof req.body.ID =="undefined"){
		// Divides name and user number in a 3 index array
			var name = req.body.user.split(" ");

		// Set time range for one month
			var dateB = req.body.date+"-01";
			var dateE = req.body.date+"-31";
			//Get ID from user name
			//Same funaction as get project but this one uses also project id to find projects
			getProjectID(con,name[2],dateB,dateE,req.body.pid,function(err,result){
				if(err) console.log(err);
				else{
					console.log(result);
					console.log("Project number: "+ req.body.pid);
			// We still need the names to pass to the land.ejs page to display drop down menu
					getNames(con,function(err,resu){
						if(err) console.log(err);
						else{
							getPInfo(con,function(err2,proj){
								if(err2) { console.log(err2);}
							//render land ejs passing result of query user name and bunch of other things!
							res.render('land.ejs',{ result : resu, query : result, user: name, weekN: req.body.week, projI:proj, dateF: req.body.date, pidF: req.body.pid, weekF: req.body.week});
							con.end(); console.log("end");

						})
						}
					});
				}
			})


	}
//This checks for new entrie creation if we have an user id deffined
//This check for the creation of a new entry
	else if (typeof req.body.ID !="undefined") {
		//Date magic
		const time = new Date("October 13, 2017 00:00:00");



		console.log("Crated artificial time: "+time.toTimeString());
		var timeO=new Date("October 13, 2017 00:00:00");

		 timeO = timeO.addHours(req.body.time);
		console.log("Crated artificial added time: "+timeO.toTimeString());

		//This is going to split the name last name and id into an array


			var id = req.body.ID.split(",");
		console.log("We got the Id "+ id[2]);
		//This function inserts a new entry to the database

		var project = req.body.project.split(" ");
		console.log("Project input: "+ project[0]);
		insertNew(con,id[2],req.body.date,project[0],req.body.description,time,timeO,function(err,result){
			if(err) {
				console.log(err);
				//Still need to get names to reload landing page with names
				getNames(con,function(err,resu){
					if(err) console.log(err);
					else{
						//console.log(resu[0]);
						res.render('land2.ejs',{ result : resu, status : false});
						con.end(); console.log("end");

					}
				});


			}
			//Default status where nothing was input just load land2.ejs with names
			else{
				console.log("body user: "+req.body.user);

				if((typeof req.body.user != "undefined" ) && req.body.pid.length<1  ){
			// Divides name and user number in a 3 index array
				var name = req.body.user.split(",");
				console.log("Body user index 2: "+ name[2]);
			// Set time range for one month
			var date2 = req.body.date;
			req.body.date=req.body.date.slice(0,7);
			console.log("Body date: "+req.body.date);
				var dateB = req.body.date+"-01";
				var dateE = req.body.date+"-31";
				// Get date of the week
				var weekNum = req.body.week;
				console.log("Week number: "+weekNum);
				//Get ID from user name

				getProject(con,name[2],dateB,dateE,function(err,result){
					if(err) console.log(err);
					else{
						console.log(result);
						console.log("Project number: "+ req.body.pid);
				// We still need the names to pass to the land.ejs page to display drop down menu
						getNames(con,function(err1,resu){
							if(err1) console.log(err1);
							else{
								getPInfo(con,function(err2,proj){
								//render land ejs passing result of query user name and bunch of other things!
								if(err2)console.log(err2);
								else{
								res.render('land.ejs',{ result : resu, query : result, user: name, dateF: req.body.datePer, weekN: weekNum, projI: proj, weekF: req.body.week,date2F: date2 });
								con.end(); console.log("end");

								}})
							}
						});
					}
				})
				//If process Id is defined then make search using process id
			}else if(typeof req.body.pid != "undefined" || req.body.pid.length>1){
				console.log("Project id defined");
				// Divides name and user number in a 3 index array
					var name = req.body.user.split(",");

				// Set time range for one month
					var date2 = req.body.date;
				  req.body.date=req.body.date.slice(0,7);
					var dateB = req.body.date+"-01";
					var dateE = req.body.date+"-31";
					//Get ID from user name
					//Same funaction as get project but this one uses also project id to find projects
					getProjectID(con,name[2],dateB,dateE,req.body.pid,function(err,result){
						if(err) console.log(err);
						else{
							console.log(result);
							console.log("Project number: "+ req.body.pid);
					// We still need the names to pass to the land.ejs page to display drop down menu
							getNames(con,function(err,resu){
								if(err) console.log(err);
								else{
									getPInfo(con,function(err2,proj){
										if(err2) { console.log(err2);}
									//render land ejs passing result of query user name and bunch of other things!
									res.render('land.ejs',{ result : resu, query : result, user: name, weekN: req.body.week, projI:proj, dateF: req.body.date, pidF: req.body.pid, weekF: req.body.week,date2F: date2});
									con.end(); console.log("end");
								})
								}
							});
						}
					})


			}
			}

		})

	}


	else{
		res.render('land.ejs');
		con.end(); console.log("end");

	}
	//Close connection
// Handle Disconnect


	});
//We don really ue this route
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
            successRedirect : '/timesheet', // redirect to the secure profile section
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
        res.redirect('/timesheet');
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
		successRedirect : '/timesheet', // redirect to the secure profile section
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
		res.redirect('/timesheet');
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

//functio to get infomration about projects

function getPInfo(con,callback){
	con.query("SELECT * from hcdd1prj ORDER BY ProjOfficial",function (err,res){
		if(err) callback(err,null);
		else{
			callback(null,res);
		}

	})
}

//funciton get project with project number
function getProjectID(con,id,dateB,dateE,pid,callback){
	con.query("SELECT * , TIMESTAMPDIFF(MINUTE,TimeIn,TimeOut) AS 'Total' from hcdd1swt WHERE TimeDate BETWEEN ? AND ? AND User_ID=? AND Proj_ID=? ",[dateB,dateE,id,pid],function(err,res){
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
	res.redirect('/signup');
}
// Function handleDisconnect

function handleDisconnect(db_config) {
	var mysql = require('mysql');
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      console.log (err);                                  // server variable configures this)
    }
  });
}

// number of hours per day calculator

Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}
