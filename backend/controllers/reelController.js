import Reel from "../models/Reel.js";
import Comment from "../models/Comment.js";

// GET /reels - Get all published reels (paginated feed)
export const getFeed = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reels = await Reel.find({ status: "published" })
            .populate("gameId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Reel.countDocuments({ status: "published" });

        res.json({
            success: true,
            data: reels,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalReels: total,
                hasMore: page * limit < total,
            },
        });
        console.log(`GET /reels - Feed fetched: ${reels.length} reels (page ${page})`);
    } catch (err) {
        console.error("GET /reels - Error:", err);
        res.status(500).json({ error: "Failed to fetch reels", message: err.message });
    }
};

// GET /reels/:reelId - Get a single reel by ID
export const getReelById = async (req, res) => {
    try {
        const { reelId } = req.params;

        const reel = await Reel.findById(reelId).populate("gameId");

        if (!reel) {
            return res.status(404).json({ error: "Reel not found" });
        }

        res.json({ success: true, data: reel });
        console.log(`GET /reels/${reelId} - Reel fetched: ${reel.content?.title}`);
    } catch (err) {
        console.error("GET /reels/:reelId - Error:", err);
        res.status(500).json({ error: "Failed to fetch reel", message: err.message });
    }
};

// POST /reels/:reelId/view - Increment view count
export const viewReel = async (req, res) => {
    try {
        const { reelId } = req.params;

        const reel = await Reel.findByIdAndUpdate(
            reelId,
            { $inc: { "engagement.views": 1 } },
            { new: true }
        );

        if (!reel) {
            return res.status(404).json({ error: "Reel not found" });
        }

        res.json({
            success: true,
            message: "View recorded",
            views: reel.engagement.views,
        });
        console.log(`POST /reels/${reelId}/view - View recorded, total views: ${reel.engagement.views}`);
    } catch (err) {
        console.error("POST /reels/:reelId/view - Error:", err);
        res.status(500).json({ error: "Failed to record view", message: err.message });
    }
};

// GET /reels/search - Search reels by tags, title, or difficulty
export const searchReels = async (req, res) => {
    try {
        const { query, tags, difficulty, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build search filter
        const filter = { status: "published" };

        if (query) {
            filter.$or = [
                { "content.title": { $regex: query, $options: "i" } },
                { "content.description": { $regex: query, $options: "i" } },
            ];
        }

        if (tags) {
            const tagArray = tags.split(",").map((tag) => tag.trim());
            filter["content.tags"] = { $in: tagArray };
        }

        if (difficulty) {
            filter["content.difficulty"] = difficulty;
        }

        const reels = await Reel.find(filter)
            .populate("gameId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Reel.countDocuments(filter);

        res.json({
            success: true,
            data: reels,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalReels: total,
                hasMore: parseInt(page) * parseInt(limit) < total,
            },
        });
        console.log(`GET /reels/search - Found ${reels.length} reels (query: ${query || 'none'}, tags: ${tags || 'none'}, difficulty: ${difficulty || 'any'})`);
    } catch (err) {
        console.error("GET /reels/search - Error:", err);
        res.status(500).json({ error: "Failed to search reels", message: err.message });
    }
};

// GET /reels/trending - Get trending reels (sorted by engagement)
export const getTrendingReels = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const reels = await Reel.find({ status: "published" })
            .populate("gameId")
            .sort({
                "engagement.views": -1,
                "engagement.likes": -1,
                createdAt: -1,
            })
            .limit(limit);

        res.json({
            success: true,
            data: reels,
        });
        console.log(`GET /reels/trending - Fetched ${reels.length} trending reels`);
    } catch (err) {
        console.error("GET /reels/trending - Error:", err);
        res.status(500).json({ error: "Failed to fetch trending reels", message: err.message });
    }
};

// GET /reels/:reelId/stats - Get reel engagement stats
export const getReelStats = async (req, res) => {
    try {
        const { reelId } = req.params;

        const reel = await Reel.findById(reelId).select("engagement");

        if (!reel) {
            return res.status(404).json({ error: "Reel not found" });
        }

        const commentsCount = await Comment.countDocuments({ reelId, isDeleted: false });

        res.json({
            success: true,
            stats: {
                likes: reel.engagement.likes,
                views: reel.engagement.views,
                saves: reel.engagement.saves,
                comments: commentsCount,
            },
        });
        console.log(`GET /reels/${reelId}/stats - Stats fetched (views: ${reel.engagement.views}, likes: ${reel.engagement.likes})`);
    } catch (err) {
        console.error("GET /reels/:reelId/stats - Error:", err);
        res.status(500).json({ error: "Failed to fetch reel stats", message: err.message });
    }
};

// GET /reels/filter/difficulty/:difficulty - Get reels by difficulty
export const getReelsByDifficulty = async (req, res) => {
    try {
        const { difficulty } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (!["beginner", "intermediate", "advanced"].includes(difficulty)) {
            return res.status(400).json({
                error: "Invalid difficulty",
                message: "Difficulty must be one of: beginner, intermediate, advanced",
            });
        }

        const reels = await Reel.find({
            status: "published",
            "content.difficulty": difficulty,
        })
            .populate("gameId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Reel.countDocuments({
            status: "published",
            "content.difficulty": difficulty,
        });

        res.json({
            success: true,
            data: reels,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalReels: total,
                hasMore: page * limit < total,
            },
        });
        console.log(`GET /reels/filter/difficulty/${difficulty} - Found ${reels.length} reels`);
    } catch (err) {
        console.error("GET /reels/filter/difficulty/:difficulty - Error:", err);
        res.status(500).json({ error: "Failed to fetch reels", message: err.message });
    }
};
