const mongoose = require('mongoose');
const schema = mongoose.Schema;

const imageUser = new schema({
  data :{
    type:Buffer
  },
  contentType:{
    type:String
  },
  user : {
    type: schema.Types.ObjectId,
    ref:'users'
  }
});
mongoose.model('images',imageUser);