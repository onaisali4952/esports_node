const express = require('express');
const route = express.Router();

// Contorller
const AuthController = require("../controller/AuthController");
const PlayersController = require("../controller/PlayersController");
const MatchesController = require("../controller/MatchesController");
const TransactionController = require("../controller/TransactionController");

module.exports = function (route) {

    route.use((req, res, next) => {
        var uid = req.session.userid;
        const allowUrls = [ "/login", "/auth-validate", "/register", "/signup", "/forgotpassword", "/sendforgotpasswordlink", "/resetpassword", "/error", "/changepassword"];
        
        if(allowUrls.indexOf(req.path) !== -1){
            if (uid != null && uid != undefined) {
                return res.redirect('/index');
            }
        }  else if (!uid) {
            return res.redirect('/login');
        }
        next();
    })
    
    //Pages
    route.get("/", function (req, res) {
        res.render("index");
    });

    route.get("/home", function (req, res) {
        // res.render("home");
        res.render('home', { layout: "layout/layout-without-nav" });
    });

    route.get("/index", function (req, res) {
        res.render("index");
    });


    route.get('/player_list', PlayersController.activePlayers, (req, res, next) => {});

    route.get('/teams_list', PlayersController.teams_list, (req, res, next) => {});
     
    route.get('/matches', (req, res, next) => {
        res.render('matches/matches_list', { title: 'Matches' });
    })

    route.get('/match-create', (req, res, next) => {
        res.render('matches/match_create', { title: 'Add Match' });
    })
   
    route.post('/add_match', MatchesController.add_match, (req, res, next) => {});

    route.get('/matches_list', MatchesController.matchesList, (req, res, next) => {});

    route.post('/player_match_stat', MatchesController.playerMatchStat, (req, res, next) => {});

    route.get('/matches_schedule/:start/:end', MatchesController.matchesScheduler, (req, res, next) => {});

    route.get('/transactions', (req, res, next) => {
        res.render('transactions/transactions', { title: 'Transactions' });
    })

    route.get('/transaction_list', TransactionController.transactionList, (req, res, next) => {});

    route.get('/salary-create', (req, res, next) => {
        res.render('transactions/salary_create', { title: 'Add Salary Transaction' });
    })
    route.get('/revenue-create', (req, res, next) => {
        res.render('transactions/revenue_create', { title: 'Add Revenue Transaction' });
    })
    route.get('/expense-create', (req, res, next) => {
        res.render('transactions/expense_create', { title: 'Add Expense Transaction' });
    })

    route.get('/accountheads_list', TransactionController.accountheads_list, (req, res, next) => {});
    route.get('/sponsors_list', TransactionController.sponsors_list, (req, res, next) => {});
    route.get('/employees_list', TransactionController.employees_list, (req, res, next) => {});
    

    route.post('/add_salary', TransactionController.add_salary, (req, res, next) => {});
    route.post('/add_revenue', TransactionController.add_revenue, (req, res, next) => {});

    // Auth
    route.get('/login', (req, res, next) => {
        res.render('auth/login', { title: 'Login', layout: 'layout/layout-without-nav', 'message': req.flash('message'), error: req.flash('error') })
    });

    // validate login form
    route.post("/auth-validate", AuthController.validate);

    // logout
    route.get("/logout", AuthController.logout);

    route.get('/register', (req, res, next) => {
        res.render('auth/register', { title: 'Register', layout: 'layout/layout-without-nav', message: req.flash('message'), error: req.flash('error') })
    })

    // validate register form
    route.post("/signup", AuthController.signup)


    route.get('/forgotpassword', (req, res, next) => {
        res.render('auth/forgotpassword', { title: 'Forgot password', layout: 'layout/layout-without-nav', message: req.flash('message'), error: req.flash('error') })
    })

    // send forgot password link on user email
    route.post("/sendforgotpasswordlink", AuthController.forgotpassword)

    // reset password
    route.get("/resetpassword", AuthController.resetpswdview);
    // Change password
    route.post("/changepassword", AuthController.changepassword);

    //500
    route.get('/error', (req, res, next) => {
        res.render('auth/auth-500', { title: '500 Error', layout: 'layout/layout-without-nav' });
    })

   
}