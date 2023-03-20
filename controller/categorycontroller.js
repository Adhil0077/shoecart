//required module of admin category
const Category = require('../model/admincategory')


//rendering category list page with details
const admin_category = async (req, res,next) => {
  try {
    const categorydata = await Category.find({})
    res.render('category', { categoryData: categorydata })
  } catch (error) {
    next(error);
  }
}

//rendering add category page
const add_category = async (req, res,next) => {
  try {
    res.render('addcategory')
  }
  catch (error) {
    next(error);
  }
}


//insert new category
const addNewCategory = async (req, res,next) => {
  try {
    const capcategory = req.body.newcategory
    const capital = capcategory.toUpperCase()
    if (capcategory == ' ') {
      // console.log(capcategory)
      res.render('addcategory', { message: "field should be filled" })
    } else {
      let result = await Category.findOne({ category: capital })
      if (result) {
        result = null
        res.render('addcategory', { message: "Category already exists" })
      } else {

        const newCategory = new Category({
          category: capital,
          description: req.body.description
        })

        const CategoryData = await newCategory.save()
        if (CategoryData) {
          res.render("addcategory", { message: "New Category added" })
        }
        else {
          res.render('addcategory', { message: "No Category is added" })
        }
      }
    }
  }
  catch (error) {
    next(error);
  }
}


//category delete
const deletecategory = async (req, res,next) => {
  try {
    let id = req.params.id
    await Category.deleteOne({ _id: id })
    res.redirect('/admin/category')
  } catch (error) {
    next(error);
  }
}

//view edit category page
const vieweditcategory = async (req, res,next) => {
  try {
    let id = req.params.id
    const categorydata = await Category.findById({ _id: id })
    res.render('editcategory', { vcategory: categorydata })

  } catch (error) {
    next(error);
  }
}


const editcategory = async (req, res,next) => {
  try {
    let newData = req.body.newcategory
    // trim spaces from the beginning and end of the input
    newData = newData.trim();
    let capData = newData.toUpperCase()
    let newdescription = req.body.newdescription
    let id = req.params.id
    const collectedData = await Category.findById({ _id: id })
    const allCategory = await Category.findOne({ category: capData })
    if (collectedData.category === capData) {
      if (collectedData.description == newdescription) {
        res.render('editcategory', { message: "No changes made", vcategory: collectedData })
      } else {
        await Category.updateOne({ _id: id }, { $set: { category: capData, description: newdescription } })
        res.redirect('/admin/category')
      }
    } else if (allCategory) {
      res.render('editcategory', { message: "Category already exists", vcategory: collectedData })
    } else if (newData.length === 0) {
      // category name contains only spaces, show an error message
      res.render('editcategory', { message: "Category name can't be only spaces", vcategory: collectedData })
    } else {
      await Category.updateOne({ _id: id }, { $set: { category: capData, description: newdescription } })
      res.redirect('/admin/category')
    }
  } catch (error) {
    next(error);
  }
}

const unlistCategory = async (req, res,next) => {

  try {
    const id = req.params.id
    const data = await Category.findOne({ _id: id })           //------->,{unlist:1,_id:0}
    if (data.unlist == true) {
      const unlist = await Category.updateOne({ _id: id }, { $set: { unlist: false } })
      res.redirect('/admin/category')
    } else {
      const unlist = await Category.updateOne({ _id: id }, { $set: { unlist: true } })
      res.redirect('/admin/category')
    }

  }
  catch (error) {
    next(error);
  }
}






module.exports = {
  admin_category,
  add_category,
  addNewCategory,
  deletecategory,
  vieweditcategory,
  editcategory,
  unlistCategory

}




