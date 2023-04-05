const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId
const projectModel = new mongoose.Schema(
    {
    name: {
        type: String,
        required: true
    },
    admin: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: ObjectId,
        ref: 'User'
    }],
    tickets: [{
        type: ObjectId,
        ref: 'Ticket'
    }],
    isDeleted: {
        type: Boolean,
        default: false
    },
  }, { timestamps: true });
  
  module.exports = mongoose.model('Project', projectModel)