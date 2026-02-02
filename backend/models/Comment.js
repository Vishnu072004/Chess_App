const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  reelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reel",
    index: true,
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Allow anonymous comments
    default: null
  },

  // For anonymous users who aren't logged in
  guestName: {
    type: String,
    default: "Anonymous"
  },

  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null
  },

  text: {
    type: String,
    required: true,
    maxLength: 1000
  },

  likes: { type: Number, default: 0 },
  repliesCount: { type: Number, default: 0 },

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
