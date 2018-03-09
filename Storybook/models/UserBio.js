const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bioSchema = new Schema({
    education:{
      type:String,
      default:'not set',
      required:true
    },
    live:{
      type:String,
      required:true,
      default:'not set'
    },
    from:{
      type:String,
      required:true,
      default:'not set'
    },
    description:{
      type:String,
    },
    user:{
      type: Schema.Types.ObjectId,
      ref:'users'
    }
  
});

mongoose.model('userbio',bioSchema);