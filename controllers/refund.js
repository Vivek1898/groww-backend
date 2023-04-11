const Refund = require("../models/refund");
const wallet = require("../models/wallet");
const user = require("../models/user");
const Payment = require("../models/paymentModel");
exports.createRefund = async (req,res ) =>{
    try {
        const plan = await Refund.create(req.body);
        const populatedPayment = await Refund.findById(plan._id).populate(
            "user"
          );



        console.log(plan)
        res.status(201).json({
        success: true,
        plan,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
} 

exports.getRefund = async (req,res) =>{
    try {
        const refund = await Refund.find();
        res.status(200).json({
            success: true,
            refund
        })

    }catch(err){
        console.log(err);
        res.status(500).json({ error: "Server error" });
    }
}

exports.getRefundHistory = async (req,res) =>{
    try {
        const refund = await Refund.find({user:req.params.userId});
        console.log(refund)
        res.status(200).json({
            success: true,
            refund
        })

    }catch(err){
        console.log(err);
        res.status(500).json({ error: "Server error" });
    }
}

exports.updateWallet = async (req,res) =>{

    try {
      const IST_TIME_ZONE = 'Asia/Kolkata';

      const now = new Date();
      const istDate = new Intl.DateTimeFormat('en-US', {
        timeZone: IST_TIME_ZONE,
      }).format(now);
        const { BookingIdToUpdate } = req.params;
        const { amount } = req.body;
        console.log(amount);
        console.log(BookingIdToUpdate)
      const Wallet = await wallet.findById(BookingIdToUpdate);
      console.log(Wallet);
      Wallet.latestBalance=amount;
      Wallet.lastUpdated =istDate;
      Wallet.save();
      console.log(Wallet);

      res.status(200).json({
        success: true,
        Wallet
      })
      console.log("Wallet Updated");
    //  console.log(Wallet.user._id);
    }catch(err){
      res.status(500).json({ error: "Server error" });
      console.log(err);

    }

  }




exports.refundBookings = async (req, res) => {
    console.log("Refund Bookings");
    const { BookingIdToCancel } = req.params;
    const { amount } = req.body;
    console.log(amount);
    console.log(BookingIdToCancel)
    const refundBooking = await Refund.findById(BookingIdToCancel);
    console.log(refundBooking);
    console.log(refundBooking.user._id);
    

    try {
      const IST_TIME_ZONE = 'Asia/Kolkata';
      const now = new Date();
      const istDate = new Intl.DateTimeFormat('en-US', {
        timeZone: IST_TIME_ZONE,
      }).format(now);
      refundBooking.lastUpdated =istDate;
      refundBooking.save();
        // const users = await user.find({
        //     $and: [
        //       { email: BookingIdToCancel },
        //       { refunds: { $elemMatch: { refundId: refundIdToCancel } } }
        //     ]
        //   });
        // const users=await user.find({user:refundBooking.user._id});
        // console.log(users);
      
  //  if(users.length==0){
  //   return res.status(400).json({
  //       success: false,
  //       error: "User not found",
  //       });
  //   }
    const wallets= await wallet.find({user:refundBooking.user._id});
    console.log(wallets);
   
    
    let walletAmount=wallets[0].latestBalance;
    if(Number(amount)>walletAmount){
        return res.status(400).json({
            success: false,
            error: "Insufficient Balance",
          });
        
    }
    console.log(wallets.latestBalance)
    const newAmount=walletAmount-Number(amount);
    console.log(newAmount)
    wallets[0].latestBalance=Number(newAmount);
    // wallets[0].lastUpdated=istDate;
    await wallets[0].save();
    console.log(wallets);

    res.status(200).json({
        success: true,
        newAmount
        });

    console.log("Done Refund");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  };


  exports.updateBookings = async (req, res) => {
    // console.log("update Bookings");
    // console.log(req.body)
    // return
    const { userIdToUpdate } = req.params;
    const { amount } = req.body;

  
    console.log(amount)

    try {
      const IST_TIME_ZONE = 'Asia/Kolkata';
      const now = new Date();
      const istDate = new Intl.DateTimeFormat('en-US', {
        timeZone: IST_TIME_ZONE,
      }).format(now);
      
      const bookings = await Payment.updateOne({ _id: req.body.paymentId }, { lastUpdated : istDate });
      if (bookings.nModified === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      console.log(bookings);
      console.log("Booking Updated");
      // bookings.save();
    const wallets= await wallet.find({user:userIdToUpdate});
    console.log(wallets);
    
    let walletAmount=wallets[0].latestBalance;
    let profit=wallets[0].balance;
    if(Number(amount)<0){
        return res.status(400).json({
            success: false,
            error: "Balance should greater than 0",
          });
        
    }
    console.log(wallets.latestBalance)
    const newAmount=walletAmount+Number(amount);
    console.log(newAmount)
    wallets[0].latestBalance=Number(newAmount);
    const profitUpdatedPerDay =profit+ Number(amount)
    wallets[0].balance=profitUpdatedPerDay;
    await wallets[0].save();
    console.log(wallets);

    res.status(200).json({
        success: true,
        newAmount
        });

    console.log("Wallet Updated");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  };

  exports.changeRefundStatus = async (req, res) => {
    const{refundId}=req.params;
    const {  status } = req.body;
  
    try {
      const updatedRefund = await Refund.updateOne({ _id: refundId }, { status });
      if (updatedRefund.nModified === 0) {
        return res.status(404).json({ error: 'Refund not found' });
      }
      return res.status(200).json({ message: 'Refund status updated successfully' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  };