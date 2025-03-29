const express = require('express');
const router = express.Router();
const User = require('../model/User');
const auth = require('../middleware/auth');
const redis = new (require('ioredis'))(process.env.REDIS_URL);

router.post("/flip", auth, async (req, res) => {
    try {
        const { choice, amount } = req.body;

        if (!choice || amount == null) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const betAmount = Number(amount);
        let userBalance = Number(req.user.balance);

        if (betAmount <= 0) {
            return res.status(400).json({ message: "Amount must be positive" });
        }

        if (betAmount > userBalance) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        const outcomes = ["heads", "tails"];
        const outcome = outcomes[Math.random() < 0.5 ? 0 : 1];

        if (choice.toLowerCase() === outcome) {
            userBalance += betAmount;
            console.log()
            await redis.hset(req.user.id, "balance", userBalance);
            await redis.rpush(req.user.id + ":BetHistory", JSON.stringify({ amount: betAmount, choice, outcome, result: "won", time: new Date() }));
            await User.findByIdAndUpdate(req.user.id, { balance: userBalance });

            return res.json({ message: "🎉 You won!", outcome, balance: userBalance });
        }

        userBalance -= betAmount;
        await redis.hset(req.user.id, "balance", userBalance);
        await redis.rpush(req.user.id + ":BetHistory", JSON.stringify({ amount: betAmount, choice, outcome, result: "loss", time: new Date() }));
        await User.findByIdAndUpdate(req.user.id, { balance: userBalance });

        return res.json({ message: "😢 You lost!", outcome, balance: userBalance });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
