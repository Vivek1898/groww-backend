const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({

  balance: {
    type: Number,
    default: 0
  },
  totalBalance:{
    type: Number,
    default: 0
  },
  lastTransactionDate: {
    type: Date,
    default: Date.now
  },
  latestBalance : {
    type: Number,
    default: 0
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  
  },
  lastUpdated :{ type: String,},
},

{ timestamps: true }
);

module.exports = mongoose.model('Wallet', walletSchema);
