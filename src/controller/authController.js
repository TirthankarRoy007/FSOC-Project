const UserModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const {isValidEmail,isValidName,isValidPassword,isValidString} = require('../validations/validator')
const bcrypt = require('bcrypt')

//---------------------------------------  Sign-Up User    -------------------------------------------------


exports.userSignUp = async (req, res)=>{
    try{
        const {name, email, company, password, secretQuestion} = req.body

        if (!name || name === " ") {
            return res.status(400).send({ status: false, message: "Name is required" })
          }
        if (!isValidName(name)) {
            return res.status(400).send({ status: false, message: "Please enter valid name" })
          }

        if (!email) {
            return res.status(400).send({ status: false, message: "Email-Id is required" })
          }
        if (!isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Invalid Email" })
          }
        
        //Checking if the email already exsists in the DataBase

          let checkEmail = await UserModel.findOne({ email: email })
          if (checkEmail) {
            return res.status(400).send({ status: false, message: "Email already exist" })
          }

        if (!company) {
            return res.status(400).send({ status: false, message: "Company is required" })
          }
          if (!isValidString(company)) {
            return res.status(400).send({ status: false, message: "Company Name is not Valid" })
          }
        
        if (!password) {
            return res.status(400).send({ status: false, message: "Password is required" })
          }
        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Password rmust be of minimum 8 and maximum 15 characters including minimum one lower, one uppercase character, one special character and atleast one number" })
          }

        if(!secretQuestion.question) {
          return res.status(400).send({status: true, message: "Secret Question must be provided"})
        }
        if(!secretQuestion.answer) {
          return res.status(400).send({status: true, message: "Answer must be provided"})
        }

      //Hashing
        const saltRounds = 10;
        const hash = bcrypt.hashSync(password, saltRounds)

        const saltRounds2 = 10;
        const secretAnswerHash = bcrypt.hashSync(secretQuestion.answer, saltRounds2);


        const {question} = secretQuestion
        const userData = {
          name: name, email: email,
          password: hash, company: company, secretQuestion: {question, answer: secretAnswerHash}
        }
        
        await UserModel.create(userData)
          res.status(200).send({ status: true, message: "Sign-Up Successful "})
    }
    catch (err) {
        res.status(500).send(err.message)
      }
}

//---------------------------------------  Login User    -------------------------------------------------

exports.loginUser = async (req, res)=> {
    try {
      let { email, password } = req.body;
  
      if (Object.keys(req.body).length === 0) {
        return res.status(400).send({ status: false, message: "Please Input User Details" });
      }
  
      if (!email) {
        return res.status(400).send({ status: false, message: "Email-Id is mandatory" });
      }
      if (!isValidEmail(email)) {
        return res.status(400).send({ status: false, message: "EmailId should be Valid" });
      }
      if (!password) {
        return res.status(400).send({ status: false, message: "Password is mandatory" });
      }
      if (password.length < 8 || password.length > 15) {
        return res.status(400).send({ status: false, message: "the length of password must be min:- 8 or max: 15" });
      }
  
      let verifyUser = await UserModel.findOne({ email: email});
      if (!verifyUser)
        return res.status(400).send({ status: false, message: "Invalid Login Credential" });   
      
      let oldPass = verifyUser.password
      let isMatch = await bcrypt.compare(password, oldPass)
      if(!isMatch){
        return res.status(400).send({ status: false, message: "Invalid Login Credential" });   
      }
      const userToken = jwt.sign({ userId: verifyUser._id }, process.env.SECUKEY, { expiresIn: 30000 })
  
      return res.status(200).cookie('token', userToken).send({status: true,message: 'Success',data: userToken})
    } catch (error) {
      res.status(500).send({ status: false, message: error.message });
    }
  };

  exports.forgotPassword = async(req,res)=>{
    try{
      let data = req.body
      if(!data.email) return res.status(400).send({status: false, message: "Email is Mandatory"})
      let findUser = await UserModel.findOne({email: data.email})
      if(!findUser) return res.status(400).send({status: false, message: "User Not found with Provided Email"})
      data.secretQuestion = findUser.secretQuestion.question
      return res.status(200).send({status: true, data: data})
    } catch(err){
        return res.status(500).send({status: false, err})
    }
  }

  exports.resetPassword = async(req,res)=>{
    let data = req.body

    if(!data.email) return res.status(400).send({status: false, message: "Email is mandatory"})
    if(!data.secretQuestion) return res.status(400).send({status: false, message: "Secret Question is Mandatory"})
    if(!data.answer) return res.status(400).send({status: false, message: "Answer to secret question is mandatory"})

    let findUser = await UserModel.findOne({email: data.email})
    if(!findUser) return res.status(400).send({status: false, message: "User Not found with Provided Email"})

    let answer = await bcrypt.compare(data.answer,findUser.secretQuestion.answer)
    if(!answer) return res.status(400).send({status:false,Message:"Given Answer is wrong"})

    if (data.secretQuestion !== findUser.secretQuestion.question) {
      return res.status(400).send({ status: false, message: "Secret question is wrong" })
    }

    if(!data.newPassword) return res.status(400).send({status: false, message: "New Password is Mandatory"})

    if(!isValidPassword(data.newPassword)) return res.status(400).send({status: false, message: "Password requirement didn't match"})   
    
    const saltRounds = 10;
    const hash = bcrypt.hashSync(data.newPassword, saltRounds)
    data.newPassword = hash

    let updatedPass = await UserModel.findOneAndUpdate({email: data.email}, {password: data.newPassword})
    return res.status(200).send({status: true, message: "Password Changed Successfully"})
  }