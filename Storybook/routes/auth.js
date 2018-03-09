const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const router = express.Router();
const passport = require('passport');

// Load Model User
require('../models/User');
const User = mongoose.model('users');

router.get('/google',passport.authenticate('google',{
  scope:['profile','email']
}));
router.get('/google/callback', 
passport.authenticate('google', { failureRedirect: '/' }),(req, res)=>{
  // Successful authentication, redirect home.
  res.redirect('/dashboard');
});

router.get('/verify',(req,res)=>{
  if(req.user){
    console.log(req.user);
  }else{
    console.log("not auth");
  }
});
router.get('/members',(req,res)=>{
  const head_title = "Create an Account";
  res.render('users/register',{
    head_title:head_title
  });
 
});
router.get('/login',(req,res)=>{
  res.render('users/login');
});
router.get('/logout',(req,res)=>{
  req.logout();
  res.redirect('/');
});
module.exports = router;