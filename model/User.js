const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      select: false,
      validate: {
        validator: function (value) {
          // Password is required only if googleId is absent
          return this.googleId || value;
        },
        message: "Password is required unless using Google OAuth.",
      },
    },
    googleId: {
      type: String,
    },
    balance: {
      type: Number,
      default: 1000,
    },
    claimed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
