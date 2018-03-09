const mongoose = require('mongoose');
const schema = mongoose.Schema;

const ImageSchema = new schema({
  data : {
    type : Buffer
  },
  contentType: {
    type: String
  }
});
mongoose.model('image',ImageSchema);