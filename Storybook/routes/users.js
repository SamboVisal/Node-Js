const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureGuest } = require('../helpers/auth');
const mongoose = require('mongoose');
const empty = require('is-empty');

// database
const Story = mongoose.model('stories');
const User = mongoose.model('users');
const UserBio = mongoose.model('userbio');

router.get('/profile/:userId',(req,res)=>{
  var page_title = "";
  User.findOne({_id:req.params.userId})
  
    .then(userInfo=>{
      page_title = userInfo.firstName + "'s Profile | StoryBooks";
      var priority = null;
      if(req.user){
        if(req.user.id == req.params.userId){
          priority = "yes";
        }
      }
      
      
      Story.find({user:req.params.userId})
        .then(userSto=>{
          UserBio.findOne({user:req.params.userId})
            .then(foundBio =>{ 
             
              if(req.user){

                if(req.user.id == req.params.userId){
                  User.findOne({_id:req.params.userId})
                  .then(userInfo =>{
                
                    res.render('users/profile',{
                      userInfo:userInfo,
                      userSto:userSto,
                      priority:priority,
                      foundBio:foundBio,
                      page_title:page_title
                    });
                  });
                  
                }else{
                  User.findOne({_id:req.params.userId})
                  .then(userInfo =>{
                    res.render('users/profile',{
                      userInfo:userInfo,
                      userSto:userSto,
                      priority:priority,
                      foundBio:foundBio,
                      page_title:page_title
                    });
                  });
                }
              }else{
                User.findOne({_id:req.params.userId})
                  .then(userInfo =>{
                    res.render('users/profile',{
                      userInfo:userInfo,
                      userSto:userSto,
                      priority:priority,
                      foundBio:foundBio,
                      page_title:page_title
                    });
                  });
              }
              
              
            });
          
        });
      
    });
});
router.get('/edit/:userId',ensureAuthenticated,(req,res)=>{
  User.findOne({_id:req.params.userId})
    .then((user)=>{
      UserBio.findOne({user:req.params.userId})
      .then(foundBio =>{
        if(req.user.id == req.params.userId){
          res.render("users/edit",{
            user:user,
            foundBio:foundBio
          });
        }else{
          res.redirect('/');
        }
        
      })
      
    });
});
router.put('/:userId',ensureAuthenticated,(req,res,next)=>{
  UserBio.findOne({user:req.params.userId})
    .then(userBio =>{
      userBio.education = req.body.education;
      userBio.live = req.body.live;
      userBio.from = req.body.country;
     
      
      if(Object.keys(req.body.userdesc).length === 0){
        res.send("description should be not empty");
      }else{
        userBio.description = req.body.userdesc;
      }
     
      userBio.save()
      .then(doneEdit =>{
        res.redirect(`/users/profile/${userBio.user}`);
      });
    });
});


router.get('/add/:userId',ensureAuthenticated, (req,res)=>{
  User.findOne({_id:req.params.userId})
    .then(user =>{
      if(req.user.id == req.params.userId){
        res.render("users/add");
      }else{
        res.redirect('/');
      }
    });
});

router.post('/profile/:uId',(req,res,next)=>{

  const newBio = {
    from: req.body.country,
    live: req.body.live,
    education: req.body.education,
    description: req.body.userdesc,
    user: req.user.id
  }

  new UserBio(newBio)
    .save()
    .then(userbio =>{
      User.findOne({_id:req.params.uId})
      .then(foundUser =>{
        res.redirect(`/users/profile/${foundUser.id}`);
      });
     
    });

});
module.exports = router;