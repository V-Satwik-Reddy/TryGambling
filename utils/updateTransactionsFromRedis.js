const express = require("express");
const router = express.Router();
const redis = new (require("ioredis"))(process.env.REDIS_URL);
const Transaction = require("../model/Transaction");

const updateTransactionsFromRedis = async () => {
  try {
    let cursor = "0";
    let betHistoryKeys = [];

    do {
      const res = await redis.scan(cursor, "MATCH", "*:BetHistory", "COUNT", 100);
      cursor = res[0]; // Next cursor position
      betHistoryKeys.push(...res[1]); // Add found keys
    } while (cursor !== "0"); // Continue scanning

    if (betHistoryKeys.length === 0) {
      console.log("No BetHistory records found.");
      return;
    }

    let transactions = [];

    // Fetch all bet history data and delete them from Redis
    for (const key of betHistoryKeys) {
      const userId = key.split(":")[0]; // Extract user ID from key
      const bets = await redis.lrange(key, 0, -1); // Get full list of bets

      bets.forEach((bet) => {
        const { amount, choice, outcome } = JSON.parse(bet);
        transactions.push({
          userId,
          choice,
          result: outcome === "won" ? "Win" : "Loss",
          amount,
        });
      });

      // Delete the key from Redis after processing
      await redis.del(key);
    }

    if (transactions.length > 0) {
      // Bulk insert all transactions
      await Transaction.insertMany(transactions);
      console.log(`${transactions.length} transactions inserted and Redis data cleared.`);
    }
  } catch (error) {
    console.error("Error updating transactions:", error);
  }
};

module.exports = updateTransactionsFromRedis;