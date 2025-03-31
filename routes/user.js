const express= require('express');
const router=express.Router();
const User=require('../model/User');
const auth=require('../middleware/auth');
const cron = require("node-cron");
const redis = new (require('ioredis'))(process.env.REDIS_URL+ '?family=0');




//claim money
router.get("/claim", auth, async (req, res) => {
    try {
        const status=await redis.hget(req.user.id,"claimed")
        if (status=== "true") {
            return res.status(400).json({ message: "Already claimed" });
        }
        const updatedBalance=Number(req.user.balance)+1000;
        await User.findByIdAndUpdate(req.user.id, { balance: updatedBalance ,claimed:true});
        await redis.hset(req.user.id, "claimed", "true", "balance", updatedBalance);
        return res.json({ message: "💰 Claimed successfully", balance:updatedBalance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get("/profile",auth,async(req,res)=>{
    try{
        res.json({
            email:req.user.email,
            balance:req.user.balance,
        })
    }catch(error){
        res.status(500).json({error:error.message})
    }
})
//get user balance
router.get("/balance", auth, (req, res) => {
    res.json({ balance: req.user.balance });
});
module.exports=router;
