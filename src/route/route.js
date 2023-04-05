const express = require('express');
const router = express.Router();

const {loginUser,userSignUp} = require("../controller/authController")

//Auth-Controller
router.post("/register", userSignUp)
router.post("/login", loginUser)

router.all("/*", (req, res) => {
    res.status(400).send({ status: false, message: "This page does not exist, please check your url" })
})

// router.get('/healthCheck', function (req, res) {
//     res.send('App is running successfully')
// });



module.exports = router