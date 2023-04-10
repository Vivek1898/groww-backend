
const express = require("express");

const {createRefund,getRefund,refundBookings,updateBookings} = require("../controllers/refund");
const router = express.Router();


router.post("/create", createRefund);
router.get("/get",getRefund);
router.post("/:BookingIdToCancel/cancel",refundBookings);
router.post("/:userIdToUpdate/update",updateBookings);

module.exports = router;