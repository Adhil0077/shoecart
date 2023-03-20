//required modules
const express = require('express')
const bodyparser = require('body-parser')
const nocache = require('nocache')

// const config = require('../config/config')
const auth = require('../middleware/auth')
const admincontoller = require('../controller/admincontroller')
const admincategory = require('../controller/categorycontroller')
const productlist = require('../controller/productcontroller')
const ordermgt = require('../controller/ordermgt')
const Coupon = require('../controller/couponController')
const ad = require('../controller/ad')
const upload = require('../middleware/multer')



//============================================================================================================================================================================================================


//express object
adminRoute = express()


//specifing 
adminRoute.set('view engine', 'ejs') 
adminRoute.set('views', 'views/admin')




//============ADMIN========================================================================================================================================================================================================================================

//routes get

adminRoute.get('/',auth.islogout,admincontoller.adminLogin)
adminRoute.get('/dashboard',auth.islogin,admincontoller.loadDashboard)
adminRoute.get('/logout',admincontoller.logout)
adminRoute.get('/category',auth.islogin,admincategory.admin_category)
adminRoute.get('/category/addcategory',auth.islogin,admincategory.add_category)
adminRoute.get('/category/deletecategory/:id',auth.islogin,admincategory.deletecategory)
adminRoute.get('/category/editcategory/:id',auth.islogin,admincategory.vieweditcategory)
adminRoute.get('/addproduct',auth.islogin,productlist.addProduct)
adminRoute.get('/productlist',auth.islogin,productlist.productview)
adminRoute.get('/productlist/productListDelete/:id',auth.islogin,productlist.productdelete)
adminRoute.get('/productlist/editproductview/:id',auth.islogin,productlist.editproView)
adminRoute.get('/user',auth.islogin,admincontoller.user)
adminRoute.get('/user/blockuser/:id',auth.islogin,admincontoller.blockuser)
adminRoute.get('/category/unlist/:id',auth.islogin,admincategory.unlistCategory)
adminRoute.get('/productlist/unlist/:id',auth.islogin,productlist.unlistProduct)
adminRoute.get('/deleteimg/:imgid/:proid',auth.islogin,productlist.deleteimg)
adminRoute.get('/orders',auth.islogin,ordermgt.adminOrderview)
adminRoute.get('/vieworders/:id',auth.islogin,ordermgt.vieworders)
adminRoute.get('/couponview',auth.islogin,Coupon.couponView)
adminRoute.get('/addCoupon',auth.islogin,Coupon.addCoupon)
adminRoute.get('/banner',auth.islogin,ad.bannerview)
adminRoute.get('/addbanner',auth.islogin,ad.addBannerView)
adminRoute.get('/sales',auth.islogin,admincontoller.salesview)

//routes post
adminRoute.post('/',auth.islogout,admincontoller.loginverify)
adminRoute.post('/category/addcategory',auth.islogin,admincategory.addNewCategory)
adminRoute.post('/category/editcategory/:id',auth.islogin,admincategory.editcategory)
adminRoute.post('/addproduct',upload.array('image'),auth.islogin,productlist.addNewProduct)
adminRoute.post('/productlist/editproductview/:id',auth.islogin,productlist.editproduct)
adminRoute.post('/doEditImage/:id',upload.array('image'),auth.islogin,productlist.editimg)
adminRoute.post("/statusUpdate",ordermgt.changestatus)
adminRoute.post('/addCoupon',auth.islogin,Coupon.addnewCoupon)
adminRoute.post('/addbanner',upload.single('files'),auth.islogin,ad.addNewBanner)
adminRoute.post('/deletebanner',auth.islogin,ad.deleteBanner)
adminRoute.post('/sales',auth.islogin,admincontoller.salesReport)
adminRoute.post('/deleteCoupon',auth.islogin,Coupon.deleteoupon)
adminRoute.post('/updateCoupon/:id',auth.islogin,Coupon.updateCoupon)



adminRoute.use(function(req, res) {
  res.render('error')
});


//exportrs
module.exports = adminRoute