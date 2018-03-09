if(process.env.PORT == 'production'){
  module.exports= {
    mongoURI:'mongodb://pisal:pisal@ds233238.mlab.com:33238/image-upload'
  }
}else{
  module.exports= {
    mongoURI:'mongodb://localhost/image-upload'
  }
}