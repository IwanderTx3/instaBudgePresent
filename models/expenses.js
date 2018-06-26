var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');

const sequelize = new Sequelize('postgres://instabudget:digitalcrafts@instabudget.cuzupkl5r98f.us-east-2.rds.amazonaws.com:5432/instabudget');

// setup User model and its fields
var Expense = sequelize.define('expenses', {
    userid: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
});
User.beforeCreate((user, options) => {

    return bcrypt.hash(user.password, 10)
        .then(hash => {
            user.password = hash;
        })
        .catch(err => { 
            throw new Error(); 
        });
});


User.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password,this.password)  
  }


// create all the defined tables in the specified database
sequelize.sync()
    .then(() => console.log('users table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export User model for use in other files
module.exports = User;