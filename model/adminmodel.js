const mongoose = require('mongoose')
const adminData = mongoose.Schema({
  username:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true
  }
})



module.exports = mongoose.model('admin',adminData)