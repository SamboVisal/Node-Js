const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('passport');
const exphbs = require('express-handlebars');
const empty = require('is-empty');

// Load User Models
require('./models/User');
require('./models/Story');
require('./models/UserBio');
require('./models/blog');
require('./models/image');
// Passport config
require('./config/passport')(passport);
// config db
const db = require('./config/database');

// Load Keys
const keys = require('./config/keys');

// Handlebar helper
const {
  truncate,
  stripTags,
  formatDate,
  select,
  editIcon
} = require('./helpers/hbs');

// Load Route
const index = require('./routes/index');
const auth = require('./routes/auth');
const stories = require('./routes/stories');
const users = require('./routes/users');
const blog = require('./routes/blog');

// Map global promises
mongoose.Promise = global.Promise;
// Mongoose Connect
mongoose.connect(keys.mongoURI, {
  useMongoClient:true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const app =express();

// Enable Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Method Override Middleware
app.use(methodOverride('_method'));


// Handlebars
app.engine('handlebars',exphbs({
  helpers: {
    truncate: truncate,
    stripTags: stripTags,
    formatDate: formatDate,
    select: select,
    editIcon:editIcon
  },
  defaultLayout: 'main'
}));
app.set('view engine','handlebars');

app.use(cookieParser());
app.use(session({
  secret: 'secret',
  resave : false,
  saveUninitialized : false
}));
//flash middleware
app.use(flash());
//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//declare folder 
app.use(express.static(path.join(__dirname,'public')));

// Set global var
app.use((req,res,next)=>{
  res.locals.add_msg = req.flash('add_msg');
  res.locals.delete_msg = req.flash('delete_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.error_name = req.flash('error_name');
  res.locals.user = req.user || null;
  next();
});

// Use Route. Everytime when we go to /auth then we will look auth route
app.use('/auth',auth);
// Everytime when you go to / then it it will be looking for the index route
app.use('/',index);
app.use('/stories',stories);
app.use('/users',users);
app.use('/blog',blog);
const port = process.env.PORT || 5000;
 
app.listen(port,()=>{
  console.log(`Server start on port ${port}`);
});