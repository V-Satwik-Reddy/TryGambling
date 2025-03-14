const express = require("express");
const router = express.Router();
const User = require("../model/User");
const jwt=require("jsonwebtoken");

router.post("/signup", async (req, res) => {
  try{
    const { email,name, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    let user= await User.findOne({email});
    if(user){
      return res.status(400).json({message:"User already exists"});
    }
    user = new User({ email,name, password });
    await user.save();

    //create the cookie
    user=await User.findOne({email});
    const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{ expiresIn: "24h" });

    res.cookie("token",token,{
      httpOnly:true,
      secure: true,
      sameSite: "none",
      maxAge: 24*60*60*1000
    });
    return res.json({ message: "User created successfully" ,user});
  }catch(err){
    res.status(500).json({error:err.message});
  }
});

router.post("/login", async (req, res) => {
 try{ 
  const { email, password } = req.body;
  let user= await User.findOne({email});
  if(!user){
    res.status(400).json({message:"User does not exist"});
  }
  if(user.password!==password){
    res.status(400).json({message:"Invalid password"});
  }
  
  //create the cookie
  const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{ expiresIn: "24h" });

  res.cookie("token",token,{
    httpOnly:true,
    secure: true,
    sameSite: "none",
    maxAge: 24*60*60*1000
  });

  return res.json({message:"User signed in successfully",user});
}catch(err){
  res.status(500).json({error:err.message});
}
});

module.exports = router;