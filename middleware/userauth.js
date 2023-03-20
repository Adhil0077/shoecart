const islogin = async(req,res,next)=>{
  try {
    if(req.session.user){
      
    }
    else{
      return res.redirect('/')
    }
    next()
  } catch (error) {
    console.log(error.message)
  }
}


const islogout = async(req,res,next)=>{
  try {
    if(req.session.user){
      return res.redirect('/')
    }
    next()
  } catch (error) {
    console.log(error.message);
  }
}


module.exports = {
  islogin,
  islogout
}