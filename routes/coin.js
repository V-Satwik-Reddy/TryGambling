const express= require('express');
const router=express.Router();
const User=require('../model/User');
const auth=require('../middleware/auth');

//flip a coin
router.post("/flip", auth, async (req, res) => {
    try {
        const { choice, amount } = req.body;

        if (!choice || amount == null) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (amount <= 0) {
            return res.status(400).json({ message: "Amount must be positive" });
        }

        if (amount > req.user.balance) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        const outcomes = ["heads", "tails"];
        const outcome = outcomes[Math.random() < 0.5 ? 0 : 1];

        if (choice.toLowerCase() === outcome) {
            req.user.balance += Number(amount);
            await req.user.save();
            return res.json({ message: "🎉 You won!", outcome, balance: req.user.balance });
        }

        req.user.balance -= Number(amount);
        await req.user.save();
        return res.json({ message: "😢 You lost!", outcome, balance: req.user.balance });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports=router;