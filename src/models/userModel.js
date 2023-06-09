const mongoose = require('mongoose')
const userModel = new mongoose.Schema(
    {
    name: { 
        type: String,
        required: true 
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    company: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    secretQuestion: {
        question: {
            type: String,
            required: true
        },
        answer: {
            type: String,
            required: true
        }
    }
  }, { timestamps: true });

  module.exports = mongoose.model('User', userModel)