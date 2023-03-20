const mongoose = require('mongoose')
const { ObjectId } = require('mongodb')
const productData = mongoose.Schema({
  productName:{
    type:String,
    required:true
  },
  category:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'category',
    required:true
  },
  description:{
    type:String,
    required:true
  },
  stock:{
    type:Number,
    required:true
  },
  price:{
    type:Number,
    required:true
  },
  image:{
    type:Array,
    required:true
  },
  unlist:{
    type:Boolean,
    default:false
  }
})


module.exports = mongoose.model('product',productData)