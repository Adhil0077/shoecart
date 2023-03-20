// schema of admin
const admin = require("../model/adminmodel");
const Users = require("../model/usermodel");
const order = require("../model/orders");
const category = require("../model/admincategory");
const Product = require("../model/productlist");
const orders = require("../model/orders");

let session;

//render login page
const adminLogin = async (req, res,next) => {
  try {
    res.render("adminlogin");
  } catch (error) {
    next(error);
  }
};

//verification of login with session
const loginverify = async (req, res,next) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const adminData = await admin.findOne({ username: username });
    if (adminData) {
      if (password === adminData.password) {
        req.session.admin_id = adminData._id;
        res.redirect("/admin/dashboard");
      } else {
        res.render("adminlogin", { message: " Password is incorrect" });
      }
    } else if (username == "" && password == "") {
      res.render("adminlogin", { message: "User and passwoard required" });
    } else {
      res.render("adminlogin", { message: "Enter a valid username" });
    }
  } catch (error) {
    next(error);
  }
};

//rendering dashboard
const loadDashboard = async (req, res,next) => {
  try {
    //Payment methods used-PIE
    const COD = await order.findOne({ paymentType: "COD" }).count();
    const UPI = await order.findOne({ paymentType: "ONLINE" }).count();
    const WALLET = await order.findOne({ paymentType: "WALLET" }).count();

    // Category wise sales-DOGNUT
    const completedOrders = await order.find({ status: "Delivered" }).populate({
      path: "product.productId",
      populate: {
        path: "category",
        model: category,
      },
    });

    const categoryCount = {};
    completedOrders.forEach((order) => {
      order.product.forEach((product) => {
        const category = product.productId.category.category;
        if (category in categoryCount) {
          categoryCount[category] += 1;
        } else {
          categoryCount[category] = 1;
        }
      });
    });
    const sortedCategoryCount = Object.entries(categoryCount).sort(
      (a, b) => b[1] - a[1]
    );

    const count = sortedCategoryCount.map((innerArray) => innerArray[1]);

    const categoryName = sortedCategoryCount.map((cb) => {
      return cb[0];
    });
    // const salesByCategory = [];

    // completedOrders.forEach((order) => {
    //   order.product.forEach((product) => {
    //     const categoryId = product.productId.category.toString();

    //     if (!salesByCategory[categoryId]) {
    //       salesByCategory[categoryId] = {
    //         category: product.productId.category,
    //         totalSale: 0,
    //       };
    //     }
    //     salesByCategory[categoryId].totalSale += product.singleTotal;
    //   });
    // });
    // var category;
    // var totalSale;
    // for (const categoryId in salesByCategory) {
    //   category = salesByCategory[categoryId].category;
    //   totalSale = salesByCategory[categoryId].totalSale;

    //   console.log(`Category: ${category.category}, Total sale: ${totalSale}`);
    // }

    // console.log(salesByCategory);

    //total sales line
    const totalSalesLine = await order.aggregate([
      {
        $match: {
          status: {
            $eq: "Delivered",
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          sales: { $sum: "$total" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $limit: 7,
      },
    ]);
    const date = totalSalesLine.map((item) => {
      return item._id;
    });
    const sales = totalSalesLine.map((item) => {
      return item.sales;
    });

    //total revenue
    const toatalrevenue = await order.aggregate([
      {
        $match: {
          status: {
            $eq: "Delivered",
          },
        },
      },
      {
        $group: {
          _id: null,
          revenue: {
            $sum: "$total",
          },
        },
      },
    ]);

    //total sales count
    const countsales = await order.find({ status: "Delivered" }).count();

    //total users
    const countusers = await Users.find({}).count();

    // top 5 selling product
    const topFivesales = await order.aggregate([
      { $match: { status: { $eq: "Delivered" } } },
      { $unwind: { path: "$product" } },
      {
        $group: {
          _id: "$product.productId",
          sum: { $sum: "$product.quantity" },
        },
      },
      { $sort: { sum: -1 } },
      { $limit: 5 },
    ]);

    var findProduct = [];
    for (let i = 0; i <= topFivesales.length; i++) {
      found = await Product.find({ _id: topFivesales[i] });
      findProduct.push(found);
    }

    const sum = topFivesales.map((item) => {
      return item.sum;
    });
    res.render("dashboard", {
      COD,
      UPI,
      WALLET,
      sortedCategoryCount,
      count,
      categoryName,
      totalSalesLine,
      toatalrevenue,
      date,
      sales,
      countsales,
      countusers,
      findProduct,
      topFivesales,
      sum,
    });
  } catch (error) {
    next(error);
  }
};

//logout
const logout = async (req, res,next) => {
  try {
    req.session.admin_id = null;
    res.redirect("/admin");
  } catch (error) {
    next(error);
  }
};

//userpage
const user = async (req, res,next) => {
  try {
    const users = await Users.find({});

    res.render("user", { user: users });
  } catch (error) {
    next("error");
  }
};

const blockuser = async (req, res,next) => {
  try {
    const id = req.params.id;
    const data = await Users.findOne({ _id: id });
    if (data.status == false) {
      const status = await Users.updateOne(
        { _id: id },
        { $set: { status: true } }
      );
      req.session.user = null;
    } else {
      const status = await Users.updateOne(
        { _id: id },
        { $set: { status: false } }
      );
    }

    res.redirect("/admin/user");
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
};

const salesview = async (req, res) => {
  try {
    res.render("sales");
  } catch (error) {
    next(error);
  }
};

//sales report
const salesReport = async (req, res,next) => {
  try {
    const fromDate = req.body.from;
    const tillDate = req.body.till;
    const newfromDate = new Date(fromDate);
    const newtillDate = new Date(tillDate);
    newtillDate.setDate(newtillDate.getDate() + 1);

    const ordersDetails = await order
      .find({
        status: "Delivered",
        date: {
          $gte: fromDate,
          $lte: tillDate,
        },
      })
      .populate("product.productId");

    if (ordersDetails) {
      res.render("salesprint", { ordersDetails });
    } else {
      let ordersDetails;
      res.render("salesprint", { ordersDetails });
    }
  } catch (error) {
    next(error);
  }
};

//module exports
module.exports = {
  adminLogin,
  loginverify,
  loadDashboard,
  logout,
  user,
  blockuser,
  salesview,
  salesReport,
};
