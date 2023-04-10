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
    },
    members: [{
        user: {
            type: ObjectId,
            ref: 'User'
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        isMember:  {
            type: Boolean,
            default: false
       },
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