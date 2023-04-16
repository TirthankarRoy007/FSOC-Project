require('dotenv').config()
const express=require('express')
const mongoose=require('mongoose')
const router=require('./route/route')
const cookieParser = require('cookie-parser');
var cors = require('cors')

const app=express()
app.use(cors())
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
    });
app.use(cookieParser());
app.use(express.json())
mongoose.set('strictQuery', true);
mongoose.connect(process.env.SECRET_KEY)
    .then(() => console.log("MongoDB is Connected"))
    .catch((err) => console.error(err))

app.use("/",router)

app.listen(process.env.PORT || Port,()=>{
    console.log("Express App Running On Port " + process.env.PORT)
})