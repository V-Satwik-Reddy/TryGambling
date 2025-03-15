const express = require("express");
const router = express.Router();
const User = require("../model/User");
const jwt=require("jsonwebtoken");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/auth/google/callback";

//signup

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

//login
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

//google oAuth Login
router.get("/google", (req, res) => {
  const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=email profile`;
  res.redirect(authUrl);
});

//google oAuth callback
router.get("/google/callback", async (req, res) => {
  const code = req.query.code;
  
  if (!code) {
      return res.status(400).json({ error: "No code received" });
  }

  try {
      // Exchange code for access token
      const { data } = await axios.post("https://oauth2.googleapis.com/token", null, {
          params: {
              client_id: CLIENT_ID,
              client_secret: CLIENT_SECRET,
              redirect_uri: REDIRECT_URI,
              grant_type: "authorization_code",
              code,
          },
      });

      // Fetch user info
      const { data: userInfo } = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${data.access_token}` },
      });

      //create the cookie
      const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{ expiresIn: "24h" });

      res.cookie("token",token,{
        httpOnly:true,
        secure: true,
        sameSite: "none",
        maxAge: 24*60*60*1000
      });
      res.json({ message: "Login Successful", user: userInfo });

  } catch (error) {
      res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Logout: Clear Cookie
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

module.exports = router;