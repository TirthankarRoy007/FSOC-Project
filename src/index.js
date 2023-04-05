require('dotenv').config()
const express=require('express')
const mongoose=require('mongoose')
const router=require('./route/route')

const app=express()
app.use(express.json())
mongoose.set('strictQuery', true);
mongoose.connect(process.env.SECRET_KEY)
    .then(() => console.log("MongoDB is Connected"))
    .catch((err) => console.error(err))

app.use("/",router)

app.listen(process.env.PORT || Port,()=>{
    console.log("Express App Running On Port " + 3000)
})