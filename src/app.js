const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
var morgan = require("morgan");
const session = require("express-session");
var flash = require("connect-flash");
// const functions = require('firebase-functions');
// const config = functions.config()

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

// const fileUpload = require("express-fileupload");
var passport = require("passport");
const hbs = require("hbs");

var app = express();

require("./db/mongoose");
require("./config/passport")(passport); // pass passport for configuration

// set up our express application
// app.use(fileUpload());
app.use(morgan("dev")); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

// required for passport
app.use(session({ secret: "ilovescotchscotchyscotchscotch" })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

//Express path config
const viewPath = path.join(__dirname, "../Templates/views");
const publicDirectory = path.join(__dirname, "../Public");
const partialsDirectory = path.join(__dirname, "../Templates/partials");

//handlebars template engine location
app.set("view engine", "hbs");
app.set("views", viewPath);
hbs.registerPartials(partialsDirectory);

//setup static directory to serve
app.use(express.static(publicDirectory));

// routes ======================================================================
require("./routes/routes")(app, passport); // load our routes and pass in our app and fully configured passport

// exports.app = functions.https.onRequest(app);

// app.use("/", indexRouter);
// app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
