import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./api";
import { Reel } from "@/types/reel";
import { cacheReels, getCachedReels } from "./storageService";

interface ReelsResponse {
    success: boolean;
    reels: Reel[];
}

interface CommentResponse {
    success: boolean;
    comments: Comment[];
}

interface Comment {
    _id: string;
    reelId: string;
    userId: {
        _id: string;
        username: string;
        profile?: {
            avatarUrl?: string;
        };
    } | null;
    text: string;
    createdAt: string;
}

// Fetch all reels from the backend
async function fetchReels(): Promise<Reel[]> {
    try {
        // Try the new /reels endpoint first
        const response = await apiClient.get<ReelsResponse>("/reels");
        const reels = response.data.reels || [];

        // Cache for offline use
        if (reels.length > 0) {
            await cacheReels(reels);
        }

        return reels;
    } catch (error) {
        console.error("Error fetching reels from /reels, trying /data/all:", error);

        // Fallback to /data/all endpoint
        try {
            const response = await apiClient.get<{ reels: Reel[] }>("/data/all");
            const reels = (response.data.reels || []).filter(r => r.status === "published");

            if (reels.length > 0) {
                await cacheReels(reels);
            }

            return reels;
        } catch (fallbackError) {
            console.error("Fallback also failed, trying cache:", fallbackError);
            return getCachedReels();
        }
    }
}

// TanStack Query hook for fetching reels
export function useReels() {
    return useQuery({
        queryKey: ["reels"],
        queryFn: fetchReels,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        retry: 2,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });
}

// Get a single reel by ID
export function useReel(reelId: string) {
    return useQuery({
        queryKey: ["reel", reelId],
        queryFn: async () => {
            const allReels = await fetchReels();
            return allReels.find((reel) => reel._id === reelId) || null;
        },
        enabled: !!reelId,
    });
}

// Like a reel with optimistic update
export function useLikeReel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ reelId, action }: { reelId: string; action: "like" | "unlike" }) => {
            const response = await apiClient.patch(`/reels/${reelId}/like`, { action });
            return response.data;
        },
        onMutate: async ({ reelId, action }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["reels"] });

            // Snapshot previous value
            const previousReels = queryClient.getQueryData<Reel[]>(["reels"]);

            // Optimistically update
            if (previousReels) {
                queryClient.setQueryData<Reel[]>(["reels"], (old) =>
                    old?.map((reel) =>
                        reel._id === reelId
                            ? {
                                ...reel,
                                engagement: {
                                    ...reel.engagement,
                                    likes: action === "like"
                                        ? (reel.engagement?.likes || 0) + 1
                                        : Math.max(0, (reel.engagement?.likes || 0) - 1),
                                },
                            }
                            : reel
                    )
                );
            }

            return { previousReels };
        },
        onError: (err, variables, context) => {
            // Rollback on error
            if (context?.previousReels) {
                queryClient.setQueryData(["reels"], context.previousReels);
            }
        },
        onSettled: () => {
            // Refetch to sync with server
            queryClient.invalidateQueries({ queryKey: ["reels"] });
        },
    });
}

// Record a unique view on a reel
export function useRecordView() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ reelId, viewerId }: { reelId: string; viewerId: string }) => {
            const response = await apiClient.post(`/reels/${reelId}/view`, { viewerId });
            return response.data;
        },
        onSuccess: (data, { reelId }) => {
            // Only update cache if it was a new view
            if (data.isNewView) {
                queryClient.setQueryData<Reel[]>(["reels"], (old) =>
                    old?.map((reel) =>
                        reel._id === reelId
                            ? {
                                ...reel,
                                engagement: {
                                    ...reel.engagement,
                                    views: data.views,
                                },
                            }
                            : reel
                    )
                );
            }
        },
    });
}

// Get comments for a reel
export function useReelComments(reelId: string) {
    return useQuery({
        queryKey: ["reel-comments", reelId],
        queryFn: async () => {
            const response = await apiClient.get<CommentResponse>(`/reels/${reelId}/comments`);
            return response.data.comments || [];
        },
        enabled: !!reelId,
        staleTime: 60 * 1000, // 1 minute
    });
}

// Post a comment with optimistic update
export function usePostComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ reelId, text, userId }: { reelId: string; text: string; userId?: string }) => {
            const response = await apiClient.post(`/reels/${reelId}/comments`, { text, userId });
            return response.data;
        },
        onMutate: async ({ reelId, text }) => {
            await queryClient.cancelQueries({ queryKey: ["reel-comments", reelId] });

            const previousComments = queryClient.getQueryData<Comment[]>(["reel-comments", reelId]);

            // Optimistically add comment
            const optimisticComment: Comment = {
                _id: `temp-${Date.now()}`,
                reelId,
                userId: null,
                text,
                createdAt: new Date().toISOString(),
            };

            queryClient.setQueryData<Comment[]>(["reel-comments", reelId], (old) => [
                optimisticComment,
                ...(old || []),
            ]);

            return { previousComments };
        },
        onError: (err, variables, context) => {
            if (context?.previousComments) {
                queryClient.setQueryData(["reel-comments", variables.reelId], context.previousComments);
            }
        },
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({ queryKey: ["reel-comments", variables.reelId] });
            queryClient.invalidateQueries({ queryKey: ["reels"] });
        },
    });
}

// Format view count for display
export function formatCount(count: number): string {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + "M";
    }
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
}

// Get difficulty color
export function getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
        case "beginner":
            return "#10B981"; // green
        case "intermediate":
            return "#F59E0B"; // yellow
        case "advanced":
            return "#EF4444"; // red
        default:
            return "#6B7280"; // gray
    }
}
