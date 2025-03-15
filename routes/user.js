const express= require('express');
const router=express.Router();
const User=require('../model/User');
const auth=require('../middleware/auth');
const cron = require("node-cron");


// Cron job to add option to add balance to users every 24hrs
cron.schedule("0 0 * * *",async () => {
    try {
      const users = await User.find({ claimed: false });
      for (let user of users) {
        user.claimed = false;
        await user.save();
      }
      
    } catch (error) {
      console.error({ error: error.message});
    }
  });

//claim money
router.post("/claim", auth, async (req, res) => {
    try {
        if (req.user.claimed) {
            return res.status(400).json({ message: "Already claimed" });
        }
        req.user.balance += 1000;
        req.user.claimed = true;
        req.user.claimedAt = Date.now();
        await req.user.save();
        return res.json({ message: "💰 Claimed successfully", balance: req.user.balance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//get user balance
router.get("/balance", auth, (req, res) => {
    res.json({ balance: req.user.balance });
});
module.exports=router;