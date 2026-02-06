<<<<<<< HEAD
import mongoose from "mongoose";
=======
const mongoose = require("mongoose");
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757

const reelSchema = new mongoose.Schema({
  video: {
    url: { type: String, required: true },
    thumbnail: String,
<<<<<<< HEAD
    durationSec: Number,
=======
    durationSec: Number
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
  },

  content: {
    title: String,
    description: String,
    tags: [String],
    difficulty: {
      type: String,
<<<<<<< HEAD
      enum: ["beginner", "intermediate", "advanced"],
    },
=======
      enum: ["beginner", "intermediate", "advanced"]
    },
    whitePlayer: String,
    blackPlayer: String
  },

  chessData: {
    fen: String,
    pgn: String,
    orientation: { type: String, default: "white" }
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
  },

  gameId: {
    type: mongoose.Schema.Types.ObjectId,
<<<<<<< HEAD
    ref: "ChessGame",
=======
    ref: "ChessGame"
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
  },

  engagement: {
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
<<<<<<< HEAD
    saves: { type: Number, default: 0 },
=======
    saves: { type: Number, default: 0 }
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
  },

  status: {
    type: String,
    enum: ["draft", "published", "archived"],
<<<<<<< HEAD
    default: "draft",
  },

  folder: {
    type: String,
    enum: ["random", "grandmaster"],
    default: "random",
  },

  grandmaster: {
    type: String,
    default: null,
  },
=======
    default: "draft"
  }
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
}, { timestamps: true });

reelSchema.index({ "content.tags": 1 });
reelSchema.index({ createdAt: -1 });

<<<<<<< HEAD
export default mongoose.model("Reel", reelSchema);
=======
module.exports = mongoose.model("Reel", reelSchema);
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
