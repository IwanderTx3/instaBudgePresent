var Sequelize = require('sequelize');
var User = require('./user');



// const sequelize = new Sequelize('postgres://instabudget:digitalcrafts@instabudget.cuzupkl5r98f.us-east-2.rds.amazonaws.com:5432/instabudget');

const sequelize = new Sequelize('postgres://localhost:5432/instabudget')


// setup Expense model and its fields
var Expense = sequelize.define('expenses', {
    title: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: false
    },
    amount: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
    },
   
    // Timestamps
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
});

User.hasOne(Expense, { foreignKey: 'userid' })
// MainDashboard.belongsTo(MainClient, { foreignKey: 'clientId' })


// create all the defined tables in the specified database
sequelize.sync()
    .then(() => console.log('Expenses table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export Export model for use in other files
module.exports = Expense;
