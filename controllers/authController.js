const mongoose = require('mongoose');
const User = mongoose.model('User');
const passport = require('passport');
const crypto = require('crypto');

exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed login!',
    successRedirect: '/',
    successFlash: 'Successfully logged in!'
});

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You are now logged out');
    res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
    // checks with passport 
    if(req.isAuthenticated()) {
        next();
    } else {
        req.flash('error', 'You must be logged in');
        res.redirect('/login');
    }
}

exports.forgot = async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        req.flash('success', 'A password reset token has been sent to you if an account exists.');
        return res.redirect('/login');
    } else {
        user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordExpires = Date.now() + 3600000 // expires in an hour
        await user.save();
        const resetURL = `http://${req.headers.host}.account/reset/${user.resetPasswordToken}`;
        req.flash('success', `Your reset link is: ${resetURL}`);
        res.redirect('/login');
    }
}