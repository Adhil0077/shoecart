const { model } = require('mongoose')
const ads = require('../model/bannermodel')


//view banner page
const bannerview = async(req,res,next)=>{
  try {

    const bannerDetails = await ads.find({})
    res.render('banner',{banner:bannerDetails})
    
  } catch (error) {
    next(error)
  }
}

//view add banner
const addBannerView = async(req,res,next)=>{
  try {

    res.render('addbanner')
    
  } catch (error) {
    next(error)
  }
}



//add new Banner
const addNewBanner = async(req,res,next)=>{
  try {
    const BannerImg = req.file.filename
    // console.log( req.body);
    const newbannerDes = req.body.bannerDes.trim()
    if(!newbannerDes){
      return res.render('addbanner',{message:"All fields required"})
    }
    const addBanner  = new ads({
      img:BannerImg,
      description:newbannerDes
    })
const save = await addBanner.save()
res.redirect('/admin/banner')
    }
   catch (error) {
    next(error)
  } 
}

//delete banner
const deleteBanner = async(req,res,next)=>{
  try {
    const bannerId = req.body.banner
    // console.log(req.body);
    const deleteBanner = await ads.deleteOne({_id:bannerId})
    res.json({success:true})
  } catch (error) {
    next(error)
  }
}




module.exports = {
  bannerview,
  addBannerView,
  addNewBanner,
  deleteBanner,
}

