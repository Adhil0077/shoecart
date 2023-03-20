const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const userData = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  wallet:{
    default:0,
    type:Number
     },
  address: [
    {
      name: {
        type: String,
        required: true,
      },
      housename: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      district: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
  ],
  email: {
    type: String,
    required: true,
  },
  phonenumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      productTotalPrice: {
        type: Number,
      },
    },
  ],
  cartTotallPrice: {
    type: Number,
  },
  wishlist: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
    },
  ],
});
module.exports = mongoose.model("User", userData);
