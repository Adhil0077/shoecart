const mongoose = require('mongoose')
const banner = mongoose.Schema({
  description:{
    type:String,
    required:true
  }, 
  img:{
    type:String,
    required:true
  }
})



module.exports = mongoose.model('Banner',banner)