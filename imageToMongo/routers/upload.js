const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');

require('../models/images');
const Image = mongoose.model('images');

const storage = multer.diskStorage({
  destination:'./public/upload',
  rename: function (fieldname, filename) {
    return filename;
  }
});

router.get('/',(req,res)=>{
  res.render('index');
  
});
router.post('/upload',(req,res)=>{
  const path = `public/upload/${req.file.filename}`;
  const newImage={
    data : fs.readFileSync(path),
    contentType:req.file.mimetype
  }
  new Image(newImage)
  .save();

});
module.exports = router;