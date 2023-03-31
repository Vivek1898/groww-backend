const express = require("express");
const { checkout, paymentVerification } = require("../controllers/paymentController");
// import {
//   checkout,
//   paymentVerification,
// } from "../controllers/paymentController.js";
const { requireSignin, isAdmin, isAuthor } = require("../middlewares");

const router = express.Router();

router.post("/checkout", requireSignin, isAdmin, checkout);
router.post("/paymentverification", paymentVerification);
// router.route("/checkout").post(checkout);

// router.route("/paymentverification").post(paymentVerification);


module.exports = router;
