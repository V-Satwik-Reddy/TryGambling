const axios = require('axios');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const Redis = require('ioredis');
require('dotenv').config();

const redis = new Redis();
const app = express();
const morgan = require('morgan');
app.use(cors());
app.use(morgan('dev'));

// Import User model
const User = require('./model/User'); // Ensure the correct path

// Mongoose connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => {
        console.error("❌ MongoDB Connection Failed:", err);
        process.exit(1);
    });

// Define Task Model
const taskSchema = new mongoose.Schema({}, { strict: false }); // Dynamic schema
const Task = mongoose.model("Task", taskSchema, "tasks");

// ✅ Get all tasks with Redis caching
app.get("/photos", async (req, res) => {
    try {
        const data = await getdata('tasks', async () => {
            return await Task.find().lean(); // ✅ Use lean() for better performance
        });
        res.json(data);
    } catch (error) {
        console.error("❌ Error fetching tasks:", error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ Get a single task by ID with Redis caching
app.get("/photos/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const data = await getdataById(`tasks:${id}`, async () => {
            return await Task.findById(id).lean(); // ✅ Use lean()
        });

        if (!data) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.json(data);
    } catch (error) {
        console.error("❌ Error fetching task:", error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ Fetch external API data with caching
app.get("/pbai", async (req, res) => {
    try {
        const albumId = req.query.albumId;
        const data = await getdata(`photos?AlbumId=${albumId}`, async () => {
            const { data } = await axios.get("https://jsonplaceholder.typicode.com/photos", {
                params: { albumId }
            });
            return data;
        });

        res.json(data);
    } catch (error) {
        console.error("❌ Error fetching external API data:", error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ Function to cache and retrieve data (List of Tasks)
async function getdata(key, cb) {
    try {
        const cachedData = await redis.get(key);
        if (cachedData) return JSON.parse(cachedData);

        let data = await cb();
        if (!data || data.length === 0) throw new Error("No data found");

        const pipeline = redis.pipeline();
        data = data.map(task => 
            typeof task.toObject === "function" ? task.toObject() : task
        );
        // ✅ Cache each task separately as a Redis Hash
        for (const task of data) {
            const taskKey = `task:${task._id}`;
            for (const field in task) {
                pipeline.hset(taskKey, field, task[field]);
            }
            pipeline.expire(taskKey, 3600);
        }

        // ✅ Cache the entire list
        pipeline.setex(key, 3600, JSON.stringify(data));

        await pipeline.exec();
        return data;
    } catch (error) {
        console.error("❌ Error in getdata:", error);
        throw error;
    }
}

// ✅ Function to cache and retrieve a single task by ID
async function getdataById(key, cb) {
    try {
        const [basekey, id] = key.split(":");

        // ✅ Check if the single task is already cached
        const cachedTask = await redis.get(key);
        if (cachedTask) return JSON.parse(cachedTask);

        // ✅ Check if the full dataset is cached
        const cachedTasks = await redis.get(basekey);
        if (cachedTasks) {
            const tasks = JSON.parse(cachedTasks);
            const task = tasks.find(t => t._id === id);
            if (task) {
                await redis.setex(key, 3600, JSON.stringify(task)); 
                return task;
            }
        }

        // ✅ Fetch from DB if not found in cache
        const data = await cb();
        if (!data) return null;

        await redis.setex(key, 3600, JSON.stringify(data));
        return data;
    } catch (error) {
        console.error("❌ Error in getdataById:", error);
        throw error;
    }
}

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
