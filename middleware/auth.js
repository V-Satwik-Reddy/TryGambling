const jwt = require("jsonwebtoken");
const User = require("../model/User");

module.exports = async (req, res, next) => {
    try{
        const token=req.cookies.token;
        if(!token){
            return res.status(401).json({message:"no token provided"});
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        const user=await User.findById(decoded.id);
        if(!user){
            return res.status(401).json({message:"Unauthorized"}).select("-password");
        }
        req.user=user;
        next();
    }catch(err){
        console.error(err);
        res.status(401).json({error:"Unauthorized"});
    }
}
