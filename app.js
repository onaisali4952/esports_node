const dotenv = require('dotenv');
dotenv.config({ path: "./config.env" });
var app = require('express')();
var express = require('express');
var path = require('path');
var http = require('http').Server(app);

// import Router file
var pageRouter = require('./routes/routes');
var db = require("./controller/database");
var moment = require('moment');


var session = require('express-session');
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

var flash = require('connect-flash');
var i18n = require("i18n-express");
var urlencodeParser = bodyParser.urlencoded({ extended: true });
app.use(urlencodeParser);
app.use(session({ resave: false, saveUninitialized: true, secret: 'skedwise' }));
app.use(flash());

/* ---------for database connection---------- */


// for i18 usr
app.use(i18n({
    translationsPath: path.join(__dirname, 'i18n'), // <--- use here. Specify translations files path.
    siteLangs: ["en", "ru", "it", "gr", "sp"],
    textsVarName: 'translation'
}));
app.use(express.static(__dirname + '/public'));

app.use('/public', express.static('public'));
app.set('layout', 'layout/layout');
var expressLayouts = require('express-ejs-layouts');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

app.use(function(req, res, next) {
    res.locals.userimage = req.session.userimage;
    res.locals.username = req.session.username;
    res.locals.userrole = req.session.userrole;

    if (req.session.userrole == 'Administrator'){
        res.locals.adminmenulink = "/transactions";
        res.locals.adminmenuitem = "Transactions";
    }else{
        res.locals.adminmenulink ='#';
        res.locals.adminmenuitem ='none';
    }



    next();
  });

// Define All Route 
pageRouter(app);

app.all('*', function (req, res) {
    res.locals = { title: '404 Page Note found' };
    res.render('auth/error-404', { layout: "layout/layout-without-nav" });
});

http.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));