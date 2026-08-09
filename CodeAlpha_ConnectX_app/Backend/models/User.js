const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    profilePic: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Online", "Offline"],
      default: "Offline",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);