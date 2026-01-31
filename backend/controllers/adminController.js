import Reel from "../models/Reel.js";

// POST /admin/video - Upload a new Video (Reel)
export const uploadVideo = async (req, res) => {
    try {
        const { adminId, videoData } = req.body;

        const newVideo = new Reel({
            video: {
                url: videoData?.video?.url,
                thumbnail: videoData?.video?.thumbnail || "",
                durationSec: videoData?.video?.durationSec || 0,
            },
            content: {
                title: videoData?.content?.title || "",
                description: videoData?.content?.description || "",
                tags: videoData?.content?.tags || [],
                difficulty: videoData?.content?.difficulty || "beginner",
            },
            gameId: videoData?.gameId || null,
            status: videoData?.status || "draft",
        });

        const savedVideo = await newVideo.save();
        res.status(201).json({
            success: true,
            data: savedVideo,
            uploadedBy: adminId,
        });
        console.log(`POST /admin/video - Video uploaded: ${savedVideo._id} (by admin: ${adminId})`);
    } catch (err) {
        console.error("POST /admin/video - Error:", err);
        res.status(500).json({ error: "Failed to upload video", message: err.message });
    }
};

// PUT /admin/video/:videoId - Update an existing Video
export const updateVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        const { updatedData } = req.body;

        const updatedVideo = await Reel.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    "video.url": updatedData?.video?.url,
                    "video.thumbnail": updatedData?.video?.thumbnail,
                    "video.durationSec": updatedData?.video?.durationSec,
                    "content.title": updatedData?.content?.title,
                    "content.description": updatedData?.content?.description,
                    "content.tags": updatedData?.content?.tags,
                    "content.difficulty": updatedData?.content?.difficulty,
                    gameId: updatedData?.gameId,
                    status: updatedData?.status,
                },
            },
            { new: true, runValidators: true }
        );

        if (!updatedVideo) {
            return res.status(404).json({ error: "Video not found" });
        }

        res.json({ success: true, data: updatedVideo });
        console.log(`PUT /admin/video/${videoId} - Video updated successfully`);
    } catch (err) {
        console.error("PUT /admin/video/:videoId - Error:", err);
        res.status(500).json({ error: "Failed to update video", message: err.message });
    }
};

// DELETE /admin/video/:videoId - Delete a Video
export const deleteVideo = async (req, res) => {
    try {
        const { videoId } = req.params;

        const deletedVideo = await Reel.findByIdAndDelete(videoId);

        if (!deletedVideo) {
            return res.status(404).json({ error: "Video not found" });
        }

        res.json({ success: true, message: "Video deleted successfully", data: deletedVideo });
        console.log(`DELETE /admin/video/${videoId} - Video deleted successfully`);
    } catch (err) {
        console.error("DELETE /admin/video/:videoId - Error:", err);
        res.status(500).json({ error: "Failed to delete video", message: err.message });
    }
};

// GET /admin/videos - Get all Videos
export const getAllVideos = async (req, res) => {
    try {
        const videos = await Reel.find().populate("gameId").sort({ createdAt: -1 });

        res.json({ success: true, count: videos.length, data: videos });
        console.log(`GET /admin/videos - ${videos.length} videos fetched`);
    } catch (err) {
        console.error("GET /admin/videos - Error:", err);
        res.status(500).json({ error: "Failed to fetch videos", message: err.message });
    }
};

// GET /admin/video/:videoId - Get Video by ID
export const getVideoById = async (req, res) => {
    try {
        const { videoId } = req.params;

        const video = await Reel.findById(videoId).populate("gameId");

        if (!video) {
            return res.status(404).json({ error: "Video not found" });
        }

        res.json({ success: true, data: video });
        console.log(`GET /admin/video/${videoId} - Video fetched: ${video.content?.title}`);
    } catch (err) {
        console.error("GET /admin/video/:videoId - Error:", err);
        res.status(500).json({ error: "Failed to fetch video", message: err.message });
    }
};
