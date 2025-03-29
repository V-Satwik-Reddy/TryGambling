const express = require('express')
const app = express()
const morgan=require('morgan')
require('dotenv').config()
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')

app.use(express.json())
app.use(morgan("dev"))

app.use(cookieParser());

//  Improved CORS setup for Cookies
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true, // **Ensures frontend can send & receive cookies**
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

//mongoose connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => {
        console.error("❌ MongoDB Connection Failed:", err);
        process.exit(1);
    });


//routes
app.use("/auth", require("./routes/auth"));
app.use("/coin", require("./routes/coin"));
app.use("/user", require("./routes/user"));

const port=process.env.PORT||5000;
app.listen(port, () => console.log(`Example app listening on http://localhost:${port}`))