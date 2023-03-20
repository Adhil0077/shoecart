
// ADMIN========================================================================================================
const islogin = async(req,res,next)=>{
  try {
    if(req.session.admin_id)
    {}
    else{
     return res.redirect('/admin')
    }
    next()
  } catch (error) {
    console.log(error.message);
  }
}

const islogout = async(req,res,next)=>{
  try {
    if(req.session.admin_id){
      return res.redirect('/admin/dashboard')
    }
    else{

    }
    next()
  } catch (error) {
    console.log(error.message);
  }
}



module.exports = {
  islogin,
  islogout,
}