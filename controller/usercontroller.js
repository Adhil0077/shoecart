const UserData = require("../model/usermodel");
const bcrypt = require("bcrypt");
const product = require("../model/productlist");
const category = require("../model/admincategory");
const bannerAd = require("../model/bannermodel")
const validate = require('express-validator')

let session;

require("dotenv").config();
const accountsid = process.env.TWILIO_ACCOUNT_SID;
const authtoken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountsid, authtoken);

//Home page
const userhome = async (req, res,next) => {
  try {
    if (req.session.user) {
      const userData = req.session.user;
      if (userData.status == true) {
        res.redirect("/");
      } else {
        const userData = req.session.user;
        const banner = await bannerAd.find({})
        const productDetails = await product.find({});
        const categoryDetails = await category.find({});
        res.render("userhome", {
          userData: userData,
          product: productDetails,
          category: categoryDetails,
          banner:banner
        });
      }
    } else {
      let userDatas;
      const banner = await bannerAd.find({})
      const productDetails = await product.find({});
      const categoryDetails = await category.find({});
      res.render("userhome", {
        userData: userDatas,
        product: productDetails,
        category: categoryDetails,
        banner:banner
      });
    }
  } catch (error) {
    next(error);
  }
};

//login page
const userlogin = async (req, res,next) => {
  try {
    if (req.session.user) {
      res.redirect("/");
    } else {
      res.render("userlogin");
    }
  } catch (error) {
    next(error);
  }
};

//register page
const usersignup = async (req, res,next) => {
  try {
    res.render("signup");
  } catch (error) {
    next(error);
  }
};



//register
const verifySignup = async (req, res,next) => {
  console.log(req.body);
  req.session.userid = req.body;
  const found = await UserData.findOne({ username: req.body.username });
  if (found) {
    res.render("signup", { message: "username already exist ,try another" });
  } else {
    // console.log('body'+req.body)
    phonenumber = req.body.phonenumber;
    try {
      const otpResponse = await client.verify.v2
        .services("VA868d063171410cfcef8722cd8332c55a")
        .verifications.create({
          to: `+91${phonenumber}`,
          channel: "sms",
        });
      res.render("otppage");
    } catch (error) {
      next(error);
    }
  }
};

const verifyOtp = async (req, res, next) => {
  const otp = req.body.otp;
  try {
    const details = req.session.userid;

    const verifiedResponse = await client.verify.v2
      .services("VA868d063171410cfcef8722cd8332c55a")
      .verificationChecks.create({
        to: `+91${details.phonenumber}`,
        code: otp,
      });
    console.log("details" + details);
    if (verifiedResponse.status === "approved") {
      details.password = await bcrypt.hash(details.password, 10);
      const userdata = new UserData({
        username: details.username,
        address: details.address,
        email: details.email,
        phonenumber: details.phonenumber,
        password: details.password,
      });

      const userData = await userdata.save();

      const finduser = await UserData.findOne({ username: details.username });

      req.session.user = finduser;

      if (req.session.user) {
        res.redirect("/");
      } else {
        res.render("otppage", { message: "wrong otp" });
      }
    } else {
      res.render("otppage", { message: "wrong otp" });
    }
  } catch (error) {
    next(error);
  }
};

//verifying login
const loginverify = async (req, res,next) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const userData = await UserData.findOne({ username: username });

    if (userData) {
      const comparepass = await bcrypt.compare(password, userData.password);
      if (userData.status == false) {
        if (comparepass) {
          req.session.user = userData;
          res.redirect("/");
        } else {
          res.render("userlogin", { message: "password is incorrect" });
        }
      } else {
        res.render("userlogin", { message: "user is blocked" });
      }
    } else {
      res.render("userlogin", { message: "Email and password  is incorrect" });
    }
  } catch (error) {
    next(error);
  }
};

//logout
const Ulogout = async (req, res,next) => {
  try {
    req.session.user = null;
    res.redirect("/");
  } catch (error) {
    next(error);
  }
};

//shop view
const shopView = async (req, res,next) => {
  try {
    let limit = 10;

    let page = req.query.page;

    if (req.session.user) {
      const userData = req.session.user;
      // const productDetail = await product.find({})
      if (userData.status == true) {
        res.redirect("/shop");
      } else {
        const userData = req.session.user;
        const productDetails = await product
          .find({})
          .populate("category")
          .limit(limit * 1)
          .skip((page - 1) * limit)
          .exec();

        const procount = await product.find({}).countDocuments();
        let procount2 =Math.ceil(procount/limit)
        console.log(procount2);
        console.log("hhh");
        const categoryDetails = await category.find({});
        res.render("shop", {
          userData: userData,
          product: productDetails,
          category: categoryDetails,
          procounts: procount2,
        });
      }
    } else {
      let userDatas;
      const productDetails = await product
        .find({})
        .populate("category")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
      const categoryDetails = await category.find({});
      const procount = await product.find({}).countDocuments();
      let procount2 =Math.ceil(procount/limit)
      res.render("shop", {
        userData: userDatas,
        product: productDetails,
        category: categoryDetails,
        procounts: procount2,
      });
    }
  } catch (error) {
    next(error);
  }
};

//productdetail

const productDetail = async (req, res,next) => {
  try {
    if (req.session.user) {
      const userData = req.session.user
      if (userData.status == true) {
        res.redirect("/");
      }else{
         const userData = req.session.user;
      const id = req.params.id;
      const categoryDetails = await category.find({});
      const Data = await product.findOne({ _id: id });
      const ProductDeatils = await product.findOne({_id: id})
      res.render("productdetails", {
        data: Data,
        userData: userData,
        category: categoryDetails,
        Product:ProductDeatils
      });
      }
     
     
    } else {
      let userData;
      const id = req.params.id;
      const categoryDetails = await category.find({});
      const Data = await product.findOne({ _id: id });
      const ProductDeatils = await product.findOne({_id: id})
      res.render("productdetails", {
        data: Data,
        userData: userData,
        category: categoryDetails,
        Product:ProductDeatils
      });
    }
  } catch (error) {
    next(error);
  }
};

//forgot password
const ForgotPassword = async (req, res,next) => {
  try {
    res.render("forgotpassword");
  } catch (error) {
    next(error);
  }
};

//verify phone Number
const phoneverify = async (req, res,next) => {
  try {
    const phonenumber = req.body.phonenumber;
    console.log(req.body.phonenumber);
    const userData = await UserData.findOne({ phonenumber: phonenumber });
    req.session.user = userData;

    if (userData) {
      res.redirect("/sendforgototp");
    } else {
      res.render("ForgotPassword", {
        message: "No account exists in this Number",
      });
    }
  } catch (error) {
    next(error);
  }
};

//send forgot otp

const sendforgototp = async (req, res,next) => {
  data = req.session.user;

  try {
    const otpResponse = await client.verify.v2
      .services("VA868d063171410cfcef8722cd8332c55a")
      .verifications.create({
        to: `+91${data.phonenumber}`,
        channel: "sms",
      });
    res.render("forgototp");
  } catch (error) {
    next(error);
  }
};

//verify forgot otp
const verifypassotp = async (req, res,next) => {
  const otp = req.body.otp;
  try {
    const details = req.session.user;
    console.log("phone :" + details);
    const verifiedResponse = await client.verify.v2
      .services("VA868d063171410cfcef8722cd8332c55a")
      .verificationChecks.create({
        to: `+91${details.phonenumber}`,
        code: otp,
      });
    console.log("details" + details.phonenumber);
    if (verifiedResponse.status === "approved") {
      res.render("repassword");
    }
  } catch (error) {
    next(error);
  }
};

//re type password
const retype = async (req, res,next) => {
  try {
    const user = req.session.user;
    const newpassword = req.body.newpassword;
    const securedpassword = await bcrypt.hash(newpassword, 10);
    const userData = await UserData.updateOne(
      { username: user.username },
      { $set: { paswword: securedpassword } }
    );
    const productDetails = await product.find({});
    const categoryDetails = await category.find({});
    res.render("userhome", {
      userData: userData,
      product: productDetails,
      category: categoryDetails,
    });
  } catch (error) {
    next(error);
  }
};

//filtercategory by page
const viewCategoryFilter = async (req, res,next) => {
  try {
    if (req.session.user) {
      const id = req.params.id;
      const user = req.session.user;
      const userData = await UserData.findOne({ username: user.username });
      const categoryDetails = await category.find({});
      const Product = await product
        .find({ category: id })
        .populate("category")
        .exec();
      if (Product) {
        res.render("pages", {
          userData: userData,
          products: Product,
          category: categoryDetails,
        });
      }
    } else {
      const id = req.params.id;
      let userData;
      const Category = await category.findOne({ _id: id });
      const categoryDetails = await category.find({});
      const Product = await product
        .find({ category: id })
        .populate("category")
        .exec();

      if (Product) {
        res.render("pages", {
          userData: userData,
          products: Product,
          category: categoryDetails,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

const userprofile = async (req, res,next) => {
  try {
    if (req.session.user) {
      const user = req.session.user;
      const userData = await UserData.findOne({ _id: user._id });
      const productDetails = await product.find({});
      const categoryDetails = await category.find({});
      res.render("userprofile", {
        userData: userData,
        product: productDetails,
        category: categoryDetails,
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    next(error);
  }
};

//add useradddress
const addUserAddressview = async (req, res,next) => {
  try {
    if (req.session.user) {
      const user = req.session.user;
      const userData = await UserData.findOne({ _id: user._id });
      const productDetails = await product.find({});
      const categoryDetails = await category.find({});
      res.render("addaddress", {
        userData: userData,
        product: productDetails,
        category: categoryDetails,
      });
    }
  } catch (error) {
    next(error);
  }
};

//add address
const addaddress = async (req, res,next) => {
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

      res.redirect("/UserviewAddressview");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    next(error);
  }
};

//view address
const viewaddress = async (req, res,next) => {
  try {
    if (req.session.user) {
      const user = req.session.user;
      const userData = await UserData.findOne({ _id: user._id });
      const productDetails = await product.find({});
      const categoryDetails = await category.find({});
      res.render("useraddressview", {
        userData: userData,
        product: productDetails,
        category: categoryDetails,
      });
    }
    else{
      res.redirect('/')
    }
  } catch (error) {
    next(error);
  }
};

//update user profile
const editprofile = async (req, res,next) => {
  try {
    if (req.session.user) {
      const user = req.session.user;
      email = req.body.email;
      phone = req.body.phonenumber;
      const updateuserProfile = await UserData.findOneAndUpdate(
        { _id: user._id },
        { $set: { phonenumber: phone, email: email } }
      );
      res.redirect("/userprofile");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    next(error);
  }
};

//reset user password
const resetpassword = async (req, res,next) => {
  try {
    if (req.session.user) {
      const user = req.session.user;
      const userData = await UserData.findOne({ _id: user._id });
      const password = req.body.oldpassword;
      const newpassword = req.body.newpassword;
      const comparepass = await bcrypt.compare(password, userData.password);
      if (comparepass) {
        const securedpassword = await bcrypt.hash(newpassword, 10);
        const updatepassword = await UserData.updateOne(
          { _id: user._id },
          { $set: { password: securedpassword } }
        );
      }
      res.redirect("/userprofile");
    }
  } catch (error) {
    next(error);
  }
};

//view edit address view
const vieweditaddress = async (req, res,next) => {
  try {
    if (req.session.user) {
      const user = req.session.user;
      const id = req.params.id;
      console.log(id);
      const userData = await UserData.findOne({ _id: user._id });
      const data = await UserData.findOne(
        { _id: user._id, "address._id": id },
        { "address.$": 1, _id: 0 }
      );

      const categoryDetails = await category.find({});
      console.log(data);

      res.render("editaddress", {
        userData: userData,
        category: categoryDetails,
        data: data.address[0],
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    next(error);
  }
};

//edit address
const editaddress = async (req, res,next) => {
  try {
    if (req.session.user) {
      const user = req.session.user;
      const id = req.params.id;
      const Name = req.body.username;
      const HouseName = req.body.userhousename;
      const Street = req.body.userstreet;
      const District = req.body.userdistrict;
      const State = req.body.state;
      const Phone = req.body.userphonenumber;
      const Pincode = req.body.userpincode;
      const Country = req.body.usercountry;

      const update = await UserData.updateOne(
        { _id: user._id, "address._id": id },
        {
          $set: {
            "address.$": {
              name: Name,
              housename: HouseName,
              street: Street,
              district: District,
              state: Street,
              phone: Phone,
              pincode: Pincode,
              country: Country,
            },
          },
        }
      );
    }
    res.redirect("/UserviewAddressview");
  } catch (error) {
    next(error);
  }
};

//delete user address
const deleteaddress = async(req,res,next)=>{
  try {
    if(req.session.user){
      const user = req.session.user
      const id = req.params.id
      const update = await UserData.updateOne(
        { _id: user._id, "address._id": id },
        { $pull: { address: { _id: id } } }
      );
      res.redirect('/UserviewAddressview')
      }else{
res.redirect("/")
      }
    
  } catch (error) {
    next(error);
  }
}

module.exports = {
  userhome,
  userlogin,
  usersignup,
  loginverify,
  Ulogout,
  shopView,
  verifySignup,
  verifyOtp,
  productDetail,
  ForgotPassword,
  phoneverify,
  sendforgototp,
  verifypassotp,
  retype,
  viewCategoryFilter,
  userprofile,
  addUserAddressview,
  addaddress,
  viewaddress,
  editprofile,
  resetpassword,
  vieweditaddress,
  editaddress,
  deleteaddress
};
