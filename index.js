const express = require('express')
const app = express()
const morgan=require('morgan')
require('dotenv').config()
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const cron = require("node-cron");
const User = require('./model/User')
app.use(express.json())
app.use(morgan("dev"))

app.use(cookieParser());

//  Improved CORS setup for Cookies
app.use(
    cors({
        origin: ["http://localhost:3000","https://mounesh-13.github.io"],
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
app.get("/", (req, res) => {
    res.send("Hello from the server.You can find the routes from /api/routes")
});
app.get('/api/routes', (req, res) => {
    res.json(getAllRoutes(app));
  });

  
  const getAllRoutes = (app) => {
    const routes = [];
    const extractRoutes = (stack, basePath = '') => {
      stack.forEach((layer) => {
        if (layer.route) {
          routes.push({
            path: basePath + layer.route.path,
            methods: Object.keys(layer.route.methods).join(', ').toUpperCase(),
          });
        } else if (layer.name === 'router' && layer.handle.stack) {
          extractRoutes(layer.handle.stack, basePath + (layer.regexp.source.replace("\\/?(?=\\/|$)", "").replace("^", "").replace("$", "") || ''));
        }
      });
    };
  
    extractRoutes(app._router.stack);
    return routes;
  };
  
  // Log all routes
  console.log(getAllRoutes(app));
  
  // Cron job to add option to add balance to users every 24hrs
  cron.schedule("0 0 * * *", async () => {
    try {
        await User.updateMany({}, { $inc: { balance: 1000 } });
        console.log("All claimed statuses reset to false.");
    } catch (error) {
        console.error("Error updating claimed status:", error.message);
    }
  });

const port=process.env.PORT||5000;
app.listen(port, () => console.log(`Example app listening on http://localhost:${port}`))