require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const paymentRoutes = require("./routes/paymentRoutes");
const planRoutes = require("./routes/planRoute");
const RefundRoute = require("./routes/refundRoute");
const morgan = require("morgan");

const app = express();
const http = require("http").createServer(app);

// db connection
mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB CONNECTION ERROR: ", err));

// middlewares
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.options('*', cors());
app.use(morgan("dev"));

// route middlewares
app.use("/api", authRoutes);
app.use("/api", paymentRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/refund", RefundRoute);
app.get("/api/getkey", (req, res) =>
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY })
);

const port = process.env.PORT || 8000;

http.listen(port, () => console.log("Server running on port 8000"));
