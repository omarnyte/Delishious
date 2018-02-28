const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('password-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        unique: true, 
        lowecase: true,
        trim: true, // removes leading spaces
        validate: [validator.isEmail, 'Invalid email address'],
        required: 'Please suppy an email address'
    },
    name: {
        type: String,
        required: 'Please supply a name',
        trime: true
    }
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
userSchema.plugin(mongodbErrorHandler); // nicer errors 

module.exports = mongoose.model('User', userSchema);

