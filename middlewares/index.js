// import expressJwt from "express-jwt";
// import User from "../models/user";

const expressJwt = require("express-jwt");
const User = require("../models/user");

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

exports.isAdmin = async (req, res, next) => {
  try {
    // you get req.user._id from verified jwt token
    const user = await User.findById(req.user._id);
    console.log("isAdmin ===> ", user);
    if (user.role !== "Admin") {
      return res.status(400).send("Unauthorized");
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
  }
};

exports.isAuthor = async (req, res, next) => {
  try {
    // you get req.user._id from verified jwt token
    const user = await User.findById(req.user._id);
    // console.log("isAdmin ===> ", user);
    if (user.role !== "Author") {
      return res.status(400).send("Unauthorized");
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
  }
};

exports.canCreateRead = async (req, res, next) => {
  try {
    // you get req.user._id from verified jwt token
    const user = await User.findById(req.user._id);
    // console.log("isAdmin ===> ", user);
    switch (user.role) {
      case "Admin":
        next();
        break;
      case "Author":
        next();
        break;
      default:
        return res.status(400).send("Unauthorized");
    }
  } catch (err) {
    console.log(err);
  }
};
