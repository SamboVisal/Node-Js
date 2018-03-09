const express = require('express');
const router = express.Router();
const path = require('path');
const { ensureAuthenticated, ensureGuest } = require('../helpers/auth');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
require('../models/blog');
const blog = mongoose.model('blogs');
require('../models/image');
const image = mongoose.model('images');


const storage = multer.diskStorage({
  destination: '../public/upload/',
  filename: (req,file,cb)=>{
    cb(null,file.fieldname+ '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage:storage,
  limits:{fileSize:1000000},
  fileFilter:function(req,file,cb){
    checkFileType(file,cb);
  }
}).single('myImage');

function checkFileType(file,cb){
  const filetypes = /jpeg|jpg|png|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if(mimetype && extname){
    return cb(null,true);
  }else{
    cb('Error: Images Only');
  }
}
router.post('/upload',(req,res)=>{
  upload(req,res,(err)=>{
    if(err){
      res.render('blog/add',{
        msg:err
      });
    }else{
      if(req.file==undefined){
        res.render('blog/add',{
          msg : 'Error: No File Selected'
        });
      }else{
        const path = `../public/upload/${req.file.filename}`;
        const newImage = {
          data : fs.readFileSync(path),
          contentType : req.file.mimetype,
          user:req.user.id
        }
        new image(newImage)
        .save()
        .then(image =>{
          console.log(image);
          console.log(req.file);
          res.render('blog/add');
        });
        
      }
    }
  });
});
router.get('/',(req,res)=>{
  
  res.render('blog/dashboard');

});
router.get('/add',(req,res)=>{
  res.render('blog/add');
});
router.get('/edit',function(req,res){
  res.render('blog/edit');
});
router.get('/user/:id',(req,res)=>{
  res.render('blog/userblog');
});
router.get('/upload',(req,res)=>{

});
module.exports = router;