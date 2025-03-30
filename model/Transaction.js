const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    choice:{
      type: String,
      enum: ['heads', 'tails'],
      required: true,
    },
    result:{
      type: String,
      enum: ['Win', 'Loss'],
      required: true,
    },
    
    amount: {
        type: Number,
        required: true,
      },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;