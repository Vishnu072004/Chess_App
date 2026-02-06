<<<<<<< HEAD
import mongoose from "mongoose";
=======
const mongoose = require("mongoose");
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757

const commentSchema = new mongoose.Schema({
  reelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reel",
    index: true,
<<<<<<< HEAD
    required: true,
=======
    required: true
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
<<<<<<< HEAD
    required: true,
=======
    required: false, // Allow anonymous comments
    default: null
  },

  // For anonymous users who aren't logged in
  guestName: {
    type: String,
    default: "Anonymous"
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
  },

  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
<<<<<<< HEAD
    default: null,
  },

  text: String,
=======
    default: null
  },

  text: {
    type: String,
    required: true,
    maxLength: 1000
  },
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757

  likes: { type: Number, default: 0 },
  repliesCount: { type: Number, default: 0 },

<<<<<<< HEAD
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Comment", commentSchema);
=======
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Virtual for getting display name
commentSchema.virtual('displayName').get(function () {
  if (this.userId) {
    return this.userId.username || this.guestName;
  }
  return this.guestName;
});

module.exports = mongoose.model("Comment", commentSchema);
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
