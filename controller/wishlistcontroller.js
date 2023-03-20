const UserData = require('../model/usermodel')
const Product = require('../model/productlist')
const Category = require('../model/admincategory')


const wishlist = async (req, res,next) => {
  try {
    if (req.session.user) {
      const user = req.session.user
      const ProductDeatils = await Product.find({})
      const userData = await UserData.findOne({ _id: user._id }).populate('wishlist.product')
      const categoryDetails = await Category.find({})
      res.render('wishlist', { userData: userData,category:categoryDetails,product:ProductDeatils })
    } else {
      res.redirect('/login')
    }
  } catch (error) {
    next(error)
  }
}


const toWishlist = async (req, res,next) => {
  try {
    if (req.session.user) {
      user = req.session.user
      const id = req.body.product
      const price = req.body.price
      
      const productInCart = await UserData.findOne({
          _id:user._id,
          "cart.product":id
        })
      const product = await UserData.findOne({
         _id: user._id,
          "wishlist.product": id 
        })
        
      if (productInCart) {
        res.json({ incart: true });

      } else if(product) {
        res.json({ already: true });
      }
      else {
        const userdate = await UserData.updateOne({ _id: user._id }, { $push: { wishlist: { product: id } } })
        res.json({ added: true });

      }

    } else {
      res.json({ login: true });
    }
  } catch (error) {
    next(error)
  }
}



const deletewishlist = async (req, res,next) => {
  try {
    if (req.session.user) {
      const user = req.session.user
      const proId = req.body.product.trim()
      const product = await UserData.updateOne({ _id: user._id }, { $pull: { wishlist: { product: proId } } })
      
      res.json({success:true})
    } else {
      res.redirect('/login')
    }


  } catch (error) {
    next(error)
  }
}






module.exports = {
  wishlist,
  toWishlist,
  deletewishlist
}