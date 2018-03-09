if(process.env.NODE_ENV == 'production'){
  module.exports = {mongoURI:'mongodb://Minoz:minoz@ds133746.mlab.com:33746/video-share'}
}else{
  module.exports = {mongoURI:'mongodb://localhost/vidjot-dev'}
}