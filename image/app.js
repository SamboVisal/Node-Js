const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');

const key = require('./config/database');


require('./models/images');
const image = mongoose.model('image');


const app = express();

//mongodb://pisal:pisal@ds233238.mlab.com:33238/image-upload
//Init mongoose
mongoose.connect(key.mongoURL)
.then(()=>console.log('Database connected'))
.catch(err=>console.log(err));

//Set storage engine
const storage = multer.diskStorage({
  destination: './public/upload/',
  filename: function(req, file, cb){
    cb(null,file.fieldname+ '-' + Date.now() + path.extname(file.originalname));
  }

});
const upload = multer({
  storage: storage,
  limits:{fileSize:10000000},
  fileFilter: function(req,file,cb){
    checkFileType(file,cb);
  }
}).single('myImage');

//check file type
function checkFileType(file,cb){
  //Allow ext
  const filetypes = /jpeg|jpg|png|gif/;
  //check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  //check mime
  const mimetype = filetypes.test(file.mimetype);
  if(mimetype && extname){
    return cb(null,true);
  }else{
    cb('Error: Images only');
  }
}

//EJS
app.set('view engine','ejs');
//public folder
app.use(express.static('./public'));

app.get('/',(req,res)=>{
  res.render('index');
});

app.post('/upload',(req,res)=>{
  upload(req,res, (err)=>{
    if(err){
      res.render('index',{
        msg:err
      });
    }else{
      if(req.file == undefined){
        res.render('index',{
          msg: 'Error: No File Selected'
        });
      }

      else{
        const path = `public/upload/${req.file.filename}`;
        const newImage = {
          data : fs.readFileSync(path),
          contentType : req.file.mimetype
        }
        new image(newImage)
        .save()
        .then(images=>{
          console.log(images);
         const link = `/photo/${images._id}`;
          res.render('index',{
            msg: 'File uploaded',
            file:`upload/${req.file.filename}`,
            link:link
          });
        })
        
      }
    }
  });
});
app.get('/photo/:id',(req,res)=>{
  image.findOne({_id : req.params.id})
  .then(ima=>{
    res.contentType(ima.contentType);
    res.send(ima.data);
   
  });

});

const port = 3000;
app.listen(port,()=>{
  console.log(`Server started on ${port}`);
});