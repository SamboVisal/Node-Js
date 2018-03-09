const express = require('express');
//start to establish handlebars
const exphbs  = require('express-handlebars');
const flash = require('connect-flash');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const app = express();

//Load Routes 
const ideas = require('./routes/ideas');
const users = require('./routes/users');

require('./models/User');
const User = mongoose.model('users');

//db config
const db = require('./config/database');

// Passport Configuration
require('./config/passport')(passport);

mongoose.Promise = global.Promise;
//connect to mongo
mongoose.connect(db.mongoURI,{
  useMongoClient:true 
})
.then(()=>console.log("database connected"))
.catch(err=>console.log(err));


//handle the global variable
app.locals.name_author="Sambo Visal";
//module that we use contain its own middleware
//Handler Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//Method override MiddleWare
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname,'public')));

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//Global Variable
app.use(function(req,res,next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});
app.use((req,res,next)=>{
    res.locals.author = "sambo visal";
    next();
});
//Index Route
app.get('/',(req,res)=>{
  const title = "Share Your Idea";
  const page_title = 'Home';
  const page_active = 'active';
  res.render('index',{
    title : title,
    page_title:page_title,
    page_active:page_active
  });
});
//About
app.get('/about',(req,res)=>{
  const page_title = 'About';
  const page_active = 'active';
  res.render('about',{
    page_title:page_title,
    page_active:page_active
  });
});
app.get('/all',(req,res)=>{
    User.find({})
    .then(user=>{
        console.log(user);
        res.redirect('/');
    });
    
});
app.use('/ideas',ideas);
app.use('/users',users);
const port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log(`Server started on port ${port}`);
});