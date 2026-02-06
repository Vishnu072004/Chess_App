<<<<<<< HEAD
import mongoose from "mongoose";
=======
const mongoose = require("mongoose");
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
<<<<<<< HEAD
    index: true,
=======
    index: true
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
  },
  email: {
    type: String,
    unique: true,
<<<<<<< HEAD
    required: true,
  },
  password: {
    type: String,
    required: true,
=======
    required: true
  },
  password: {
    type: String,
    required: true
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
  },

  profile: {
    name: String,
    avatarUrl: String,
    bio: String,
<<<<<<< HEAD
    chessRating: { type: Number, default: 800 },
=======
    chessRating: { type: Number, default: 800 }
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
  },

  stats: {
    reelsWatched: { type: Number, default: 0 },
    puzzlesSolved: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
<<<<<<< HEAD
    following: { type: Number, default: 0 },
  },
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model("User", userSchema);
=======
    following: { type: Number, default: 0 }
  }
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model("User", userSchema);
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
