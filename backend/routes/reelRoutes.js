<<<<<<< HEAD
import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
    getFeed,
    getRandomReels,
    getAvailableGames,
    getReelsByGame,
    viewReel,
    getReelStats,
    getPublicFolderStats,
    getPublicGrandmasters,
    getReelsByFolder,
} from "../controllers/reelController.js";
import {
    likeReel,
    unlikeReel,
    createComment,
    deleteComment,
    getCommentsByReel,
} from "../controllers/engagementController.js";

const router = Router();

// ============ PUBLIC ROUTES (No Auth) ============

// GET /reels - Get paginated feed of published reels
router.get("/", getFeed);

// GET /reels/random - Get random reels (for "Discover" section)
router.get("/random", getRandomReels);

// GET /reels/folders - Get folder stats (random vs grandmaster counts)
router.get("/folders", getPublicFolderStats);

// GET /reels/grandmasters - Get list of grandmasters with reel counts
router.get("/grandmasters", getPublicGrandmasters);

// GET /reels/by-folder - Get reels by folder and optionally grandmaster
router.get("/by-folder", getReelsByFolder);

// GET /reels/games - Get list of available games (for game selection UI)
router.get("/games", getAvailableGames);

// GET /reels/game/:gameId - Get reels for a specific game
router.get("/game/:gameId", getReelsByGame);

// GET /reels/:reelId/stats - Get engagement stats for a reel
router.get("/:reelId/stats", getReelStats);

// GET /reels/:reelId/comments - Get all comments for a reel
router.get("/:reelId/comments", getCommentsByReel);

// POST /reels/:reelId/view - Record a view
router.post("/:reelId/view", viewReel);

// ============ AUTHENTICATED ROUTES ============

// POST /reels/:reelId/like - Like a reel
router.post("/:reelId/like", verifyToken, likeReel);

// PATCH /reels/:reelId/like - Like/Unlike a reel (frontend uses PATCH)
router.patch("/:reelId/like", verifyToken, likeReel);

// POST /reels/:reelId/unlike - Unlike a reel
router.post("/:reelId/unlike", verifyToken, unlikeReel);

// POST /reels/:reelId/comments - Create a new comment
router.post("/:reelId/comments", verifyToken, createComment);

// DELETE /reels/:reelId/comments/:commentId - Delete a comment
router.delete("/:reelId/comments/:commentId", verifyToken, deleteComment);

export default router;

=======
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Import models
const Reel = require("../models/Reel");
const Comment = require("../models/Comment");
const User = require("../models/User");

// GET /reels - Get all published reels with real engagement counts
router.get("/", async (req, res) => {
    try {
        // Get all published reels
        const reels = await Reel.find({ status: "published" })
            .populate("gameId")
            .sort({ createdAt: -1 })
            .lean(); // Use lean for better performance

        // Get real comment counts for all reels
        const commentCounts = await Comment.aggregate([
            { $group: { _id: "$reelId", count: { $sum: 1 } } }
        ]);

        // Create a map of reelId -> comment count
        const commentCountMap = {};
        commentCounts.forEach(item => {
            commentCountMap[item._id.toString()] = item.count;
        });

        // Update reels with real comment counts (reset likes/saves if they were seeded)
        const reelsWithRealCounts = reels.map(reel => ({
            ...reel,
            engagement: {
                ...reel.engagement,
                likes: reel.engagement?.likes || 0,
                comments: commentCountMap[reel._id.toString()] || 0,
                views: reel.engagement?.views || 0,
                saves: reel.engagement?.saves || 0,
            }
        }));

        res.json({ success: true, reels: reelsWithRealCounts });
    } catch (err) {
        console.error("Get reels error:", err);
        res.status(500).json({ error: "Failed to fetch reels" });
    }
});

// GET /reels/:id - Get single reel
router.get("/:id", async (req, res) => {
    try {
        const reel = await Reel.findById(req.params.id).populate("gameId");

        if (!reel) {
            return res.status(404).json({ error: "Reel not found" });
        }

        res.json({ success: true, reel });
    } catch (err) {
        console.error("Get reel error:", err);
        res.status(500).json({ error: "Failed to fetch reel" });
    }
});

// PATCH /reels/:id/like - Toggle like on a reel
router.patch("/:id/like", async (req, res) => {
    try {
        const { userId, action } = req.body; // action: 'like' or 'unlike'

        const reel = await Reel.findById(req.params.id);
        if (!reel) {
            return res.status(404).json({ error: "Reel not found" });
        }

        // Update like count based on action
        if (action === "like") {
            reel.engagement.likes = (reel.engagement.likes || 0) + 1;
        } else if (action === "unlike") {
            reel.engagement.likes = Math.max(0, (reel.engagement.likes || 0) - 1);
        }

        await reel.save();

        res.json({
            success: true,
            likes: reel.engagement.likes,
            message: action === "like" ? "Reel liked" : "Reel unliked"
        });
    } catch (err) {
        console.error("Like reel error:", err);
        res.status(500).json({ error: "Failed to update like" });
    }
});

// PATCH /reels/:id/view - Increment view count
router.patch("/:id/view", async (req, res) => {
    try {
        const reel = await Reel.findById(req.params.id);
        if (!reel) {
            return res.status(404).json({ error: "Reel not found" });
        }

        reel.engagement.views = (reel.engagement.views || 0) + 1;
        await reel.save();

        res.json({ success: true, views: reel.engagement.views });
    } catch (err) {
        console.error("View reel error:", err);
        res.status(500).json({ error: "Failed to update view count" });
    }
});

// GET /reels/:id/comments - Get comments for a reel
router.get("/:id/comments", async (req, res) => {
    try {
        const comments = await Comment.find({ reelId: req.params.id })
            .populate("userId", "username profile.avatarUrl")
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ success: true, comments });
    } catch (err) {
        console.error("Get comments error:", err);
        res.status(500).json({ error: "Failed to fetch comments" });
    }
});

// POST /reels/:id/comments - Add a comment to a reel
router.post("/:id/comments", async (req, res) => {
    try {
        const { userId, text, guestName } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: "Comment text is required" });
        }

        // Verify reel exists
        const reel = await Reel.findById(req.params.id);
        if (!reel) {
            return res.status(404).json({ error: "Reel not found" });
        }

        // Build comment data - userId is optional
        const commentData = {
            reelId: req.params.id,
            text: text.trim(),
            guestName: guestName || "Anonymous",
        };

        // Only add userId if it's a valid ObjectId
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            commentData.userId = userId;
        }

        const comment = new Comment(commentData);
        await comment.save();

        // Update comment count on reel
        reel.engagement.comments = (reel.engagement.comments || 0) + 1;
        await reel.save();

        // Populate user info for response if available
        if (comment.userId) {
            await comment.populate("userId", "username profile.avatarUrl");
        }

        res.status(201).json({
            success: true,
            comment,
            commentCount: reel.engagement.comments
        });
    } catch (err) {
        console.error("Post comment error:", err);
        res.status(500).json({ error: "Failed to post comment" });
    }
});


// DELETE /reels/:id/comments/:commentId - Delete a comment
router.delete("/:id/comments/:commentId", async (req, res) => {
    try {
        const comment = await Comment.findOneAndDelete({
            _id: req.params.commentId,
            reelId: req.params.id
        });

        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        // Update comment count on reel
        const reel = await Reel.findById(req.params.id);
        if (reel) {
            reel.engagement.comments = Math.max(0, (reel.engagement.comments || 0) - 1);
            await reel.save();
        }

        res.json({ success: true, message: "Comment deleted" });
    } catch (err) {
        console.error("Delete comment error:", err);
        res.status(500).json({ error: "Failed to delete comment" });
    }
});

// DELETE /reels/:id - Delete a reel (Admin only)
router.delete("/:id", async (req, res) => {
    try {
        const reel = await Reel.findByIdAndDelete(req.params.id);
        if (!reel) {
            return res.status(404).json({ error: "Reel not found" });
        }
        res.json({ success: true, message: "Reel deleted successfully" });
    } catch (err) {
        console.error("Delete reel error:", err);
        res.status(500).json({ error: "Failed to delete reel" });
    }
});

module.exports = router;
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
