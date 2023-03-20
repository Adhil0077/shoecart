const mongoose = require('mongoose')

require('dotenv').config()
mongoose.connect(process.env.mongo_url)
const nocache = require('nocache')

const express = require('express')
const app = express()
app.use(nocache())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//mongoose
const razorpay=require('razorpay')

const logger= require('morgan')
// app.use(logger('dev'))

//session
const session = require('express-session')
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

//path
const path = require('path')
app.use(express.static(path.join(__dirname,"public")))


//admin login page
const adminRoute = require('./routes/adminRoute')
app.use('/admin',adminRoute)



//user home page
const userRoute = require('./routes/userRoute')
app.use('/',userRoute)

app.use((err,req,res,next)=>{
  console.log(err.stack);
  res.status(500).send(err.stack)
})


app.listen(3000,()=>{
  console.log('Server Started')
})