const mongoose = require('mongoose');
const User = mongoose.model('User');
const passport = require('passport');
const crypto = require('crypto');
const promisify = require('es6-promisify');

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
        const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
        req.flash('success', `Your reset link is: ${resetURL}`);
        res.redirect('/login');
    }
}

exports.reset = async (req, res) => {
    const user = await User.findOne({ 
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired');
        res.redirect('/login');
    } else {
        res.render('reset', { title: 'Reset Your Password' })
    }
}

exports.confirmedPasswords = (req, res, next) => {
    if (req.body.password === req.body['password-confirm']) {
        next();
        return;
    } else {
        req.flash('error', 'Your passwords did not match');
        res.redirect('back');
    }
}

exports.update = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired');
        res.redirect('/login');
    } else {
        const setPassword = promisify(user.setPassword, user);
        await setPassword(req.body.password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        const updatedUser = await user.save();
        await req.login(updatedUser);
        req.flash('success', 'Your password has been reset!');
        res.redirect('/');
    }
}