const express = require('express');
const hbs = require('express-handlebars');
const fs = require('fs');
const mongoose = require('mongoose');

const app = express();
const db = require('./config/database');

//router
const upload = require('./routers/upload');

//init mongoose
mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURI,{
 
})
.then(()=>console.log('Mongoose Connnected'))
.catch(err=>console.log(err));

app.engine('handlebars', hbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use('/',upload);

const port = process.env.PORT || 3000;


app.listen(port,()=>{
  console.log(`server started on ${port}`);
});