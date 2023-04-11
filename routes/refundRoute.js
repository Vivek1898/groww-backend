const express = require("express");

const {
  createRefund,
  getRefund,
  refundBookings,
  updateBookings,
  changeRefundStatus,
  getRefundHistory,
  updateWallet,
} = require("../controllers/refund");
const router = express.Router();
const { requireSignin, isAdmin, isAuthor } = require("../middlewares");
router.post("/create", requireSignin,createRefund);
router.get("/get", getRefund);
router.get("/get/user/:userId",requireSignin, getRefundHistory);
router.post("/:BookingIdToCancel/cancel",requireSignin, isAdmin, refundBookings);
router.post("/wallet/:BookingIdToUpdate/update",requireSignin, isAdmin, updateWallet);
router.post("/:userIdToUpdate/update",requireSignin, isAdmin, updateBookings);
router.put("/status/:refundId",requireSignin, isAdmin, changeRefundStatus);

module.exports = router;
