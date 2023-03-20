const mongoose = require('mongoose')

const orderData = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  orderId:{
    type:String,
    unique:true,
    required:true,
  },
  deliveryAddress:{
    type:String,
    required:true
  },
  date:{
    type:Date
  },
  product:[{
    productId:{
      type: mongoose.Schema.Types.ObjectId,
      ref:'product',
      required:true
    },
    quantity:{
      type:Number,
      required:true
    },
    singleTotal:{
      type:Number,
      required:true
    },
    singlePrice:{
      type:Number,
      required:true
    }
  }],
  total:{
    type:Number
  },
  discount:{
    type:Number
  },
  paymentType:{
    type:String,
    requires:true
  },
  coupon:{
 type:String
  },
  status:{
    type:String,
    default:'Pendding'
  },
  deliveryDate:{
    type:Date
  },
  returnDate:{
    type:Date
  }
})



module.exports = mongoose.model('Order',orderData)