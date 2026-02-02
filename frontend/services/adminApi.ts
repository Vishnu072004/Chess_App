import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./api";
import { Reel } from "@/types/reel";

interface AdminVideosResponse {
    success: boolean;
    count: number;
    data: Reel[];
}

interface AdminVideoResponse {
    success: boolean;
    data: Reel;
    uploadedBy?: string;
}

interface AdminStatsResponse {
    success: boolean;
    stats: {
        totalReels: number;
        publishedReels: number;
        draftReels: number;
        totalViews: number;
        totalLikes: number;
    };
}

interface PostReelData {
    videoUrl: string;
    title: string;
    description: string;
    fenString?: string;
    tags?: string[];
    difficulty?: "beginner" | "intermediate" | "advanced";
}

// Fetch all reels for admin (including drafts)
async function fetchAdminReels(): Promise<Reel[]> {
    const response = await apiClient.get<AdminVideosResponse>("/admin/videos");
    return response.data.data || [];
}

// Fetch admin stats
async function fetchAdminStats(): Promise<AdminStatsResponse["stats"]> {
    try {
        // Try dedicated stats endpoint first
        const response = await apiClient.get<AdminStatsResponse>("/admin/stats");
        return response.data.stats;
    } catch {
        // Fallback: calculate from videos
        const reels = await fetchAdminReels();
        return {
            totalReels: reels.length,
            publishedReels: reels.filter((r) => r.status === "published").length,
            draftReels: reels.filter((r) => r.status === "draft").length,
            totalViews: reels.reduce((sum, r) => sum + (r.engagement?.views || 0), 0),
            totalLikes: reels.reduce((sum, r) => sum + (r.engagement?.likes || 0), 0),
        };
    }
}

// Hook: Get all admin reels
export function useAdminReels() {
    return useQuery({
        queryKey: ["admin-reels"],
        queryFn: fetchAdminReels,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

// Hook: Get admin stats
export function useAdminStats() {
    return useQuery({
        queryKey: ["admin-stats"],
        queryFn: fetchAdminStats,
        staleTime: 60 * 1000, // 1 minute
    });
}

// Hook: Post new reel
export function usePostReel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (reelData: PostReelData) => {
            const payload = {
                adminId: "admin",
                videoData: {
                    video: {
                        url: reelData.videoUrl,
                        thumbnail: "",
                        durationSec: 0,
                    },
                    content: {
                        title: reelData.title,
                        description: reelData.description,
                        tags: reelData.tags || [],
                        difficulty: reelData.difficulty || "beginner",
                    },
                    gameId: null,
                    status: "published",
                },
            };
            const response = await apiClient.post<AdminVideoResponse>(
                "/admin/video",
                payload
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-reels"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
            queryClient.invalidateQueries({ queryKey: ["reels"] });
        },
    });
}

// Hook: Delete reel with optimistic update
export function useDeleteReel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (reelId: string) => {
            const response = await apiClient.delete(`/admin/video/${reelId}`);
            return response.data;
        },
        onMutate: async (reelId: string) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["admin-reels"] });

            // Snapshot previous value
            const previousReels = queryClient.getQueryData<Reel[]>(["admin-reels"]);

            // Optimistically remove the reel
            if (previousReels) {
                queryClient.setQueryData<Reel[]>(
                    ["admin-reels"],
                    previousReels.filter((reel) => reel._id !== reelId)
                );
            }

            return { previousReels };
        },
        onError: (_err, _reelId, context) => {
            // Rollback on error
            if (context?.previousReels) {
                queryClient.setQueryData(["admin-reels"], context.previousReels);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-reels"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
            queryClient.invalidateQueries({ queryKey: ["reels"] });
        },
    });
}
