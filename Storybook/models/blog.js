const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userBlog = new Schema({
  title: {
    type:String,
    required:true
  },
  content: {
    type: String,
    required: true
  },
  user : {
    type:Schema.Types.ObjectId,
    ref : 'users'
  },
  date :{ 
    type:Date,
    default:Date.now
  }
});
mongoose.model('blogs',userBlog,'blogs');