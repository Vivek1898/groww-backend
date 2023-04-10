const mongoose = require("mongoose");
const { Schema } = mongoose;

const refundSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
    },
    mobile: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      trim: true,
    },
    upi: {
      type: String,
      trim: true,
    },
    bankName: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: String,
      trim: true,
    },
    ifscCode: {
      type: String,
      trim: true,
    },
    user : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Refund", refundSchema);
