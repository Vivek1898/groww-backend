const Refund = require("../models/refund");
const wallet = require("../models/wallet");
const user = require("../models/user");
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

exports.refundBookings = async (req, res) => {
    console.log("Refund Bookings");
    const { BookingIdToCancel } = req.params;
    const { amount } = req.body;
    console.log(amount);
    console.log(BookingIdToCancel)

    try {
        // const users = await user.find({
        //     $and: [
        //       { email: BookingIdToCancel },
        //       { refunds: { $elemMatch: { refundId: refundIdToCancel } } }
        //     ]
        //   });
        const users=await user.find({email:BookingIdToCancel});
        console.log(users);
   if(users.length==0){
    return res.status(400).json({
        success: false,
        error: "User not found",
        });
    }
    const wallets= await wallet.find({user:users[0]._id});
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