const mongoose = require("mongoose");
const { Schema } = mongoose;

const planSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    planTime: {
      type: Number,
    },
    planAmount: {
      type: Number,
    },
    planProfit: {
      type: Number,
    },
    planTotalIncome: {
      type: Number,
    },
    isActive:{ type:Boolean,default:true},
    payments : { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);
