const UserModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const {isValidEmail,isValidName,isValidPassword,isValidString} = require('../validations/validator')
const bcrypt = require('bcrypt')

//---------------------------------------  Sign-Up User    -------------------------------------------------


exports.userSignUp = async (req, res)=>{
    try{
        const {name, email, company, password} = req.body

        if (!name) {
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
            return res.status(400).send({ status: false, message: "Entered String is not Valid" })
          }
        
        if (!password) {
            return res.status(400).send({ status: false, message: "Password is required" })
          }
        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Password requirements didn't match" })
          }

      //Hashing
        const saltRounds = 10;
        const hash = bcrypt.hashSync(password, saltRounds)


        const userData = {
          name: name, email: email,
          password: hash, company: company
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
  
      let verifyUser = await UserModel.findOne({ email: email, password: password });
      if (!verifyUser)
        return res.status(400).send({ status: false, message: "Invalid Login Credential" });   
  
      const userToken = jwt.sign({ userId: verifyUser._id }, process.env.SECUKEY, { expiresIn: 30000 })
  
      const userTokenData = jwt.decode(userToken)
      userTokenData.iat = new Date(userTokenData.iat*1000).toGMTString()
      userTokenData.exp = new Date(userTokenData.exp*1000).toGMTString()
  
      return res.status(200).send({status: true,message: 'Success',data: {userToken: userToken,...userTokenData
          }
      })
    } catch (error) {
      res.status(500).send({ status: false, message: error.message });
    }
  };