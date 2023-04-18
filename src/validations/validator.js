const mongoose = require("mongoose");


//_________ Validations : Name  ________________

exports.isValidName = function (name) {
  const regexName = /^[a-zA-Z ]+$/;
  return regexName.test(name);
};

//_________ Validations : Company  ________________

exports.isValidString = function (value) {
    if (typeof value ==="undefined" || typeof value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    if (typeof value === "number" && value.trim().length === 0) return false  
    if (typeof value === "object") return false
  const regexTitle = /^[a-zA-Z ]+([0-9]+)?[!@#$%^&*_+=]?/;
  return regexTitle.test(value);
};

//________________Validations: Password_____________

exports.isValidPassword = (password) => {
    const regPass = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/
    return regPass.test(password)
  }

//_________ Validations : Email  ________________
  
exports.isValidEmail = function (email) {
    const regexEmail =
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regexEmail.test(email);
  };

//_________ Validations :  ObjectId ________________
 
exports.isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
  };