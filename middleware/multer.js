//multer
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, path.join(__dirname, '../public/images'))
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname
    cb(null, name)
  }
})


const upload = multer({ storage: storage })


module.exports = upload