const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  razorpay_order_id: {
    type: String,
    // required: true,
  },
  razorpay_payment_id: {
    type: String,
    // required: true,
  },
  razorpay_signature: {
    type: String,
    // required: true,
  },
  date :{ type: String,},
  planExpiryDate :{ type: String,},
  lastUpdated :{ type: String,},
  time :{ type: String,},
  amount :{ type: String,},
  planprofitPerDay : {type:Number},
  user : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String,  default: "booked" },
  plan : { type: mongoose.Schema.Types.ObjectId, ref: 'Plan'}
});

module.exports =mongoose.model("Payment", paymentSchema);
