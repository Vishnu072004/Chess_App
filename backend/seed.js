<<<<<<< HEAD
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { MONGO_URI } from "./config/env.js";

// Models
import User from "./models/User.js";
import ChessGame from "./models/ChessGame.js";
import Reel from "./models/Reel.js";
import Comment from "./models/Comment.js";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
=======
console.log("DEBUG: Seed Script Started");
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// MODELS
const User = require("./models/User");
const ChessGame = require("./models/ChessGame");
const Reel = require("./models/Reel");
const Comment = require("./models/Comment");

// Real Chess Video URLs (using Pexels and other free stock video sites)
const CHESS_VIDEOS = [
  {
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
    title: "Big Buck Bunny Defense",
    description: "A classic opening for beginners.",
  },
  {
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
    title: "Elephant's Gambit",
    description: "Sharp tactical battle.",
  },
  {
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
    title: "Blazing Attacks",
    description: " attacking the king with fire.",
  },
  {
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg",
    title: "Great Escapes",
    description: "How to defend difficult positions.",
  },
];

async function seed() {
  try {
    const dbUri = "mongodb://127.0.0.1:27017/chess_db";
    console.log("Attempting to connect to:", dbUri);
    console.log("Type of URI:", typeof dbUri);
    await mongoose.connect(dbUri);
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
    console.log("MongoDB connected");

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      ChessGame.deleteMany(),
      Reel.deleteMany(),
      Comment.deleteMany(),
    ]);

    console.log("Old data cleared");

    // Hash passwords for seed users
<<<<<<< HEAD
    const userPassword = await bcrypt.hash("user123", 10);
    const adminPassword = await bcrypt.hash("admin123", 10);

    // USERS - Regular user and Admin
    const [user1, user2, admin] = await User.insertMany([
=======
    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    // USERS
    const [user1, user2, user3] = await User.insertMany([
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
      {
        username: "pawncrusher",
        email: "user@chessreels.com",
        password: userPassword,
        profile: {
          name: "Pawn Crusher",
<<<<<<< HEAD
          avatarUrl: "https://cdn.app.com/avatar/user1.png",
          bio: "Learning tactics daily!",
          chessRating: 1200,
        },
        stats: {
          reelsWatched: 25,
          puzzlesSolved: 50,
          followers: 10,
          following: 5,
        },
      },
      {
        username: "chessmaster99",
        email: "master@chessreels.com",
        password: userPassword,
        profile: {
          name: "Chess Master",
          avatarUrl: "https://cdn.app.com/avatar/user2.png",
          bio: "Grandmaster aspirant | FIDE 2100",
          chessRating: 2100,
        },
        stats: {
          reelsWatched: 150,
          puzzlesSolved: 300,
          followers: 500,
          following: 50,
        },
      },
      {
        username: "admin",
        email: "admin@chessreels.com",
        password: adminPassword,
        profile: {
          name: "Admin User",
          avatarUrl: "https://cdn.app.com/avatar/admin.png",
          bio: "ChessReels Administrator",
          chessRating: 1800,
        },
      },
    ]);

    console.log("Users created: 2 regular users + 1 admin");

    // CHESS GAMES
    const [game1, game2, game3] = await ChessGame.insertMany([
      {
        whitePlayer: "Garry Kasparov",
        blackPlayer: "Anatoly Karpov",
        event: "World Championship",
        year: 1985,
        result: "1-0",
        pgn: "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3...",
=======
          avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
          bio: "Learning tactics one puzzle at a time",
          chessRating: 1200
        }
      },
      {
        username: "grandmaster_sam",
        email: "sam@chessreels.com",
        password: userPassword,
        profile: {
          name: "Sam Fischer",
          avatarUrl: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100",
          bio: "Teaching chess since 2015",
          chessRating: 2100
        }
      },
      {
        username: "chessqueen_nina",
        email: "nina@chessreels.com",
        password: userPassword,
        profile: {
          name: "Nina Petrova",
          avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
          bio: "WGM | Content Creator",
          chessRating: 2350
        }
      }
    ]);

    console.log("Users created");

    // CHESS GAMES (Famous games with full PGN)
    const games = await ChessGame.insertMany([
      {
        whitePlayer: "Garry Kasparov",
        blackPlayer: "Anatoly Karpov",
        event: "World Championship 1985",
        year: 1985,
        result: "1-0",
        pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 b6 4. a3 Bb7 5. Nc3 d5 6. cxd5 Nxd5 7. Qc2 Be7 8. e4 Nxc3 9. bxc3 O-O 10. Bd3 c5 11. O-O cxd4 12. cxd4 Nc6 13. Rd1 Nb4 14. Bb1 Qc7"
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
      },
      {
        whitePlayer: "Magnus Carlsen",
        blackPlayer: "Fabiano Caruana",
<<<<<<< HEAD
        event: "World Championship",
        year: 2018,
        result: "1/2-1/2",
        pgn: "1.d4 Nf6 2.c4 e6 3.Nf3 d5 4.Nc3 Be7...",
=======
        event: "World Championship 2018 Game 6",
        year: 2018,
        result: "1/2-1/2",
        pgn: "1. e4 c5 2. Nf3 Nc6 3. Bb5 g6 4. Bxc6 dxc6 5. d3 Bg7 6. O-O Qc7 7. Re1 e5 8. a3 Nf6 9. b4 O-O 10. Nbd2 Bg4"
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
      },
      {
        whitePlayer: "Bobby Fischer",
        blackPlayer: "Boris Spassky",
<<<<<<< HEAD
        event: "World Championship",
        year: 1972,
        result: "1-0",
        pgn: "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6...",
      },
    ]);

    console.log("3 Chess games created");

    // REELS (Videos) - Various difficulties and statuses
    const reels = await Reel.insertMany([
      // Published - Beginner
      {
        video: {
          url: "https://cdn.app.com/videos/italian-game.mp4",
          thumbnail: "https://cdn.app.com/thumbs/italian.jpg",
          durationSec: 60,
        },
        content: {
          title: "Italian Game for Beginners",
          description: "Learn the classic Italian Game opening - perfect for beginners!",
          tags: ["opening", "italian", "beginner", "e4"],
          difficulty: "beginner",
        },
        gameId: game3._id,
        engagement: { likes: 150, views: 1200, saves: 45, comments: 0 },
        status: "published",
      },
      // Published - Beginner
      {
        video: {
          url: "https://cdn.app.com/videos/endgame-basics.mp4",
          thumbnail: "https://cdn.app.com/thumbs/endgame.jpg",
          durationSec: 120,
        },
        content: {
          title: "Endgame Essentials",
          description: "Master the king and pawn endgame - essential knowledge!",
          tags: ["endgame", "basics", "beginner", "fundamentals"],
          difficulty: "beginner",
        },
        gameId: game1._id,
        engagement: { likes: 89, views: 650, saves: 30, comments: 0 },
        status: "published",
      },
      // Published - Intermediate
      {
        video: {
          url: "https://cdn.app.com/videos/kasparov.mp4",
          thumbnail: "https://cdn.app.com/thumbs/kasparov.jpg",
          durationSec: 45,
        },
        content: {
          title: "Kasparov's Brutal Sicilian Attack",
          description: "Watch how Kasparov crushes with the Sicilian Defense!",
          tags: ["opening", "kasparov", "sicilian", "attack"],
          difficulty: "intermediate",
        },
        gameId: game1._id,
        engagement: { likes: 280, views: 2500, saves: 120, comments: 0 },
        status: "published",
      },
      // Published - Intermediate
      {
        video: {
          url: "https://cdn.app.com/videos/tactics-101.mp4",
          thumbnail: "https://cdn.app.com/thumbs/tactics.jpg",
          durationSec: 90,
        },
        content: {
          title: "5 Tactical Patterns You MUST Know",
          description: "Fork, pin, skewer, discovered attack, and back rank mate",
          tags: ["tactics", "patterns", "intermediate", "tutorial"],
          difficulty: "intermediate",
        },
        gameId: game2._id,
        engagement: { likes: 420, views: 3800, saves: 200, comments: 0 },
        status: "published",
      },
      // Published - Advanced
      {
        video: {
          url: "https://cdn.app.com/videos/queens-gambit.mp4",
          thumbnail: "https://cdn.app.com/thumbs/queens-gambit.jpg",
          durationSec: 180,
        },
        content: {
          title: "Queen's Gambit Deep Dive",
          description: "Advanced strategies and variations in the Queen's Gambit",
          tags: ["opening", "queens-gambit", "advanced", "d4"],
          difficulty: "advanced",
        },
        gameId: game2._id,
        engagement: { likes: 310, views: 2100, saves: 95, comments: 0 },
        status: "published",
      },
      // Published - Advanced
      {
        video: {
          url: "https://cdn.app.com/videos/positional-chess.mp4",
          thumbnail: "https://cdn.app.com/thumbs/positional.jpg",
          durationSec: 240,
        },
        content: {
          title: "Mastering Positional Chess",
          description: "Learn to evaluate positions like a Grandmaster",
          tags: ["strategy", "positional", "advanced", "evaluation"],
          difficulty: "advanced",
        },
        gameId: game1._id,
        engagement: { likes: 180, views: 980, saves: 75, comments: 0 },
        status: "published",
      },
      // Draft - Not visible to users
      {
        video: {
          url: "https://cdn.app.com/videos/upcoming.mp4",
          thumbnail: "https://cdn.app.com/thumbs/upcoming.jpg",
          durationSec: 150,
        },
        content: {
          title: "Coming Soon: Rook Endgames",
          description: "Draft video - not yet published",
          tags: ["endgame", "rook", "draft"],
          difficulty: "intermediate",
        },
        gameId: game3._id,
        engagement: { likes: 0, views: 0, saves: 0, comments: 0 },
        status: "draft",
      },
      // Archived
      {
        video: {
          url: "https://cdn.app.com/videos/old-content.mp4",
          thumbnail: "https://cdn.app.com/thumbs/old.jpg",
          durationSec: 60,
        },
        content: {
          title: "Archived: Basic Checkmate Patterns",
          description: "This content has been archived",
          tags: ["archived", "basics"],
          difficulty: "beginner",
        },
        gameId: game1._id,
        engagement: { likes: 50, views: 300, saves: 10, comments: 0 },
        status: "archived",
      },
    ]);

    console.log(`${reels.length} Reels created (6 published, 1 draft, 1 archived)`);

    // COMMENTS - Create comments on multiple reels
    const publishedReels = reels.filter(r => r.status === "published");
    
    // Comments on first reel (Italian Game)
    const comment1 = await Comment.create({
      reelId: publishedReels[0]._id,
      userId: user1._id,
      text: "This is exactly what I needed! Clear explanation 👏",
    });

    const reply1_1 = await Comment.create({
      reelId: publishedReels[0]._id,
      userId: user2._id,
      text: "Agreed! Finally understand the Italian Game",
      parentCommentId: comment1._id,
    });

    await Comment.create({
      reelId: publishedReels[0]._id,
      userId: user1._id,
      text: "Thanks! Glad it helped 😊",
      parentCommentId: reply1_1._id,
    });

    // Comments on Kasparov reel
    const comment2 = await Comment.create({
      reelId: publishedReels[2]._id,
      userId: user2._id,
      text: "Kasparov is the GOAT! That attack was insane 🔥",
    });

    await Comment.create({
      reelId: publishedReels[2]._id,
      userId: user1._id,
      text: "Can you do more Kasparov games?",
      parentCommentId: comment2._id,
    });

    // Comments on tactics reel
    await Comment.create({
      reelId: publishedReels[3]._id,
      userId: user1._id,
      text: "The back rank mate example was brilliant!",
    });

    await Comment.create({
      reelId: publishedReels[3]._id,
      userId: user2._id,
      text: "I keep missing forks in my games. This helps a lot!",
    });

    // Update reply counts
    await Comment.findByIdAndUpdate(comment1._id, { repliesCount: 1 });
    await Comment.findByIdAndUpdate(reply1_1._id, { repliesCount: 1 });
    await Comment.findByIdAndUpdate(comment2._id, { repliesCount: 1 });

    // Update reel comment counts
    await Reel.findByIdAndUpdate(publishedReels[0]._id, { "engagement.comments": 3 });
    await Reel.findByIdAndUpdate(publishedReels[2]._id, { "engagement.comments": 2 });
    await Reel.findByIdAndUpdate(publishedReels[3]._id, { "engagement.comments": 2 });

    console.log("7 Comments created across 3 reels");

    console.log("\n========== SEEDING COMPLETE ==========");
    console.log("\nTest Credentials:");
    console.log("  Regular User 1: pawncrusher / user123");
    console.log("  Regular User 2: chessmaster99 / user123");
    console.log("  Admin User:     admin / admin123");
    console.log("\n=======================================\n");
    
=======
        event: "World Championship 1972 Game 6",
        year: 1972,
        result: "1-0",
        pgn: "1. c4 e6 2. Nf3 d5 3. d4 Nf6 4. Nc3 Be7 5. Bg5 O-O 6. e3 h6 7. Bh4 b6 8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5"
      }
    ]);

    console.log("Chess games created");

    // REELS with real chess videos
    const reels = await Reel.insertMany(
      CHESS_VIDEOS.map((video, index) => ({
        video: {
          url: video.url,
          thumbnail: video.thumbnail,
          durationSec: 45 + Math.floor(Math.random() * 60)
        },
        content: {
          title: video.title,
          description: video.description,
          tags: getTagsForIndex(index),
          difficulty: getDifficultyForIndex(index),
          whitePlayer: games[index % games.length].whitePlayer,
          blackPlayer: games[index % games.length].blackPlayer
        },
        gameId: games[index % games.length]._id,
        engagement: {
          likes: 500 + Math.floor(Math.random() * 10000),
          views: 5000 + Math.floor(Math.random() * 100000),
          comments: 20 + Math.floor(Math.random() * 300),
          saves: 50 + Math.floor(Math.random() * 2000)
        },
        status: "published"
      }))
    );

    console.log(`${reels.length} Chess Reels created`);

    // COMMENTS
    await Comment.insertMany([
      {
        reelId: reels[0]._id,
        userId: user1._id,
        text: "This opening is brutal! Just won 3 games in a row with it 🔥"
      },
      {
        reelId: reels[0]._id,
        userId: user2._id,
        text: "Best explanation of the Sicilian I've ever seen."
      },
      {
        reelId: reels[1]._id,
        userId: user3._id,
        text: "The pin is mightier than the sword ♟️"
      },
      {
        reelId: reels[2]._id,
        userId: user1._id,
        text: "KIA is so underrated. Works every time!"
      },
      {
        reelId: reels[3]._id,
        userId: user2._id,
        text: "Pawn endgames are the foundation. Great content!"
      },
      {
        reelId: reels[4]._id,
        userId: user3._id,
        text: "Finally someone explains this properly!"
      }
    ]);

    console.log("Comments created");

    console.log("\n✅ SEEDING COMPLETE!");
    console.log(`Created: 3 users, 3 games, ${reels.length} chess reels, 6 comments`);
    console.log("\nTest credentials:");
    console.log("  Email: user@chessreels.com");
    console.log("  Password: user123");

>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

<<<<<<< HEAD
=======
// Helper functions
function getTagsForIndex(index) {
  const tagSets = [
    ["opening", "sicilian", "tactics", "aggressive"],
    ["tactics", "pin", "beginner", "fundamentals"],
    ["opening", "KIA", "flexible", "strategy"],
    ["endgame", "pawns", "beginner", "technique"],
    ["opening", "queens-gambit", "accepted", "tactics"],
    ["middlegame", "knight", "outpost", "positional"],
    ["attack", "rook", "kingside", "advanced"],
    ["tactics", "checkmate", "patterns", "essential"]
  ];
  return tagSets[index] || ["chess", "tutorial"];
}

function getDifficultyForIndex(index) {
  const difficulties = ["beginner", "beginner", "intermediate", "beginner", "intermediate", "intermediate", "advanced", "beginner"];
  return difficulties[index] || "intermediate";
}

>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
seed();
