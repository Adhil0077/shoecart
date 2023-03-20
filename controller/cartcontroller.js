const product = require("../model/productlist");
const category = require("../model/admincategory");
const UserData = require("../model/usermodel");
const { render, response } = require("../routes/userRoute");

const cartview = async (req, res,next) => {
  try {
    if (req.session.user) {
      const user = req.session.user;
      // console.log(category);

      const cart = await UserData.findOne({ _id: user._id })
        .populate("cart.product")
        .exec();
      let sum = 0;
      for (let i = 0; i < cart.cart.length; i++) {
        sum = sum + cart.cart[i].productTotalPrice;
      }
      const totalCartPrice = await UserData.updateOne(
        { _id: user._id },
        { $set: { cartTotallPrice: sum } }
      );
      const userData = await UserData.findOne({ _id: user._id })
        .populate("cart.product")
        .exec();
      const categoryDetails = await category.find({});
      const productDetail = await product.find({})
      res.render("cart", { userData: userData, category: categoryDetails,product:productDetail });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    next(error);
  }
};

const toCart = async (req, res) => {
  try {
    if (req.session.user) {
      const proId = req.body.product;
      const price = req.body.price;

      const userData = req.session.user;

      const products = await UserData.findOne({
        _id: userData._id,
        "cart.product": proId,
      }).exec();
       
      const alreadyInCart = await UserData.findOne({})

      if (products) {
        await UserData.updateOne(
          { _id: userData._id, "cart.product": proId },
          { $pull: { wishlist: { product: proId } } }
        );
        res.json({ alreadyInCart: true });
      } else {
        await UserData.updateOne(
          { _id: userData._id, "cart.product": proId },
          { $pull: { wishlist: { product: proId } } }
        );
        const productdetails = await product.findOne({ _id: proId });
        const cartInsert = await UserData.updateOne(
          { _id: userData._id },
          {
            $push: {
              cart: {
                product: proId,
                quantity: 1,
                productTotalPrice: productdetails.price,
              },
            },
          }
        );
        await UserData.updateOne(
          { _id: userData._id, "cart.product": proId },
          { $pull: { wishlist: { product: proId } } }
        );

        const user = await UserData.find({ _id: userData._id })
          .populate("cart.product")
          .exec();

        const Category = await category.findOne({});
        res.json({ added: true });
      }
    } else {
      res.json({ login: true });
    }
  } catch (error) {
    next(error);
  }
};

const deletecart = async (req, res,next) => {
  try {
    if (req.session.user) {
      const id  = req.body.id.trim()
      const usersData = req.session.user;
      
      const deletecartData = await UserData.updateOne(
        { _id: usersData._id },
        { $pull: { cart: { product: id } } }
      );

      const cart = await UserData.findOne({ _id: usersData._id })
        .populate("cart.product")
        .exec();
      let sum = 0;
      for (let i = 0; i < cart.cart.length; i++) {
        sum = sum + cart.cart[i].productTotalPrice;
      }
      const totalCartPrice = await UserData.updateOne(
        { _id: usersData._id },
        { $set: { cartTotallPrice: sum } }
      );

      const userData = await UserData.findOne({ _id: usersData._id })
        .populate("cart.product")
        .exec();
      const categoryDetails = await category.find({});
   
      res.json({ done: true })


    } else {
      res.redirect('/login')
    }
  } catch (error) {
    next(error);
  }
};

//change qunatity

const changequantity = async (req, res,next) => {
  try {
    if (req.session.user) {
      const user = req.session.user;
      const price = req.body.price;
      const count = req.body.count;
      const proId = req.body.product;
      const productdetails = await product.findOne({ _id: proId });
      //change quantity
      const changequantity = await UserData.updateOne(
        { _id: user._id, "cart.product": proId },
        { $inc: { "cart.$.quantity": count } }
      );
      //change per product price
      const cartqty = await UserData.findOne(
        { _id: user._id, "cart.product": proId },
        { "cart.$": 1 }
      );
      const tprice = productdetails.price * cartqty.cart[0].quantity;
      const totalPriceProduct = await UserData.updateOne(
        { _id: user._id, "cart.product": proId },
        { $set: { "cart.$.productTotalPrice": tprice } }
      );
      //change cart total price
      const cart = await UserData.findOne({ _id: user._id })
        .populate("cart.product")
        .exec();
      let sum = 0;
      for (let i = 0; i < cart.cart.length; i++) {
        sum = sum + cart.cart[i].productTotalPrice;
      }
      const totalCartPrice = await UserData.updateOne(
        { _id: user._id },
        { $set: { cartTotallPrice: sum } }
      );

      res.json({ success: true, tprice, sum });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  cartview,
  toCart,
  deletecart,
  changequantity,
};
