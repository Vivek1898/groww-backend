const express = require("express");
const {
  checkout,
  paymentVerification,
  getPayments,
  cancelBookings,
  walletSum,
  getWallet,
  getPayments2,
  updateWaletPerDay,
  addPayment,
  allWallets,
  adminGetPayments,
  subscribedPlanForUsers,
  getNumbers,
  manualAddPlans
} = require("../controllers/paymentController");




// import {
//   checkout,
//   paymentVerification,
// } from "../controllers/paymentController.js";
const { requireSignin, isAdmin, isAuthor } = require("../middlewares");

const router = express.Router();

router.post("/checkout", requireSignin, checkout);
router.post("/paymentverification", paymentVerification);
router.post("/manual",requireSignin,isAdmin, manualAddPlans);
router.post("/addbooking", requireSignin,addPayment);
// router.route("/checkout").post(checkout);

// router.route("/paymentverification").post(paymentVerification);
router.get("/payments/:userId",requireSignin, getPayments2);
router.get("/bookings/:userId", requireSignin, getPayments);
router.get("/bookings/admin/all", requireSignin, isAdmin, adminGetPayments);
adminGetPayments
router.get(
  "/bookings/update/wallet/:userId",
  requireSignin,
  isAdmin,
  updateWaletPerDay
);
router.get(
  "/bookings/user/wallet/plans/:userId",
  requireSignin,
  
  subscribedPlanForUsers
);


router.get("/bookings/get/numbers/all",requireSignin, isAdmin,getNumbers);

router.post(
  "/booking/:BookingIdToCancel/cancel",
  requireSignin,
  isAdmin,
  cancelBookings
);
router.get("/bookings/wallets/:userId",requireSignin, walletSum);

router.get("/booking/mywallet/all",requireSignin, isAdmin, allWallets);
router.get("/current/wallets/:userId",requireSignin, getWallet);
module.exports = router;
