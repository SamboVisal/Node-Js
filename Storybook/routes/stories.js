const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureGuest } = require('../helpers/auth');
const mongoose = require('mongoose');


//variable for database
const Story = mongoose.model('stories');
const User = mongoose.model('users');
// Stories Index
router.get('/', (req, res) => {
  const page_title = "Public Story | StoryBooks";
  const title_head = "List of Stories";
  var noMatch = '';
  if(req.query.search){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Story.find({title:regex})
    .populate('user')
    .sort({date:'desc'})
    .then(stories=>{
      var story_found = stories.length;
      if(story_found < 1){
        noMatch = "Your keyword " + `"${req.query.search}"` + " is no match. Please try again!";
        
      } 
      res.render('index/user',{
        stories: stories,
        page_title: page_title,
        title_head: title_head,
        noMatch:noMatch,
        story_found:story_found
      });
    });
  } else{
    Story.find({
      status: 'public'
    })
      .populate('user')
      .sort({ date: 'desc' })
      .then(stories => {
        res.render('index/user', {
          stories: stories,
          page_title: page_title,
          title_head: title_head
        });
  
      });
  }
  

});
// add stories form
router.get('/add', ensureAuthenticated, (req, res) => {
  const page_title = "Add Story | StoryBooks";
  res.render('stories/add', {
    page_title: page_title
  });
});

// Edit story form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  const page_title = "Edit Story | StoryBooks";
  Story.findOne({
    _id: req.params.id
  })
    .then(story => {
      if (story.user != req.user.id) {
        res.redirect('/stories');
      } else {
        res.render('stories/edit', {
          story: story,
          page_title: page_title
        });
      }

    });
  console.log(req.params.id);
});

// Show single story
router.get('/show/:id', (req, res) => {

  Story.findOne({
    _id: req.params.id
  })
    .populate('user')
    .populate('comments.commentUser')
    .then(story => {
      var user_name = new Buffer(story.user.firstName);
      var name_user = new Buffer("'s Story | StoryBooks");
      user_name = Buffer.concat([user_name, name_user]);
      const page_title = user_name;
      if (story.status == 'public') {
        res.render('stories/show', {
          story: story,
          page_title: page_title
        });
      } else {
        if (req.user) {
          if (req.user.id == story.user._id) {
            res.render('stories/show', {
              story: story,
              page_title: page_title
            });
          } else {
            res.redirect('/stories');
          }
        } else {
          res.redirect('/stories');
        }

      }

    });
});
// List story from a user as public

router.get('/user/:userId', (req, res) => {
  const page_title = "Public Stories | Story Books";
  const public_story = "Public Stories";
  var title_head = "Public Stories";
  var noMatch = '';
  if(req.query.search){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Story.find({ user: req.params.userId, status: 'public',title:regex })
    .populate('user')
    .sort({ date: 'desc' })
    .then(stories => {
      var story_found = stories.length;
      if(story_found<1){
        noMatch =  "Your keyword " + `"${req.query.search}"` + " is no match. Please try again!";
      }
      User.findOne({ _id: req.params.userId })
        .then(story => {
          var u_name = new Buffer(story.firstName);
          var u_name2 = new Buffer("'s");
          u_name = Buffer.concat([u_name, u_name2]);
          const id = story.id;
          res.render('stories/userstory', {
            stories: stories,
            page_title: page_title,
            public: public_story,
            title_head: title_head,
            u_name: u_name,
            id:id,
            noMatch:noMatch,
            story_found:story_found
          });
        });

    });
    
  }else{
    Story.find({ user: req.params.userId, status: 'public', })
    .populate('user')
    .sort({ date: 'desc' })
    .then(stories => {
      User.findOne({ _id: req.params.userId })
        .then(story => {
          var u_name = new Buffer(story.firstName);
          var u_name2 = new Buffer("'s");
          u_name = Buffer.concat([u_name, u_name2]);
          const id = story.id;
          res.render('stories/userstory', {
            stories: stories,
            page_title: page_title,
            public: public_story,
            title_head: title_head,
            u_name: u_name,
            id:id
          });
        });

    });
  }
   
});
// Process add story
router.post('/', (req, res, next) => {
  let allowComments;
  let error_msg=[];
  if (req.body.allowComments) {
    allowComments = true;
  } else {
    allowComments = false;
  }
  if(!req.body.title){
   
    error_msg.push({text:"Title Cannot Empty"});
  }
  if(!req.body.body){
    error_msg.push({text:"Content Cannot Empty"});
  }
  if(error_msg.length >0){
    res.render('stories/add', {
      error_msg:error_msg
    });
  }
  else{
    const newStory = {
      title: req.body.title,
      body: req.body.body,
      status: req.body.status,
      allowComments: allowComments,
      user: req.user.id
    }
    //create our story
    new Story(newStory)
      .save()
      .then(story => {
        req.flash('add_msg', 'Story has been added');
        res.redirect(`/stories/show/${story.id}`);
      });
  }
  

});

// Edit Form Process

router.put('/:id', ensureAuthenticated, (req, res) => {
  Story.findOne({
    _id: req.params.id

  })
    .then(story => {
      let allowComments;
      if (req.body.allowComments) {
        allowComments = true;
      } else {
        allowComments = false;
      }

      //New Value
      story.title = req.body.title;
      story.body = req.body.body;
      story.status = req.body.status;
      story.allowComments = allowComments;
      story.save()
        .then(story => {
          res.redirect(`/stories/show/${story.id}`);
        });
    });
});

// Delete story form
router.delete('/:id', ensureAuthenticated, (req, res) => {

  Story.remove({ _id: req.params.id })
    .then(() => {
      req.flash('delete_msg', 'Story has been deleted successfully');
      res.redirect('/dashboard');
    });
});

// Add comment
router.post('/comment/:id', (req, res) => {
  Story.findOne({ _id: req.params.id })
    .then(story => {
      const newComment = {
        commentBody: req.body.commentBody,
        commentUser: req.user.id
      }
      // Push to comment array
      //unshit will add to the beginning and push add to the last
      story.comments.unshift(newComment);

      story.save()
        .then(story => {

          res.redirect(`/stories/show/${story.id}`);
        });
    });
});
// Logged in users stories
router.get('/my', ensureAuthenticated, (req, res) => {
  const page_title = "Your Stories | Story Books";
  const title_head = "Stories";
  const no_story = "has no story here.";

  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    const u_name = "Your";
    var noMatch = '';
    Story.find({ user: req.user._id, title: regex })
      .populate('user')
      .then(stories => {
        if (stories.length < 1) {
          noMatch = "Your keyword " + `"${req.query.search}"` + " is no match. Please try again!";
        }
        res.render('stories/index', {
          stories: stories,
          page_title: page_title,
          u_name: u_name,
          title_head: title_head,
          noMatch: noMatch,
          no_story: ''
        });
      });

  } else {
    Story.find({ user: req.user.id })
      .populate('user')
      .sort({ date: 'desc' })
      .then(stories => {
        const u_name = "Your";
        res.render('stories/index', {
          stories: stories,
          page_title: page_title,
          u_name: u_name,
          title_head: title_head
        });
      });
  }

});
router.get('/search', (req, res) => {


});
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
module.exports = router;