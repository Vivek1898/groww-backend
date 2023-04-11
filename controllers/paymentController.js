// import { instance } from "../server.js";
const crypto = require("crypto");
const Payment = require("../models/paymentModel");
const Plan = require("../models/plans");
const Razorpay = require("razorpay");
const User = require("../models/user");
const { hashPassword, comparePassword } = require("../helpers/auth");
const Wallet = require("../models/wallet");
const schedule = require("node-schedule");
// import { Payment } from "../models/paymentModel.js";
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_APT_SECRET,
});

exports.checkout = async (req, res) => {
  const options = {
    amount: Number(req.body.amount * 100),
    currency: "INR",
  };
  const order = await instance.orders.create(options);
  console.log(order);

  res.status(200).json({
    success: true,
    order,
  });
};

exports.paymentVerification = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body.response;
  console.log(req.body);

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    try {
      let payment;
      if (req.body.planDelatils) {
        const today = new Date();
        const DAYS_IN_MS =
          req.body.planDelatils.planCompleteTime * 24 * 60 * 60 * 1000;
        const expiryDate = new Date(
          today.getTime() + DAYS_IN_MS
        );
        let formattedExpiryDate;
        if (expiryDate instanceof Date) {
           formattedExpiryDate = expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');
          // Use formattedExpiryDate to save the formatted expiry date to the planExpiryDate field
        } else {
          console.error('expiryDate is not a valid Date object:', expiryDate);
        }
        const IST_TIME_ZONE = 'Asia/Kolkata';

        const now = new Date();
        const istDate = new Intl.DateTimeFormat('en-US', {
          timeZone: IST_TIME_ZONE,
        }).format(now);
        
        const istTime = now.toLocaleTimeString('en-US', {
          timeZone: IST_TIME_ZONE,
        });
        
       payment = await Payment.create({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          user: req.body.auth.user._id,
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
          amount: req.body.BookingData.amount / 100,
          date: istDate,
          planExpiryDate: formattedExpiryDate,
          planprofitPerDay: Number(req.body.planDelatils.profitPerDay),
          time: istTime,
          plan: req.body.planDelatils.id,
        });
        const populatedPlan = await Payment.findById(payment._id).populate(
          "plan"
        );
        console.log(populatedPlan);

        const wallet = await Wallet.findOne({ user: req.body.auth.user._id });

        if (!wallet) {
          const walletNew = new Wallet({
            user: req.body.auth.user._id,
            balance: 0,
            totalBalance: req.body.BookingData.amount / 100,
            latestBalance :req.body.BookingData.amount / 100,
          });
          await walletNew.save();
          console.log(wallet.totalBalance);
          // res.status(200).json({ sum : wallet.totalBalance, userId:req.body.auth.user._id, balance: 0 });
        } else {
          wallet.totalBalance += req.body.BookingData.amount / 100;
          wallet.latestBalance +=req.body.BookingData.amount / 100;
          await wallet.save();
          // res.status(200).json({ sum : wallet.totalBalance, userId:req.body.auth.user._id, balance: wallet.balance });
        }
      } else {
        payment = await Payment.create({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          user: req.body.auth.user._id,
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
          amount: req.body.BookingData.amount / 100,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
        });

        const wallet = await Wallet.findOne({ user: req.body.auth.user._id });

        if (!wallet) {
          const walletNew = new Wallet({
            user: req.body.auth.user._id,
            balance: 0,
            totalBalance: req.body.BookingData.amount / 100,
            latestBalance :req.body.BookingData.amount / 100,
          });
          await walletNew.save();
          console.log(wallet.totalBalance);
          // res.status(200).json({ sum : wallet.totalBalance, userId:req.body.auth.user._id, balance: 0 });
        } else {
          // wallet.totalBalance += req.body.BookingData.amount / 100;
          wallet.latestBalance +=req.body.BookingData.amount / 100;
          await wallet.save();
          // res.status(200).json({ sum : wallet.totalBalance, userId:req.body.auth.user._id, balance: wallet.balance });
        }
      }

      console.log("PLaan ");

      const populatedPayment = await Payment.findById(payment._id).populate(
        "user"
      );

      const user = await User.findById(populatedPayment.user._id);
      user.payments.push({
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount: req.body.BookingData.amount / 100,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      });
      await user.save();
      console.log(populatedPayment.user);

      // const wallet = await Wallet.findOne({ user: req.body.auth.user._id });

      // if (!wallet) {
      //   const walletNew = new Wallet({
      //     user: req.body.auth.user._id,
      //     balance: 0,
      //     totalBalance: req.body.BookingData.amount / 100,
      //     latestBalance :req.body.BookingData.amount / 100,
      //   });
      //   await walletNew.save();
      //   console.log(wallet.totalBalance);
      //   // res.status(200).json({ sum : wallet.totalBalance, userId:req.body.auth.user._id, balance: 0 });
      // } else {
      //   wallet.totalBalance += req.body.BookingData.amount / 100;
      //   wallet.latestBalance +=req.body.BookingData.amount / 100;
      //   await wallet.save();
      //   // res.status(200).json({ sum : wallet.totalBalance, userId:req.body.auth.user._id, balance: wallet.balance });
      // }
      // const expiryDays = req.body.planDelatils.planCompleteTime;
      // console.log(expiryDays);
      // const profitPerDay = req.body.planDelatils.profitPerDay;

      // let intervalRef = setInterval(async () => {
      //   const wallets = await Wallet.find({ user: req.body.auth.user._id });
      //   let wallet;

      //   wallet = wallets[0];
      //   wallet.balance += profitPerDay;

      //   await wallet.save();
      // }, 24 * 60 * 60 * 1000);

      // setTimeout(() => {
      //   clearInterval(intervalRef);
      // }, expiryDays * 24 * 60 * 60 * 1000);

      res.status(200).json({ payment_id: razorpay_payment_id });
      console.log("Success");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(400).json({
      success: false,
    });
  }
};



exports.manualAddPlans = async (req, res) => {

  console.log(req.body);

  const { name, email, password } = req.body.values;


  // hash password
  const hashedPassword = await hashPassword(password);

  try {

    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({
        error: "Email is taken",
      });
    }
    const user = await new User({
      name,
      email,
      password: hashedPassword,
    }).save();

    console.log("USER CREATED", user);
    const splan= await Plan.findById(req.body.selectedPlanId);
    const today = new Date();
    const DAYS_IN_MS =splan.planTime * 24 * 60 * 60 * 1000;
    const expiryDate = new Date(
      today.getTime() + DAYS_IN_MS
    );
    let formattedExpiryDate;
    if (expiryDate instanceof Date) {
       formattedExpiryDate = expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');
      // Use formattedExpiryDate to save the formatted expiry date to the planExpiryDate field
    } else {
      console.error('expiryDate is not a valid Date object:', expiryDate);
    }
    const IST_TIME_ZONE = 'Asia/Kolkata';

    const now = new Date();
    const istDate = new Intl.DateTimeFormat('en-US', {
      timeZone: IST_TIME_ZONE,
    }).format(now);
    
    const istTime = now.toLocaleTimeString('en-US', {
      timeZone: IST_TIME_ZONE,
    });

   const payment = await Payment.create({
     
      razorpay_payment_id :"by admin",
  
      user: user._id,
     
      
      amount: splan.planAmount,
      date: istDate,
      planExpiryDate: formattedExpiryDate,
      planprofitPerDay: Number(splan.planProfit),
      time: istTime,
      plan: req.body.selectedPlanId,
    });
    const populatedPlan = await Payment.findById(payment._id).populate(
      "plan"
    );
    console.log(populatedPlan);
    const wallet = await Wallet.findOne({ user: user._id });

    if (!wallet) {
      const walletNew = new Wallet({
        user: user._id,
        balance: 0,
        totalBalance: splan.planAmount ,
        latestBalance :splan.planAmount ,
      });
      await walletNew.save();
      // console.log(wallet.totalBalance);
      // res.status(200).json({ sum : wallet.totalBalance, userId:user._id, balance: 0 });
    } else {
      wallet.totalBalance += req.body.BookingData.amount / 100;
      wallet.latestBalance +=req.body.BookingData.amount / 100;
      await wallet.save();
      // res.status(200).json({ sum : wallet.totalBalance, userId:user._id, balance: wallet.balance });
    }

    res.status(200).json({ payment_id: "by admin" });



  } catch (error) {
    console.log("CREATE USER ERROR", error);
    return res.json({
      error: "Error saving user in database. Try signup again",
    });
  }

  return

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body.response;
  console.log(req.body);

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
    .update(body.toString())
    .digest("hex");
planTime
  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    try {
      let payment;
      if (req.body.planDelatils) {
        const today = new Date();
        const DAYS_IN_MS =
          req.body.planDelatils.planCompleteTime * 24 * 60 * 60 * 1000;
        const expiryDate = new Date(
          today.getTime() + DAYS_IN_MS
        );
        let formattedExpiryDate;
        if (expiryDate instanceof Date) {
           formattedExpiryDate = expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');
          // Use formattedExpiryDate to save the formatted expiry date to the planExpiryDate field
        } else {
          console.error('expiryDate is not a valid Date object:', expiryDate);
        }
        const IST_TIME_ZONE = 'Asia/Kolkata';

        const now = new Date();
        const istDate = new Intl.DateTimeFormat('en-US', {
          timeZone: IST_TIME_ZONE,
        }).format(now);
        
        const istTime = now.toLocaleTimeString('en-US', {
          timeZone: IST_TIME_ZONE,
        });
        
       payment = await Payment.create({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          user: req.body.auth.user._id,
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
          amount: req.body.BookingData.amount / 100,
          date: istDate,
          planExpiryDate: formattedExpiryDate,
          planprofitPerDay: Number(req.body.planDelatils.profitPerDay),
          time: istTime,
          plan: req.body.planDelatils.id,
        });
        const populatedPlan = await Payment.findById(payment._id).populate(
          "plan"
        );
        console.log(populatedPlan);

        const wallet = await Wallet.findOne({ user: req.body.auth.user._id });

        if (!wallet) {
          const walletNew = new Wallet({
            user: req.body.auth.user._id,
            balance: 0,
            totalBalance: req.body.BookingData.amount / 100,
            latestBalance :req.body.BookingData.amount / 100,
          });
          await walletNew.save();
          console.log(wallet.totalBalance);
          // res.status(200).json({ sum : wallet.totalBalance, userId:req.body.auth.user._id, balance: 0 });
        } else {
          wallet.totalBalance += req.body.BookingData.amount / 100;
          wallet.latestBalance +=req.body.BookingData.amount / 100;
          await wallet.save();
          // res.status(200).json({ sum : wallet.totalBalance, userId:req.body.auth.user._id, balance: wallet.balance });
        }
      } else {
        payment = await Payment.create({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          user: req.body.auth.user._id,
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
          amount: req.body.BookingData.amount / 100,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
        });

        const wallet = await Wallet.findOne({ user: req.body.auth.user._id });

        if (!wallet) {
          const walletNew = new Wallet({
            user: req.body.auth.user._id,
            balance: 0,
            totalBalance: req.body.BookingData.amount / 100,
            latestBalance :req.body.BookingData.amount / 100,
          });
          await walletNew.save();
          console.log(wallet.totalBalance);
          // res.status(200).json({ sum : wallet.totalBalance, userId:req.body.auth.user._id, balance: 0 });
        } else {
          // wallet.totalBalance += req.body.BookingData.amount / 100;
          wallet.latestBalance +=req.body.BookingData.amount / 100;
          await wallet.save();
          // res.status(200).json({ sum : wallet.totalBalance, userId:req.body.auth.user._id, balance: wallet.balance });
        }
      }

      console.log("PLaan ");

      const populatedPayment = await Payment.findById(payment._id).populate(
        "user"
      );

      const user = await User.findById(populatedPayment.user._id);
      user.payments.push({
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount: req.body.BookingData.amount / 100,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      });
      await user.save();
      console.log(populatedPayment.user);

      
      res.status(200).json({ payment_id: razorpay_payment_id });
      console.log("Success");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(400).json({
      success: false,
    });
  }
};












exports.addPayment = async (req, res) => {
  //console.log(req.body);
  

  try {
    const today = new Date();
    const DAYS_IN_MS =
      req.body.planDelatils.planCompleteTime * 24 * 60 * 60 * 1000;
    const expiryDate = new Date(
      today.getTime() + DAYS_IN_MS
    ).toLocaleDateString();

   const payment = await Payment.create({
      razorpay_order_id : "Through Walllet",
      // razorpay_payment_id,
      // razorpay_signature,
      user: req.body.auth.user._id,
      // payment_id: razorpay_payment_id,
      // order_id: razorpay_order_id,
      amount: Number(req.body.planDelatils.amount )/ 100,
      date: new Date().toLocaleDateString(),
      planExpiryDate: expiryDate,
      planprofitPerDay:Number(req.body.planDelatils.profitPerDay),

      time: new Date().toLocaleTimeString(),
      plan: req.body.planDelatils.id,
    });
    const populatedPlan = await Payment.findById(payment._id).populate(
      "plan"
    );
    console.log(populatedPlan);

    const wallet = await Wallet.findOne({ user: req.body.auth.user._id });
    wallet.totalBalance += Number(req.body.planDelatils.amount ) ;
    wallet.latestBalance -=Number(req.body.planDelatils.amount ) ;
    await wallet.save();

    res.status(200).json({ wallet: wallet, payment: populatedPlan });

    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
    
  }



}




exports.getPayments = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await Payment.find({
      $and: [
        { user: userId },
        { razorpay_payment_id: { $exists: true } }
      ]
    })
    .sort({ _id: -1 })
    .populate('user')
    .populate('plan');

    res.status(200).json({
      success: true,
      payments: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.adminGetPayments = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await Payment.find()
    .sort({ _id: -1 })
    .populate('user')
    .populate('plan');

    res.status(200).json({
      success: true,
      payments: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};




exports.updateWaletPerDay = async (req, res) => {
  const { userId } = req.params;

  try {

    const user = await Payment.find({ plan: { $exists: true } })
    .sort({ _id: -1 })
    .populate('user')
      .populate('plan')
      .sort({ _id: -1 });

    res.status(200).json({
      success: true,
      payments: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.subscribedPlanForUsers = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await Payment.find({
      user: userId,
      plan: { $exists: true },
    })
      .sort({ _id: -1 })
      .populate("user")
      .populate("plan")
      .sort({ _id: -1 });

    res.status(200).json({
      success: true,
      payments: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};








exports.getPayments2 = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await Payment.find({ user: userId }).sort({ _id: -1 });
  

    res.status(200).json({
      success: true,
      payments: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.cancelBookings = async (req, res) => {
  console.log("Cancell Bookings");
  const { BookingIdToCancel } = req.params;
  try {
    const booking = await Payment.findOne({
      razorpay_payment_id: BookingIdToCancel,
    });
    console.log(booking);
    booking.status = "cancelled";
    await booking.save();
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.walletSum2 = async (req, res) => {
  const userId = req.params.userId;

  try {
    const payments = await Payment.find({ user: userId });
    const sum = payments.reduce(
      (acc, payment) => acc + parseInt(payment.amount),
      0
    );
    res.status(200).json({ sum });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.walletSumReal = async (req, res) => {
  const userId = req.params.userId;
  console.log(userId);
  try {
    const payments = await Payment.find({ user: userId });
    let sum = 0;
    for (let i = 0; i < payments.length; i++) {
      if (payments[i].status === "booked") {
        // const sumUpdated = payments.reduce(
        //   (acc, payment) => acc + parseInt(payment.amount),
        //   0
        // );
        sum += Number(payments[i].amount);
        // console.log(sumUpdated);
        // sum=Number(sumUpdated);
      }
    }

    // create wallet if not exists

    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      const walletNew = new Wallet({
        user: userId,
        balance: 0,
      });
      await walletNew.save();
      console.log(walletNew);
      res.status(200).json({ sum, userId, balance: 0 });
    } else {
      res.status(200).json({ sum, userId, balance: wallet.balance });
    }

    // Update payment amount every hour
    setInterval(async () => {
      const wallets = await Wallet.find({ user: userId });
      let wallet;

      wallet = wallets[0];
      wallet.balance += 100;

      await wallet.save();
    }, 60 * 60 * 1000); // 1 hour in milliseconds
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.walletSum = async (req, res) => {
  const userId = req.params.userId;
  console.log(req.body);

  console.log(userId);
  try {
    const payments = await Payment.find({ user: userId }).sort({ _id: -1 });
    // let sum = 0;
    // for (let i = 0; i < payments.length; i++) {
    //   if (payments[i].status === "booked") {
    //     sum += Number(payments[i].amount);
    //   }
    // }

    // create wallet if not exists

    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      const walletNew = new Wallet({
        user: userId,
        balance: 0,
        totalBalance: 0,
        latestBalance:0
      });
      await walletNew.save();
      // console.log(wallet.totalBalance);
      res.status(200).json({ sum: walletNew.totalBalance, userId, balance: 0,latestBal:walletNew.latestBalance });
    } else {
      // wallet.totalBalance  += sum;
      // await wallet.save();
      res
        .status(200)
        .json({ sum: wallet.totalBalance, userId, balance: wallet.balance,latestBal:wallet.latestBalance });
    }
    // setInterval(async () => {
    //   const wallets = await Wallet.find({ user: userId });
    //   let wallet;

    //   wallet = wallets[0];
    //   wallet.balance += 1;

    //   await wallet.save();
    // }, 60 *60* 1000);

    // let intervalRef = setInterval(async () => {
    //   const wallets = await Wallet.find({ user: userId });
    //   let wallet;

    //   wallet = wallets[0];
    //   wallet.balance += 1;

    //   await wallet.save();
    // }, 24 * 60 * 60 * 1000);

    // setTimeout(() => {
    //   clearInterval(intervalRef);
    // }, 10 * 24 * 60 * 60 * 1000); // clear after 10 days in milliseconds
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};




exports.allWallets = async (req, res) => {
  try {
    console.log("From Wllets")

    const wallets = await Wallet.find().populate('user');
    res.status(200).json({ wallets }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};






exports.getWallet = async (req, res) => {
  const userId = req.params.userId;

  try {
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    res.status(200).json({ balance: wallet.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};


exports.getNumbers = async (req, res) => {
  try {
    const transactions = await Payment.countDocuments();
    const users = await User.countDocuments();
    const plans = await Plan.countDocuments();
    const wallets = await Wallet.countDocuments();
    const latestBalances = await Wallet.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalBalance" }
        }
      }
    ]);
    const latestBalance = latestBalances.length > 0 ? latestBalances[0].total : 0;

    return res.json({ plans, users, transactions, wallets, latestBalance });
  } catch (err) {
    console.log(err);
  }
};