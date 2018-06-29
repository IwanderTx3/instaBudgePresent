var Sequelize = require('sequelize');
var User = require('./user');



const sequelize = new Sequelize('postgres://instabudget:digitalcrafts@instabudget.cuzupkl5r98f.us-east-2.rds.amazonaws.com:5432/InstaBudget');

//const sequelize = new Sequelize('postgres://localhost:5432/instabudget')


// setup Expense model and its fields
var Budget = sequelize.define('budgets', {
    name: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: false
    },
    budget: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
    },
    tally: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: true
    },
   
    // Timestamps
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
    userid:   {
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: false
    },

});
User.hasOne(Budget, { foreignKey: 'userid' })


// create all the defined tables in the specified database
sequelize.sync()
    .then(() => console.log('Budgets table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export Export model for use in other files
module.exports = Budget;
