const product = require("../model/productlist");
const category = require("../model/admincategory");
const UserData = require("../model/usermodel");
const Order = require("../model/orders");
const admin = require("../model/adminmodel");

const adminOrderview = async (req, res,next) => {
  try {
    const ordersDetails = await Order.find({}).populate("product.productId").sort({date:-1});

    console.log(ordersDetails);
    res.render("adminorders", { ordersDetails: ordersDetails });
  } catch (error) {
    next(error);
  }
};
const changestatus = async (req, res,next) => {
  try {
    const newstatus = req.body.newStatus;
  const orderid = req.body.orderId;
  const order = await Order.findOne({orderId:orderid})
  const total = order.total
  if (newstatus == "Delivered") {
    const deliveryDate = Date.now();
    const returnDate = new Date(deliveryDate);
    returnDate.setDate(returnDate.getDate() + 6);
    const update = await Order.updateOne(
      { orderId: orderid },
      { $set: { status: newstatus, deliveryDate: deliveryDate,returnDate:returnDate } }   
    );

   
  }else if(newstatus=='Returned'){
    const priceReturnToWallet = await UserData.updateOne(
          { _id: order.userId },
          { $inc: { wallet: total } }
        );
  } 
    await Order.updateOne({ orderId: orderid }, { $set: { status: newstatus } })
      
        res.json({ success: true, status: newstatus });
  } catch (error) {
    next(error);
  }   
  
};

//view orders

const vieworders = async (req, res,next) => {
  try {
    const id = req.params.id;
    const ordersDetails = await Order.findOne({ _id: id }).populate(
      "product.productId"
    )
    res.render("orderview", { ordersDetails: ordersDetails });
  } catch (error) {
    next(error);
  }
};



module.exports = {
  adminOrderview,
  changestatus,
  vieworders,
};
