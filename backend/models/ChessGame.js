<<<<<<< HEAD
import mongoose from "mongoose";
=======
const mongoose = require("mongoose");
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757

const chessGameSchema = new mongoose.Schema({
  whitePlayer: { type: String, required: true },
  blackPlayer: { type: String, required: true },
  event: String,
  year: Number,

<<<<<<< HEAD
  result: String,
  pgn: { type: String, required: true },
});

export default mongoose.model("ChessGame", chessGameSchema);
=======
  result: String,   
  pgn: { type: String, required: true }
});

module.exports = mongoose.model("ChessGame", chessGameSchema);
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
