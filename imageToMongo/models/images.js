const mongoose = require('mongoose');
const schema = mongoose.Schema;

const imageSchema = new schema({
  img:{
    data:Buffer,
    contentType:String
  }
});
mongoose.model('images',imageSchema);