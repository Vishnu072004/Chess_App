import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
    getFeed,
    getReelById,
    viewReel,
    searchReels,
    getTrendingReels,
    getReelStats,
    getReelsByDifficulty,
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

// GET /reels/search - Search reels by query, tags, or difficulty
router.get("/search", searchReels);

// GET /reels/trending - Get trending reels
router.get("/trending", getTrendingReels);

// GET /reels/filter/difficulty/:difficulty - Get reels by difficulty level
router.get("/filter/difficulty/:difficulty", getReelsByDifficulty);

// GET /reels/:reelId/stats - Get engagement stats for a reel
router.get("/:reelId/stats", getReelStats);

// GET /reels/:reelId/comments - Get all comments for a reel
router.get("/:reelId/comments", getCommentsByReel);

// POST /reels/:reelId/view - Record a view
router.post("/:reelId/view", viewReel);

// ============ AUTHENTICATED ROUTES ============

// POST /reels/:reelId/like - Like a reel
router.post("/:reelId/like", verifyToken, likeReel);

// POST /reels/:reelId/unlike - Unlike a reel
router.post("/:reelId/unlike", verifyToken, unlikeReel);

// POST /reels/:reelId/comments - Create a new comment
router.post("/:reelId/comments", verifyToken, createComment);

// DELETE /reels/:reelId/comments/:commentId - Delete a comment
router.delete("/:reelId/comments/:commentId", verifyToken, deleteComment);

// ============ CATCH-ALL PARAMETERIZED ROUTE ============
// This MUST be last to avoid matching before specific routes

// GET /reels/:reelId - Get a single reel by ID
router.get("/:reelId", getReelById);

export default router;


