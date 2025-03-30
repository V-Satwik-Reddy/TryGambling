const express = require("express");
const router = express.Router();
const User = require("../model/User");
const jwt=require("jsonwebtoken");
const axios = require("axios");
const dotenv = require("dotenv");
const auth=require("../middleware/auth");
dotenv.config();
const Redis=require("ioredis");
const redis = new Redis(process.env.REDIS_URL+ '?family=0');
const bcrypt = require("bcryptjs");
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/auth/google/callback";
const FRONTEND_URL = process.env.FRONTEND_URL;
//signup
router.post("/signup", async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if ( !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    let user = await User.create({ email, name, password: hashedPassword });

    user = await User.findOne({ email:email }).select("-password").lean();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    await redis.hset(user._id, "balance", user.balance, "claimed", user.claimed,"email", user.email);
    await redis.expire(user._id, 24 * 60 * 60); 

    return res.json({ message: "User created successfully"});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//login
router.post("/login", async (req, res) => {
  try{ 
      const { email, password } = req.body;
      let user= await User.findOne({email}).select("+password").lean();
      if(!user){
        return res.status(400).json({message:"User does not exist"});
      }
      const  isMatch=await bcrypt.compare(password, user.password);
      if(!isMatch){
        return  res.status(400).json({message:"Invalid password"});
      }
      delete user.password;

      const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{ expiresIn: "24h" });
      await redis.hset(user._id,"balance",user.balance,"claimed",user.claimed,"email",user.email);
      await redis.expire(user._id, 24*60*60);
      res.cookie("token",token,{
        httpOnly:true,
        secure: true,
        sameSite: "none",
        maxAge: 24*60*60*1000
      });
      return res.json({message:"User signed in successfully"});
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
      await redis.hset(userInfo._id,"balance",userInfo.balance,"claimed",userInfo.claimed,"email",userInfo.email);
      await redis.expire(userInfo._id, 24*60*60);
      return res.redirect("https://mounesh-13.github.io/Gamble/#/");
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ message: "Authentication failed" });
  }
});

//verify
router.get("/verify", auth, async (req, res) => {
  res.json("verifid");
});
// Logout: Clear Cookie
router.get("/logout", auth ,async (req, res) => {
  res.clearCookie("token",{ httpOnly: true, sameSite: "None", secure: true });
  await redis.del(req.user._id);
  res.json({ message: "Logged out" });
});

module.exports = router;
