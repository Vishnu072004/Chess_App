import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    FlatList,
    Dimensions,
    StyleSheet,
    ActivityIndicator,
    Text,
    RefreshControl,
    Share,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { ReelCard } from "@/components/reels/ReelCard";
import { CommentsBottomSheet } from "@/components/reels/CommentsBottomSheet";
import { useReels, useLikeReel, useRecordView } from "@/services/reelApi";
import { useReelStore } from "@/stores/reelStore";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/constants/themes";
import { Reel } from "@/types/reel";
import * as Haptics from "expo-haptics";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Generate a unique session ID for guests
const generateSessionId = () => `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function ReelsScreen() {
    const { data: fetchedReels, isLoading, error, refetch, isRefetching } = useReels();
    const likeMutation = useLikeReel();
    const recordViewMutation = useRecordView();
    const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);
    const [commentsReelId, setCommentsReelId] = useState<string | null>(null);

    // Track which reels have been viewed this session (prevents duplicate API calls)
    const viewedReelsRef = useRef<Set<string>>(new Set());
    const sessionIdRef = useRef<string>(generateSessionId());

    // Get user ID for view tracking
    const { user, isAuthenticated } = useAuthStore();
    const viewerId = isAuthenticated && user?.id ? user.id : sessionIdRef.current;

    // Use store's reels for live counts - this is critical for real-time updates
    const storeReels = useReelStore((s) => s.reels);
    const setReels = useReelStore((s) => s.setReels);
    const setCurrentIndex = useReelStore((s) => s.setCurrentIndex);
    const likeReel = useReelStore((s) => s.likeReel);
    const unlikeReel = useReelStore((s) => s.unlikeReel);
    const saveReel = useReelStore((s) => s.saveReel);
    const unsaveReel = useReelStore((s) => s.unsaveReel);
    const isLiked = useReelStore((s) => s.isLiked);
    const isSaved = useReelStore((s) => s.isSaved);
    const incrementViews = useReelStore((s) => s.incrementViews);

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    // Sync fetched reels to store
    useEffect(() => {
        if (fetchedReels && fetchedReels.length > 0) {
            setReels(fetchedReels);
        }
    }, [fetchedReels, setReels]);

    // Use store reels (with live counts) for rendering, fallback to fetched
    const reels = storeReels.length > 0 ? storeReels : fetchedReels;

    const onViewableItemsChanged = useCallback(
        ({ viewableItems }: { viewableItems: Array<{ index: number | null; item: Reel }> }) => {
            if (viewableItems.length > 0 && viewableItems[0].index !== null) {
                const newIndex = viewableItems[0].index;
                setCurrentIndex(newIndex);
                setCurrentVisibleIndex(newIndex);
                Haptics.selectionAsync();
            }
        },
        [setCurrentIndex]
    );

    // Handle unique view recording (called after 2 seconds)
    const handleView = useCallback(
        (reelId: string) => {
            // Only send one view request per reel per session
            if (viewedReelsRef.current.has(reelId)) return;

            viewedReelsRef.current.add(reelId);

            // Update local count optimistically
            incrementViews(reelId);

            // Record view on backend
            recordViewMutation.mutate({ reelId, viewerId });
        },
        [viewerId, incrementViews, recordViewMutation]
    );

    // Optimistic like with backend sync
    const handleLike = useCallback(
        (reelId: string) => {
            const alreadyLiked = isLiked(reelId);

            // Optimistic local update (updates store reels)
            if (alreadyLiked) {
                unlikeReel(reelId);
            } else {
                likeReel(reelId);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }

            // Sync with backend (fire and forget)
            likeMutation.mutate({
                reelId,
                action: alreadyLiked ? "unlike" : "like",
            });
        },
        [isLiked, likeReel, unlikeReel, likeMutation]
    );

    const handleSave = useCallback(
        (reelId: string) => {
            if (isSaved(reelId)) {
                unsaveReel(reelId);
            } else {
                saveReel(reelId);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
        },
        [isSaved, saveReel, unsaveReel]
    );

    const handleComment = useCallback((reel: Reel) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCommentsReelId(reel._id);
    }, []);

    const handleShare = useCallback(async (reel: Reel) => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await Share.share({
                message: `Check out this chess reel: ${reel.content.title}\n\n${reel.content.description}`,
                title: reel.content.title,
            });
        } catch (error) {
            console.error("Share error:", error);
        }
    }, []);

    const renderItem = useCallback(
        ({ item, index }: { item: Reel; index: number }) => (
            <ReelCard
                reel={item}
                isVisible={index === currentVisibleIndex}
                isLiked={isLiked(item._id)}
                isSaved={isSaved(item._id)}
                onLike={() => handleLike(item._id)}
                onSave={() => handleSave(item._id)}
                onComment={() => handleComment(item)}
                onShare={() => handleShare(item)}
                onView={() => handleView(item._id)}
            />
        ),
        [currentVisibleIndex, isLiked, isSaved, handleLike, handleSave, handleComment, handleShare, handleView]
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent.cyan} />
                <Text style={styles.loadingText}>Loading Reels...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load reels</Text>
                <Text style={styles.errorSubtext}>Pull down to retry</Text>
            </View>
        );
    }

    if (!reels || reels.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No reels available</Text>
                <Text style={styles.emptySubtext}>Check back later for new content</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <FlatList
                data={reels}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                extraData={storeReels} // Force re-render when store reels change
                pagingEnabled
                showsVerticalScrollIndicator={false}
                snapToInterval={SCREEN_HEIGHT}
                snapToAlignment="start"
                decelerationRate="fast"
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                removeClippedSubviews
                maxToRenderPerBatch={2}
                windowSize={3}
                initialNumToRender={1}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={colors.accent.cyan}
                    />
                }
                getItemLayout={(_, index) => ({
                    length: SCREEN_HEIGHT,
                    offset: SCREEN_HEIGHT * index,
                    index,
                })}
            />

            {/* Comments Bottom Sheet */}
            {commentsReelId && (
                <CommentsBottomSheet
                    reelId={commentsReelId}
                    visible={!!commentsReelId}
                    onClose={() => setCommentsReelId(null)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: colors.background.primary,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
    },
    loadingText: {
        color: colors.text.secondary,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        backgroundColor: colors.background.primary,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    errorText: {
        color: colors.danger,
        fontSize: 18,
        fontWeight: "600",
    },
    errorSubtext: {
        color: colors.text.muted,
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        backgroundColor: colors.background.primary,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    emptyText: {
        color: colors.text.primary,
        fontSize: 18,
        fontWeight: "600",
    },
    emptySubtext: {
        color: colors.text.muted,
        fontSize: 14,
    },
});
