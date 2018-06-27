var Sequelize = require('sequelize');
var bcrypt = require('bcryptjs');

// create a sequelize instance with our local postgres database information
// var sequelize = new Sequelize('budget_app_db://fduluc@localhost:5432/');

const sequelize = new Sequelize('postgres://instabudget:digitalcrafts@instabudget.cuzupkl5r98f.us-east-2.rds.amazonaws.com:5432/InstaBudget');

// setup User model and its fields
var User = sequelize.define('users', {
    username: {
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