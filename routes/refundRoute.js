const express = require("express");

const {
  createRefund,
  getRefund,
  refundBookings,
  updateBookings,
  changeRefundStatus,
  getRefundHistory,
} = require("../controllers/refund");
const router = express.Router();

router.post("/create", createRefund);
router.get("/get", getRefund);
router.get("/get/user/:userId", getRefundHistory);
router.post("/:BookingIdToCancel/cancel", refundBookings);
router.post("/:userIdToUpdate/update", updateBookings);
router.put("/status/:refundId", changeRefundStatus);

module.exports = router;
