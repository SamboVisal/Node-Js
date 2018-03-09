const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {ensureAuthenticated,ensureGuest} = require('../helpers/auth');
const Story = mongoose.model('stories');
const count = require("word-count");
const nodemailer = require("nodemailer");
router.get('/',(req,res)=>{
  const page_title = "Story Books";
  res.render('index/welcome',{
    page_title:page_title
  });
});
router.get('/dashboard',ensureAuthenticated,(req,res)=>{
  const page_title = "Home | StoryBooks";
  var noMatch = '';
  if(req.query.search){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Story.find({user:req.user.id , title:regex})
    .sort({date:'desc'})
    .then(stories=>{
      var story_found = stories.length;
      if(story_found<1){
        noMatch = "Your keyword " + `"${req.query.search}"` + " is no match. Please try again!";
      }
      
      res.render('index/dashboard',{
        stories:stories,
        page_title:page_title,
        noMatch:noMatch,
        story_found:story_found
      });
    });
  }else{
    Story.find({user:req.user.id})
    .sort({date:'desc'})
    .then(stories=>{
      res.render('index/dashboard',{
        stories:stories,
        page_title:page_title
      });
    });
  }
  
  
});

router.get('/about',(req,res)=>{
  const page_title = "About Us | StoryBooks";
  res.render('index/about',{
    page_title:page_title
  });
});
router.get('/contact',(req,res)=>{
  res.render('index/contact');
});

router.post('/contact',(req,res)=>{
  let error = [];
  let error_name = [];
  const name_input = req.body.name;
  const email_input = req.body.email;
  const body_input = req.body.bodys;
  var match = /^[a-zA-Z ]*$/;
  if(name_input.length <5){
    error_name.push({text:"Name should more than 5 characters"});
  }
  if(!match.test(name_input)){
   
    error_name.push({text:"Name contains alphabet only"});
  }
  if(!body_input){
    error.push({comment:"Your comment is required"});
  }
  console.log(count(body_input));
  if(count(req.body.bodys)<5){
    console.log("comment failed");
    error.push({comment:"Comments should 5 words at least"});
  }
  if(error.length > 0 || error_name.length>0){
    
    res.render('index/contact',{
      error:error,
      error_name:error_name
      
    });
  }else{
    const output = `
      <p>You have a new contact</p>
      <h3>Contact Details</h3>
      <ul>
        <li>Name: ${name_input}</li>
        <li>Email: ${email_input}</li>
      </ul>
      <h3>Message</h3>
      <p>${body_input}</p>
    `;
    let transporter = nodemailer.createTransport({
      host: 'mail.google.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
          user: 'pisal@gmail.com', // generated ethereal user
          pass: 'node123'  // generated ethereal password
      },
      tls:{
        rejectUnauthorized:false
      }
  });

  // setup email data with unicode symbols
  let mailOptions = {
      from: `"Nodemailer Contact" <${email_input}>`, // sender address
      to: 'pisal.sambo1997@gmail.com', // list of receivers
      subject: 'StoryBook Comment', // Subject line
      text: 'Hello world?', // plain text body
      html: output // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
      // Preview only available when sending through an Ethereal account
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      res.render('index/contact',{
        msg:'Email has been sent'
      });

      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  });
  }
});


router.get('/login',(req,res)=>{
  res.send('login');
});
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
module.exports = router;