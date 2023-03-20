const product = require("../model/productlist");
const category = require("../model/admincategory");
const UserData = require("../model/usermodel");
const Order = require("../model/orders");
const { v4: uuidv4 } = require("uuid");
const { now } = require("mongoose");
const razorpay = require("razorpay");
const crypto = require("crypto");
const { nextTick } = require("process");
require("dotenv").config();
const Coupon = require("../model/coupon");

var instance = new razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

const moment = require("moment");
const { response } = require("../routes/userRoute");
const coupon = require("../model/coupon");

//checkout render
const checkoutPage = async (req, res,next) => {
  try {
    if (req.session.user) {
      const user = req.session.user;
      const productDetails = await product.find({});
      const categoryDetails = await category.find({});
      let date = Date.now()

      const coupons = await coupon.find({
        expirationDate:{$gte:date},
        userUsed :{$not:{$eq:req.session.user._id}}
      }).limit(2);
  

      const userData = await UserData.findOne({ _id: user._id }).populate(
        "cart.product"
      );
      if(userData.cart.length==0){
        res.redirect('/usercart')
      }
      res.render("checkout", {
        userData: userData,
        product: productDetails,
        category: categoryDetails,
        coupon:coupons
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    next(error);
  }
};

//payment
const postorder = async (req, res, next) => {
  try {
    if (req.session.user) {
      const user = req.session.user;
      let method = req.body.paymentoption;
      const address = req.body.address;
      

      if (method == "COD") {
        const username = await UserData.findOne({
          _id: user._id,
        });
        const id = user._id;
        const orders = req.body;
        const orderDetails = [];
        const productId = req.body.proId;
        orders.product = orderDetails;
        if (!Array.isArray(orders.proId)) {
          orders.proId = [orders.proId];
        }
        if (!Array.isArray(orders.pqty)) {
          orders.pqty = [orders.pqty];
        }
        if (!Array.isArray(orders.protp)) {
          orders.protp = [orders.protp];
        }
        if (!Array.isArray(orders.singlePrice)) {
          orders.singlePrice = [orders.singlePrice];
        }
        for (let i = 0; i < orders.proId.length; i++) {
          const productId = orders.proId[i];
          const quantity = orders.pqty[i];
          const singleTotal = orders.protp[i];
          const singlePrice = orders.singlePrice[i];
          orderDetails.push({
            productId: productId,
            quantity: quantity,
            singleTotal: singleTotal,
            singlePrice: singlePrice,
          });
        }
        const ordersave = new Order({
          userId: id,
          product: orders.product,
          total: req.body.total1,
          orderId: `order_id_${uuidv4()}`,
          deliveryAddress: orders.address,
          paymentType: orders.paymentoption,
          discount: req.body.discount1,
          coupon: req.body.code,
          date: Date.now(),
        });
        const saveData = await ordersave.save();
        await coupon.updateOne(
          { code: req.body.code },
          { $push: { userUsed: user._id } }
        );

       
        res.json({ status: true });
      } else if (method == "ONLINE") {

        //razropay
        const username = await UserData.findOne({
          _id: user._id,
        });
        const id = user._id;

        const orders = req.body;
        const orderDetails = [];
        const productId = req.body.proId;
        orders.product = orderDetails;
        if (!Array.isArray(orders.proId)) {
          orders.proId = [orders.proId];
        }

        if (!Array.isArray(orders.pqty)) {
          orders.pqty = [orders.pqty];
        }

        if (!Array.isArray(orders.protp)) {
          orders.protp = [orders.protp];
        }
        if (!Array.isArray(orders.productprice)) {
          orders.productprice = [orders.productprice];
        }

        for (let i = 0; i < orders.proId.length; i++) {
          const productId = orders.proId[i];
          const quantity = orders.pqty[i];
          const singleTotal = orders.protp[i];
          const singlePrice = orders.singlePrice[i];

          orderDetails.push({
            productId: productId,
            quantity: quantity,
            singleTotal: singleTotal,
            singlePrice: singlePrice,
          });
        }
        const ordersave = new Order({
          userId: id,
          product: orders.product,
          total: req.body.total1,
          orderId: `order_id_${uuidv4()}`,
          deliveryAddress: orders.address,
          paymentType: orders.paymentoption,
          discount: req.body.discount1,
          coupon: req.body.code,
          date: Date.now(),
          status: "Payment Failed",
        });
        const saveData = await ordersave.save();
        await coupon.updateOne(
          { code: req.body.code },
          { $push: { userUsed: user._id } }
        );

       
        const latestOrder = await Order.findOne({}).sort({ date: -1 }).lean();

        let options = {
          amount: req.body.total1 * 100,
          currency: "INR",
          receipt: "" + latestOrder._id,
        };

        instance.orders.create(options, function (err, order) {

          res.json({ viewRazorpay: true, order });
        });
      } else if (method == "WALLET") {
        const username = await UserData.findOne({
          _id: user._id,
        });
        if (req.body.total1 > username.wallet) {
          res.json({ OutofBalance: true });
        } else {
          const id = user._id;
          const orders = req.body;
          const orderDetails = [];
          const productId = req.body.proId;
          orders.product = orderDetails;
          if (!Array.isArray(orders.proId)) {
            orders.proId = [orders.proId];
          }
          if (!Array.isArray(orders.pqty)) {
            orders.pqty = [orders.pqty];
          }
          if (!Array.isArray(orders.protp)) {
            orders.protp = [orders.protp];
          }
          if (!Array.isArray(orders.singlePrice)) {
            orders.singlePrice = [orders.singlePrice];
          }
          for (let i = 0; i < orders.proId.length; i++) {
            const productId = orders.proId[i];
            const quantity = orders.pqty[i];
            const singleTotal = orders.protp[i];
            const singlePrice = orders.singlePrice[i];
            orderDetails.push({
              productId: productId,
              quantity: quantity,
              singleTotal: singleTotal,
              singlePrice: singlePrice,
            });
          }
          const ordersave = new Order({
            userId: id,
            product: orders.product,
            total: req.body.total1,
            orderId: `order_id_${uuidv4()}`,
            deliveryAddress: orders.address,
            paymentType: orders.paymentoption,
            discount: req.body.discount1,
            coupon: req.body.code,
            date: Date.now(),
          });
          const saveData = await ordersave.save();
          await coupon.updateOne(
            { code: req.body.code },
            { $push: { userUsed: user._id } }
          );

          await UserData.updateOne(
            { _id: username._id },
            { $inc: { wallet: -req.body.total1 } }
          );

          res.json({ status: true });
        }
      } else {
        res.json({ radio: true });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    next(error);
    
  }
};

//Payment Verified
const PaymentVerified = async (req, res, next) => {
  try {
    if (req.session.user) {
      const latestOrder = await Order.findOne({}).sort({ date: -1 }).lean();

      await Order.updateOne(
        { orderId: latestOrder.orderId },
        { $set: { status: "Confirmed" } }
      );

      const details = req.body;
      let hmac = crypto.createHmac("sha256", process.env.KEY_SECRET);
      hmac.update(
        details["payment"]["razorpay_order_id"] +
          "|" +
          details["payment"]["razorpay_payment_id"]
      );
      hmac = hmac.digest("hex");
      if (hmac == details["payment"]["razorpay_signature"]) {

        res.json({ status: true });
      } else {
        res.json({ failed: true });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    next(error);
  }
};

//check add address
const checkoutAddAddress = async (req, res,next) => {
  try {
    if (req.session.user) {
      const user = req.session.user;
      const userData = await UserData.findOne({ _id: user._id });
      const adduserAddress = await UserData.updateOne(
        { _id: user._id },
        {
          $push: {
            address: {
              name: req.body.username,
              housename: req.body.userhousename,
              street: req.body.userstreet,
              district: req.body.userdistrict,
              state: req.body.userstate,
              pincode: req.body.userpincode,
              country: req.body.usercountry,
              phone: req.body.userphonenumber,
            },
          },
        }
      );
      res.json({ success: true });
    } else {
      res.json({ failed: true });
    }
  } catch (error) {
    next(error);
  }
};

//success get
const orderConfirmation = async (req, res, next) => {
  try {
    if (req.session.user) {
      const user = req.session.user;
      const categorydata = await category.find({});
      const userdetails = await UserData.findOne({ _id: user._id });

      const removing = await UserData.updateOne(
        { _id: user._id },
        {
          $set: {
            cart: [],
          },
        }
      );
      const latestOrder = await Order.findOne({}).sort({ date: -1 }).lean();

      const order = await Order.findOne({ _id: latestOrder._id }).populate(
        "product.productId"
      );
      for (let i = 0; i < latestOrder.product.length; i++) {
        await product.updateOne(
          { _id: latestOrder.product[i].productId },
          { $inc: { stock: -latestOrder.product[i].quantity } }
        );
      }

      res.render("successpage", {
        category: categorydata,
        userData: userdetails,
        order: order,
        moment: moment,
      

      });
    } else {
      res.redirect("/");
    }
  } catch {
    next(error);
  }
};

//order user report
const userOrderreport = async (req, res,next) => {
  try {
    if (req.session.user) {
      const user = req.session.user;
      const userdetails = await UserData.findOne({ _id: user._id });
      const categorydata = await category.find({});
      const ordersDetails = await Order.find({})
        .populate("product.productId")
        .sort({ date: -1 });

      res.render("orderreceipt", {
        category: categorydata,
        userData: userdetails,
        ordersDetails: ordersDetails,
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    next(error);
  }
};

const userorders = async (req, res,next) => {
  try {
    if (req.session.user) {
      const user = req.session.user;
      const userdetails = await UserData.findOne({ _id: user._id });
      const categoryDetails = await category.find({});
      const id = req.params.id;
      const ordersDetails = await Order.findOne({ _id: id }).populate(
        "product.productId"
      );
      res.render("orderview", {
        userData: userdetails,
        ordersDetails: ordersDetails,
        category: categoryDetails,
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    next(error);
  }
};

//user-side status update
const statusUpdate = async (req, res,next) => {
  try {
    const newstatus = req.body.newStatus;
    const orderid = req.body.orderId;
    const order = await Order.findOne({ orderId: orderid });
    await Order.updateOne(
      { orderId: orderid },
      { $set: { status: newstatus } }
    );
    const productDetail = await product
      .findOne({ _id: order.product.productId })
      .populate("product.productId");

    for (let i = 0; i < order.product.length; i++) {
      const quantity = order.product[i].quantity;
      const proId = order.product[i].productId;
      const stockUpdate = await product.updateOne(
        { _id: proId },
        { $inc: { stock: quantity } } // Increase stock if status is "cancelled"
      );
    }

    if (newstatus == "Cancelled" && order.paymentType == "ONLINE") {
      const total = order.total;
      const priceReturnToWallet = await UserData.updateOne(
        { _id: order.userId },
        { $inc: { wallet: total } }
      );
    } else if (newstatus == "Cancelled" && order.paymentType == "WALLET") {
      const total = order.total;
      const priceReturnToWallet = await UserData.updateOne(
        { _id: order.userId },
        { $inc: { wallet: total } }
      );
    }
    res.json({ success: true, status: newstatus });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkoutPage,
  postorder,
  PaymentVerified,
  orderConfirmation,
  checkoutAddAddress,
  userOrderreport,
  userorders,
  statusUpdate,
};
