const jwt = require("jsonwebtoken");
const User = require("../model/User");
const redis = new (require('ioredis'))(process.env.REDIS_URL + '?family=0');

module.exports = async (req, res, next) => {
    try{
        const token=req.cookies.token;
        if(!token){
            return res.status(401).json({message:"no token provided"});
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        const user=await redis.hgetall(decoded.id);
        if(!user){
            return res.status(401).json({message:"Unauthorized"});
        }
        req.user={
            id:decoded.id,
            balance:user.balance,
        };
        next();
    }catch(err){
        console.error(err);
        res.status(401).json({error:"Unauthorized"});
    }
}
