const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId
const ticketModel = new mongoose.Schema(
    {
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['TODO', 'INPROGRESS', 'DONE'],
        default: 'TODO'
    },
    assignee: {
        type: ObjectId,
        ref: 'User'
    },
    comments: [{
      author: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
      content: {
        type: String,
        required: true
    },
      createdAt: {
        type: Date,
        default: Date.now
    },
    }],
  }, { timestamps: true });

  module.exports = mongoose.model('Ticket', ticketModel)
  