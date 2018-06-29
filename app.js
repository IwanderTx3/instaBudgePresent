// load all env variables from .env file into process.env object.
require("dotenv").config()
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mustacheExpress = require('mustache-express');
var session = require('express-session');
var morgan = require('morgan');
var User = require('./models/user');
var Expense = require('./models/budgets_expenses');
var Budget = require('./models/budgets_bycat');
var path = require('path');

let pgp = require('pg-promise')()
let connectionString = 'postgres://instabudget:digitalcrafts@instabudget.cuzupkl5r98f.us-east-2.rds.amazonaws.com:5432/InstaBudget'
let db = pgp(connectionString)


//let connectionString = 'postgres://localhost:5432/instabudget'

// invoke an instance of express application.
var app = express();

// set static path
app.use(express.static(path.join(__dirname, 'public')))

// set mustache views engine
app.engine('mustache', mustacheExpress());

// mustache pages will be inside the views folder
app.set('views', './views');
app.set('view engine', 'mustache');

// set our application port
app.set('port', 3000);

// set morgan to log info about our requests for development use.
app.use(morgan('dev'));

// initialize body-parser to parse incoming parameters requests to req.body
app.use(bodyParser.urlencoded({
    extended: true
}));

// initialize cookie-parser to allow us access the cookies stored in the browser. 
app.use(cookieParser());

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
    key: 'user_sid',
    secret: 'process.env.SECRET',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard');
    } else {
        next();
    }
};

// route for Home-Page
app.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});


// route for user signup
app.route('/signup')
    .get(sessionChecker, (req, res) => {
        res.render('signup');
    })
    .post((req, res) => {
        User.create({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password
            })
            .then(user => {
                req.session.user = user.dataValues;
                res.redirect('/dashboard');
            })
            .catch(error => {
                console.log(error)
                res.redirect('/signup');
            });
    });

// route for user Login
app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.render('login');
    })
    .post((req, res) => {
        var username = req.body.username,
            password = req.body.password;

        User.findOne({
            where: {
                username: username
            }
        }).then(function (user) {
            if (!user) {
                res.redirect('/login');
            } else if (!user.validPassword(password)) {
                res.redirect('/login');
            } else {
                req.session.user = user.dataValues;
                res.redirect('/dashboard');
            }
        });
    });


// route for user's dashboard
app.get('/dashboard', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.render('dashboard');
    } else {
        res.redirect('/login');
    }
});

// route to add quick expense
app.post('/add_quick_expense', (req, res) => {
    console.log(req.body)
    if (req.session.user && req.cookies.user_sid) {
        Expense.create({
                title: req.body.title,
                amount: req.body.amount,
                userid: req.session.user.id
            }).then(function () {
                res.redirect('/quickexpense');
            })
            .catch(error => {
                console.log(error)
                res.redirect('/signup');
            });
        // res.redirect('/quickexpense');
    } else {
        res.redirect('/quickexpense');
    }
});



// fectchQuickExpenses Function with callback as argument
function fetchQuickExpenses(usernum, callback) {

    Expense.findAll({ where: {
        userid: usernum,
        islogged: 'FALSE'
    }}).then(function (expenses) {

            callback(expenses);
        });
};

// fetchUserBudgetCategories
function fetchUserBudgetCategories(usernum, callback) {

    Budget.findAll({
        attributes: ['name', 'id'],
        where: {
        userid: usernum
    }}).then((budgetCategories)=>{
        callback(budgetCategories)
    })

}
// route for Quick expense page
app.get('/quickexpense', (req, res) => {

    let usernum = req.session.user.id
    if (req.session.user && req.cookies.user_sid) {

        fetchQuickExpenses(usernum, (expenses) => {

            fetchUserBudgetCategories(usernum, (budgetCategories) =>{
                console.log(budgetCategories[0].name)
                res.render('quickexpense', {
                    itemList: expenses,
                    budgetCategories: budgetCategories
                })
            })
        })
    } else {
        res.redirect('/login');
    }
});

// route to handle deleteQuickExpense request
app.post('/deleteQuickExpense/:id', (req, res) => {
    console.log("Delete expense request received")
    let expenseid = req.params.id

    if (req.session.user && req.cookies.user_sid) {

        Expense.destroy({
            where: {
                id: expenseid
            }
        }).then(function () {
            res.redirect('/quickexpense');
        })

    } else {
        res.redirect('/login');
    }
});

// route to Log Expense
app.post('/log_expense', (req, res) =>{
    let expenseid = req.body.expenseid
    console.log(req.body.expenseid)
    if (req.session.user && req.cookies.user_sid) {

        Expense.update({
            islogged: 'TRUE'},{
            where: {
                id: expenseid
            }
        }).then(function () {
            res.redirect('/quickexpense');
        })

    } else {
        res.redirect('/login');
    }
});




// route for Budget tracking page
app.get('/tracking', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {

        console.log(req.session.user.id)
        let usernum = req.session.user.id
        console.log(usernum)

        Expense.findAll({
            where: {
                userid: usernum
            }
        }).then((allItems) => {
            Expense.sum('amount', {
                where: {
                    userid: usernum
                }
            }).then((sum) => {
                Budget.sum('budget', {
                    where: {
                        userid: usernum
                    }
                }).then((full) => {
                    let percent = sum / full;
                    console.log(sum);
                    console.log(full);
                    console.log(percent);
                    res.render('tracking', {
                        sum: sum,
                        full: full,
                        percent: percent,
                        expenses: allItems
                    });
                })
            })
        })

 


    } else {
        res.redirect('/login');
    }
});

// route for user logout
app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});


// route for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
});


// start the express server
app.listen(app.get('port'), () => console.log(`App started on port ${app.get('port')}`));