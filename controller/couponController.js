const product = require("../model/productlist");
const category = require("../model/admincategory");
const UserData = require("../model/usermodel");
const Order = require("../model/orders");
const admin = require("../model/adminmodel");
const coupon = require("../model/coupon");

const couponView = async (req, res,next) => {
  try {
    const coupons = await coupon.find({});
    
    res.render("coupon", { coupon: coupons });
  } catch (error) {
    next(error);
  }
};

const addCoupon = async (req, res,next) => {
  try {
    res.render("addcoupon");
  } catch (error) {
    next(error);
  }
};

const addnewCoupon = async (req, res,next) => {
  try {
    const {
      code,
      expirationDate,
      maxDiscount,
      MinPurchaseAmount,
      percentageOff,
    } = req.body;

    const newCoupon = new coupon({
      code: code,
      expirationDate: expirationDate,
      maxDiscount: maxDiscount,
      MinPurchaseAmount: MinPurchaseAmount,
      percentageOff: percentageOff,
    });
    const save = await newCoupon.save();
    if (save) {
      res.redirect("/admin/couponview");
    }
  } catch (error) {
    next(error);
  }
};

//apply applyCoupon
const applyCoupon = async (req, res,next) => {
  try {
    const couponDetails = await coupon.findOne({ code: req.body.code });
    if (couponDetails) {
      const users = req.session.user;
      const user = await UserData.findOne({ _id: users._id });
      const found = await coupon.findOne({
        code: req.body.code,
        userUsed: { $in: [users._id] },
      });
      const code = couponDetails.code;
      const datenow = Date.now();
      if (found) {
        res.json({ used: true });
      } else {
        if (datenow <= couponDetails.expirationDate) {
          if (req.body.total >= couponDetails.MinPurchaseAmount) {
            let discountAmount =(req.body.total * couponDetails.percentageOff) / 100;
            if (discountAmount <= couponDetails.maxDiscount) {
              let discountValue = discountAmount;
              let value = req.body.total - discountValue;
              res.json({ amountokay: true, value, discountValue, code });
            } else {
              let discountValue = couponDetails.maxDiscount;
              let value = req.body.total - discountValue;

              res.json({ amountokay: true, value, discountValue, code });
            }
          } else {
            res.json({ amountnotoky: true });
          }
        } else {
          res.json({ datefailed: true });
        }
      }
    } else {
      res.json({ invaild: true });
    }
  } catch (error) {
    next(error);
  }
};


//delete coupon
const deleteoupon = async(req,res,next)=>{
  try { 
    const couponId = req.body.coupon.trim()
    console.log(couponId);
  const deleteCoupon = await coupon.deleteOne({_id:couponId})
  res.json({success:true})
  } catch (error) {
    next(error)
  }
}


//edit coupon
const updateCoupon = async (req, res, next) => {
  try {
    const id = req.params.id;

    const {
      code,
      expirationDate,
      maxDiscount,
      MinPurchaseAmount,
      percentageOff,
    } = req.body;

    const newCoupon = await coupon.updateOne(
      { _id: id },
      {
        code: code,
        expirationDate: expirationDate,
        maxDiscount: maxDiscount,
        MinPurchaseAmount: MinPurchaseAmount,
        percentageOff: percentageOff,
      }
    );

    res.redirect('/admin/couponview');
  } catch (error) {
    next(error);
  }
};


module.exports = {
  couponView,
  addCoupon,
  addnewCoupon,
  applyCoupon,
  deleteoupon,
  updateCoupon
};
