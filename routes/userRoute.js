//required modules
const express = require('express')
const bodyparser = require('body-parser')
const nocache = require('nocache')
const multer = require('multer')
const path = require('path')
const userauth = require('../middleware/userauth')
const config = require('../config/config')
const auth = require('../middleware/auth')
const usercontroller = require('../controller/usercontroller')
const cartcontroller = require('../controller/cartcontroller')
const wishlistcontroller = require('../controller/wishlistcontroller')
const checkout = require('../controller/checkoutcontroller')
const Coupon = require('../controller/couponController')
const ordermgt = require('../controller/ordermgt')
const productlist = require('../controller/productcontroller')

//============================================================================================================================================================================================================
//express object
const userRoute = express()


//specifing 
userRoute.set('view engine', 'ejs')
userRoute.set('views', 'views/user')





//============USER========================================================================================================================================================================================================================================



//routes get
userRoute.get('/',usercontroller.userhome)
userRoute.get ('/login',userauth.islogout,usercontroller.userlogin)
userRoute.get ('/signup',userauth.islogout,usercontroller.usersignup)
userRoute.get('/logout',usercontroller.Ulogout)
userRoute.get('/shop',usercontroller.shopView)
userRoute.get('/shop/productdetail/:id',usercontroller.productDetail)
userRoute.get('/userCart',cartcontroller.cartview)
userRoute.get('/wishlist',wishlistcontroller.wishlist)
userRoute.get('/ForgotPassword',usercontroller.ForgotPassword)
userRoute.get('/view/:id',usercontroller.viewCategoryFilter)
userRoute.get ('/userprofile',usercontroller.userprofile)
userRoute.get ('/useraddAddressview',usercontroller.addUserAddressview)
userRoute.get('/UserviewAddressview',usercontroller.viewaddress)
userRoute.get ('/checkout',checkout.checkoutPage)
userRoute.get('/success',checkout.orderConfirmation)
userRoute.get('/editaddress/:id',usercontroller.vieweditaddress)
userRoute.get('/deleteaddress/:id',usercontroller.deleteaddress)
userRoute.get ('/orderreceipt',checkout.userOrderreport)
userRoute.get('/userorders/:id',checkout.userorders)


//routes post
userRoute.post('/login',usercontroller.loginverify)
userRoute.post('/signup',usercontroller.verifySignup)
userRoute.post('/verifyotp',usercontroller.verifyOtp)
userRoute.post('/ForgotPassword',usercontroller.phoneverify)
userRoute.get('/sendforgototp',usercontroller.sendforgototp)
userRoute.post('/verifyforgototp',usercontroller.verifypassotp)
userRoute.post('/repass',usercontroller.retype)
userRoute.post('/changequantity',cartcontroller.changequantity)
userRoute.post ('/useraddAddressview',usercontroller.addaddress)
userRoute.post('/tocart',cartcontroller.toCart)
userRoute.post('/cartdelete',cartcontroller.deletecart)
userRoute.post('/towishlist',wishlistcontroller.toWishlist)
userRoute.post('/wishlistdelete',wishlistcontroller.deletewishlist)
userRoute.post ('/checkout',checkout.postorder)
userRoute.post('/editedprofile',usercontroller.editprofile)
userRoute.post('/resetpassword',usercontroller.resetpassword)
userRoute.post('/editaddress/:id',usercontroller.editaddress)
userRoute.post('/verify-payment',checkout.PaymentVerified)
userRoute.post('/postorder',checkout.postorder)
userRoute.post('/checkoutAddAddress',checkout.checkoutAddAddress)
userRoute.post('/applyCoupon',Coupon.applyCoupon)
userRoute.post("/statusUpdated",checkout.statusUpdate)
userRoute.post('/search',productlist.searchproduct)


userRoute.use(function(req, res) {
  res.render('error')
});

//exportrs
module.exports = userRoute