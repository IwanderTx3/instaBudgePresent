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
var status = ''


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
    let usernum = req.session.user.id
    if (req.session.user && req.cookies.user_sid) {

        fetchUserBudgetCategories(usernum, (budgetCategories) =>{
                
            res.render('dashboard', {
                budgetCategories: budgetCategories
            })
        })
    } else {
        res.redirect('/login');
    }
});

// route to add quick expense
app.post('/add_quick_expense', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        Expense.create({
                title: req.body.title,
                amount: req.body.amount,
                userid: req.session.user.id,
                islogged: 'FALSE'
            }).then(function () {
                res.redirect('/quickexpense');
            })
            .catch(error => {
                
                res.redirect('/quickexpense');
                
            });
        // res.redirect('/quickexpense');
    } else {
        res.redirect('/login');
        
    }
});

// route to add quick expense
app.post('/')

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

// route to Log Quick Expense
app.post('/log_quick_expense', (req, res) =>{
    let expenseid = req.body.expenseid
    let budgetCategory = req.body.budgetCategory
   
    if (req.session.user && req.cookies.user_sid) {
        
        Expense.update({
            islogged: 'TRUE',
            category: budgetCategory},{
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

// route to Log Expense from Dashboard
app.post('/log_expense', (req, res) =>{

   
    if (req.session.user && req.cookies.user_sid) {
        if(req.body.budgetName == ''){
        
        Expense.create({
            islogged: 'TRUE',
            category: req.body.budgetCategory,
            title: req.body.title,
            amount: req.body.amount,
            userid: req.session.user.id
        }).then(function () {
            res.redirect('/dashboard');
        })
        .catch(error => {
            res.redirect('/dashboard');
            
        });
    }
    else {
        Budget.create({
            name: req.body.budgetName,
            budget: req.body.budgetAmount,
            userid: req.session.user.id,
            
        }).then(name => {
            Expense.create({
                islogged: 'TRUE',
                category: name.dataValues.id,
                title: req.body.title,
                amount: req.body.amount,
                userid: req.session.user.id
            })
        })
            
            
        .then(function (){
            res.redirect('/dashboard');
        }).catch(error => {
            res.redirect('/dashboard');
        })

    }
} else {
    res.redirect('/login');
}      
});















// route to set budget
app.post('/set_budget', (req, res) => {

    if(req.session.user && req.cookies.user_sid){

        Budget.create({
            name: req.body.budgetName,
            budget: req.body.budgetAmount,
            userid: req.session.user.id
        }).then(function (){
            res.redirect('/dashboard');
        }).catch(error => {
            res.redirect('/dashboard');
        })
    } else {
        res.redirect('/login');
    }
})

// route for Budget tracking page
app.get('/tracking', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {

       let usernum = req.session.user.id
       // Trying to pass a mustache tag
       let header = 'budget'
       Expense.findAll({where:{userid : usernum} }).then((allItems) => 
       {Budget.findAll(
           {
               where: {userid : usernum},
               attributes: ['id', 'userid','name','budget','tally']
            }
        ).then((budgetsall) =>{
            budgetsall.push({name: 'Unassigned', id:'Unassigned', expenses:[]})
            var budgetsWithExpenses = []            
            for(var i =0;i<budgetsall.length;i++){
                var thebudget = budgetsall[i]
                thebudget["expenses"] = []
                thebudget['tally'] = 0
                thebudget['catper'] = 0
                thebudget['status'] = 'green'

            
                for(var j = 0 ; j < allItems.length;j++){
                    var theItem = allItems[j]
                    if (theItem.category != null){
                        
                        if (theItem.category === thebudget.id){
                            thebudget['expenses'].push(theItem)
                            thebudget['tally']=parseFloat(thebudget['tally'])+parseFloat(theItem.amount)
                            if (parseFloat(thebudget['tally']) > 0)
                            {
                                let m = ((parseFloat(thebudget['tally'])/parseFloat(thebudget.budget))*100)
                                catper = m.toFixed(2);
                                thebudget['catper']=catper
                                if (catper > 80 && catper < 99){
                                    thebudget['status'] = 'yellow'}
                                if (catper > 99){
                                    thebudget['status'] = 'red'
                                    }
                            }    
                        }
                    }
                    else{
                        if (thebudget.id == 'Unassigned' ){
 // Trying to pass a mustache tag
                            //header = ' '
                            thebudget['expenses'].push(theItem)
                            thebudget['tally']=parseFloat(thebudget['tally'])+parseFloat(theItem.amount)
                        }
                        }
                       
                } 
               
               

                budgetsWithExpenses.push(thebudget)
            }
            Expense.sum('amount',{where:{userid : usernum} }).then((sumA) =>{
                Budget.sum('budget',{where:{userid : usernum}}).then((full) =>{
                    let percent = 0
                    if ( sumA > 1 ){
                            let n = ((sumA/full)*100); 
                            percent = n.toFixed(2);
                            if (percent > 90 ){status = 'red'} 
                            else {status = 'yellow'}} 
                    else {
                            percent = 0;
                            sumA = 0;       
                        }
                        res.render('tracking',{ header:header, status: status, sum:sumA,full:full,percent:percent,expenses: allItems,categories: budgetsWithExpenses });
                    })      
                })
            })
        })
    } else {res.redirect('/login');}
});

app.post('/deleteExpense/:id', (req, res) => {
    let expenseid = req.params.id

    if (req.session.user && req.cookies.user_sid) {

        Expense.destroy({
            where: {
                id: expenseid
            }
        }).then(function () {
            res.redirect('/tracking');
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




