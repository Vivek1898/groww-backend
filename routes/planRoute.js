const express = require("express");

const {createPlan,getPlan,getPlanAdmin,changeisActive} = require("../controllers/plans");
const router = express.Router();

const { requireSignin, isAdmin, isAuthor } = require("../middlewares");

router.post("/create",requireSignin, isAdmin, createPlan);
router.get("/get",  getPlan);
router.get("/admin/get",  getPlanAdmin);
router.put("/admin/change/:planId",requireSignin, isAdmin,  changeisActive);


module.exports = router;