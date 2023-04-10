const Plan = require("../models/plans");
exports.createPlan = async (req,res ) =>{
    try {
        const plan = await Plan.create(req.body);
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

exports.getPlan = async (req,res) =>{
    try {
        const plan = await Plan.find({ isActive: true });
        res.status(200).json({
            success: true,
            plan
        })

    }catch(err){
        console.log(err);
        res.status(500).json({ error: "Server error" });
    }
}

exports.getPlanAdmin = async (req, res) => {
    try {
      const plan = await Plan.find();
      res.status(200).json({
        success: true,
        plan,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Server error" });
    }
  };
exports.changeisActive = async (req, res) => {
    try {
        const planId = req.params.planId;
        //const active = req.body.active;
        // console.log(req.body);
        // return;
     //   console.log(active)
     console.log(req.body.isActive)
    
        const updatedPlan = await Plan.findByIdAndUpdate(
          planId,
          { isActive: req.body.isActive },
          { new: true }
        );
    
        if (!updatedPlan) {
          return res.status(404).json({ error: "Plan not found" });
        }
    
        res.json({
          message: "Plan updated successfully",
          plan: updatedPlan,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
      }
  };