const express=require("express");
const router=express.Router();
const redis=new (require("ioredis"))(process.env.REDIS_URL +'?family=0');
const Transaction=require("../model/Transaction")
const auth=require("../middleware/auth")
const updateTransactionsFromRedis = require('../utils/updateTransactionsFromRedis')

router.get("/",auth ,async(req,res)=>{
    try {
        let data=redis.get(`${req.user.id}:BetHistory`);
        if(data.length> 0){
            data=JSON.parse(data);
            return res.status(200).json(data)
        }
        data=await Transaction.find({userId:req.user.id}).sort({createdAt:-1});
        if(data.length===0){
            return res.status(404).send("No transactions found")
        }
        // Store the data in Redis for future requests
        await redis.set(`${req.user.id}:BetHistory`,JSON.stringify(data))
        await redis.expire(req.user.id,60*5) 
        res.status(200).json(data)
    } catch (error) {
        console.error("Error getting transactions:", error);
        res.status(500).send("Internal Server Error")
    }   
})
router.post("/",auth,async(req,res)=>{
    try {
        updateTransactionsFromRedis();
        res.status(200).send("Transactions are being synced from Redis")
    } catch (error) {
        console.error("Error :", error);
        res.status(500).send("Internal Server Error")
    }
})
module.exports=router;