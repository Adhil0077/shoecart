const Product = require("../model/productlist");
const Category = require("../model/admincategory");
const UserData = require("../model/usermodel");
const { request } = require("../routes/adminRoute");
const fs = require("fs");
const path = require("path");

//rendering addproduct view
const addProduct = async (req, res,next) => {
  try {
    const category = await Category.find({});
    res.render("addproduct", { sendcategory: category });
  } catch (error) {
    next(error);
  }
};

//adding product info
const addNewProduct = async (req, res,next) => {
  try {
    const imgArray = [];
    for (var i = 0; i < req.files.length; i++) {
      imgArray[i] = req.files[i].filename;
    }

    const productData = new Product({
      productName: req.body.productName,
      category: req.body.category,
      description: req.body.description,
      stock: req.body.stock,
      price: req.body.price,
      image: imgArray,
    });

    const data = await productData.save();

    const category = await Category.find({});
    res.render("addproduct", { message: "success", sendcategory: category });
  } catch (error) {
    next(error);
  }
};

//rendering product view
const productview = async (req, res,next) => {
  try {
    let sendproduct = await Product.find({}).populate("category");
    console.log(sendproduct);
    res.render("productlist", { vsendproduct: sendproduct });
  } catch (error) {
    next(error);
  }
};

//delete product
const productdelete = async (req, res,next) => {
  try {
    let id = req.params.id;
    await Product.deleteOne({ _id: id });
    res.redirect("/admin/productlist");
  } catch (error) {
    next(error);
  }
};

//product editview
const editproView = async (req, res,next) => {
  try {
    const category = await Category.find({});
    const id = req.params.id;
    console.log(id);
    const productcategory = await Product.findById({ _id: id }).populate(
      "category"
    );
    res.render("editproductview", {
      sendcategory: category,
      sendproduct: productcategory,
    });
  } catch (error) {
    next(error);
  }
};
const editproduct = async (req, res,next) => {
  try {
    let productName = req.body.productName;
    let category = req.body.category;
    let description = req.body.description;
    let stock = req.body.stock;
    let price = req.body.price;
    let id = req.params.id;

    // Retrieve the existing product from the database

    // Concatenate the existing image array with the new images

    await Product.updateOne(
      { _id: id },
      {
        $set: {
          productName: productName,
          category: category,
          description: description,
          stock: stock,
          price: price,
          // image: updatedImageArray
        },
      }
    );

    res.redirect("/admin/productlist");
  } catch (error) {
    next(error);
  }
};

const editimg = async (req, res,next) => {
  try {
    console.log("inserting imageee");

    const imgArray = [];
   

    for (file of req.files) {
      imgArray.push(file.filename);
    }
    const id = req.params.id;
    const updateImage = await Product.updateOne(
      { _id: id },
      { $push: { image: { $each: imgArray } } }
    );
    res.redirect("/admin/productlist/editproductview/" + id);
  } catch (error) {
    next(error);
  }
};

const deleteimg = async (req, res,next) => {
  try {
    const imgid = req.params.imgid;
    const proid = req.params.proid;
    fs.unlink(path.join(__dirname, "../public/images/", imgid), () => {});
    const productData = await Product.updateOne(
      { _id: proid },
      { $pull: { image: imgid } }
    );
    console.log("image id" + imgid);
    res.redirect("/admin/productlist/editproductview/" + proid);
  } catch (error) {
    next(error);
  }
};

const unlistProduct = async (req, res,next) => {
  try {
    const id = req.params.id;
    const data = await Product.findOne({ _id: id });
    if (data.unlist == true) {
      let unlist = await Product.updateOne(
        { _id: id },
        { $set: { unlist: false } }
      );
      res.redirect("/admin/productlist");
    } else {
      let unlist = await Product.updateOne(
        { _id: id },
        { $set: { unlist: true } }
      );
      res.redirect("/admin/productlist");
    }
  } catch (error) {
    next(error);
  }
};

//search products
const searchproduct = async (req, res, next) => {
  try {
    const data = req.body.search;

    const result = new RegExp(data, "i");
    if (req.session.user) {
      const user = req.session.user;
      const userData = await UserData.findOne({ _id: user._id });
      const data = req.body.search;

      const productData = await Product.find({ productName: result }).populate(
        "category"
      );
      const category = await Category.find({});
      const procount = await Product.find({}).countDocuments();
      res.render("shop", {
        product: productData,
        userData: userData,
        category: category,
        procounts: procount,
      });
    } else {
      let userData;
      const category = await Category.find({});
      const procount = await Product.find({}).countDocuments();
      const productData = await Product.find({ productName: result }).populate(
        "category"
      );

      res.render("shop", {
        product: productData,
        userData: userData,
        category: category,
        procounts: procount,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  productview,
  addProduct,
  addNewProduct,
  productdelete,
  editproView,
  editproduct,
  unlistProduct,
  editimg,
  deleteimg,
  searchproduct,
};
