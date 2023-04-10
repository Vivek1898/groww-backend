const express = require("express");

const {createPlan,getPlan,getPlanAdmin,changeisActive} = require("../controllers/plans");
const router = express.Router();


router.post("/create", createPlan);
router.get("/get",getPlan);
router.get("/admin/get",getPlanAdmin);
router.put("/admin/change/:planId",changeisActive);


module.exports = router;