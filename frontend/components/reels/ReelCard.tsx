import React, { useRef, useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { Play, Pause, Clock, Volume2, VolumeX } from "lucide-react-native";
import { Reel } from "@/types/reel";
import { ReelActions } from "./ReelActions";
import { colors } from "@/constants/themes";
import { getDifficultyColor } from "@/services/reelApi";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const VIEW_TRIGGER_DELAY = 2000; // 2 seconds before counting as a view

interface ReelCardProps {
    reel: Reel;
    isVisible: boolean;
    isLiked: boolean;
    isSaved: boolean;
    onLike: () => void;
    onSave: () => void;
    onComment: () => void;
    onShare: () => void;
    onView?: () => void; // Callback to record view
}

export function ReelCard({
    reel,
    isVisible,
    isLiked,
    isSaved,
    onLike,
    onSave,
    onComment,
    onShare,
    onView,
}: ReelCardProps) {
    const videoRef = useRef<Video>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showControls, setShowControls] = useState(false);
    const [hasRecordedView, setHasRecordedView] = useState(false);
    const viewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 2-second view trigger
    useEffect(() => {
        if (isVisible && !hasRecordedView && onView) {
            // Start timer when reel becomes visible
            viewTimerRef.current = setTimeout(() => {
                onView();
                setHasRecordedView(true);
            }, VIEW_TRIGGER_DELAY);
        } else {
            // Clear timer if reel becomes invisible before 2 seconds
            if (viewTimerRef.current) {
                clearTimeout(viewTimerRef.current);
                viewTimerRef.current = null;
            }
        }

        return () => {
            if (viewTimerRef.current) {
                clearTimeout(viewTimerRef.current);
            }
        };
    }, [isVisible, hasRecordedView, onView]);

    // Play/pause based on visibility
    useEffect(() => {
        if (isVisible) {
            videoRef.current?.playAsync();
            setIsPlaying(true);
        } else {
            videoRef.current?.pauseAsync();
            setIsPlaying(false);
        }
    }, [isVisible]);

    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setIsLoading(false);
            setIsPlaying(status.isPlaying);

            // Loop video when finished
            if (status.didJustFinish) {
                videoRef.current?.replayAsync();
            }
        }
    };

    const togglePlayPause = async () => {
        if (isPlaying) {
            await videoRef.current?.pauseAsync();
        } else {
            await videoRef.current?.playAsync();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = async () => {
        await videoRef.current?.setIsMutedAsync(!isMuted);
        setIsMuted(!isMuted);
    };

    const handleVideoPress = () => {
        setShowControls(true);
        setTimeout(() => setShowControls(false), 3000);
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <View style={styles.container}>
            {/* Video Player */}
            <TouchableOpacity
                activeOpacity={1}
                onPress={handleVideoPress}
                style={StyleSheet.absoluteFill}
            >
                <Video
                    ref={videoRef}
                    source={{ uri: reel.video.url }}
                    posterSource={{ uri: reel.video.thumbnail }}
                    usePoster
                    posterStyle={styles.poster}
                    style={styles.video}
                    resizeMode={ResizeMode.COVER}
                    isLooping
                    isMuted={isMuted}
                    shouldPlay={isVisible}
                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                />
            </TouchableOpacity>

            {/* Loading Indicator */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.accent.cyan} />
                </View>
            )}

            {/* Play/Pause Overlay (shown on tap) */}
            {showControls && (
                <TouchableOpacity
                    style={styles.playButton}
                    onPress={togglePlayPause}
                >
                    <View style={styles.playIconContainer}>
                        {isPlaying ? (
                            <Pause size={48} color={colors.text.primary} fill={colors.text.primary} />
                        ) : (
                            <Play size={48} color={colors.text.primary} fill={colors.text.primary} />
                        )}
                    </View>
                </TouchableOpacity>
            )}

            {/* Mute Button */}
            <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
                {isMuted ? (
                    <VolumeX size={20} color={colors.text.primary} />
                ) : (
                    <Volume2 size={20} color={colors.text.primary} />
                )}
            </TouchableOpacity>

            {/* Duration Badge */}
            <View style={styles.durationBadge}>
                <Clock size={12} color={colors.text.primary} />
                <Text style={styles.durationText}>
                    {formatDuration(reel.video.durationSec)}
                </Text>
            </View>

            {/* Top Gradient */}
            <LinearGradient
                colors={["rgba(0,0,0,0.6)", "transparent"]}
                style={styles.topGradient}
                pointerEvents="none"
            />

            {/* Bottom Gradient & Content */}
            <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.8)"]}
                style={styles.bottomGradient}
                pointerEvents="box-none"
            >
                {/* Difficulty Badge */}
                <View
                    style={[
                        styles.difficultyBadge,
                        { backgroundColor: getDifficultyColor(reel.content.difficulty) + "CC" },
                    ]}
                >
                    <Text style={styles.difficultyText}>
                        {reel.content.difficulty.toUpperCase()}
                    </Text>
                </View>

                {/* Title */}
                <Text style={styles.title} numberOfLines={2}>
                    {reel.content.title}
                </Text>

                {/* Description */}
                <Text style={styles.description} numberOfLines={2}>
                    {reel.content.description}
                </Text>

                {/* Tags */}
                <View style={styles.tagsContainer}>
                    {(reel.content.tags || []).slice(0, 3).map((tag, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>#{tag}</Text>
                        </View>
                    ))}
                </View>
            </LinearGradient>

            {/* Actions */}
            <ReelActions
                likes={reel.engagement?.likes || 0}
                comments={reel.engagement?.comments || 0}
                saves={reel.engagement?.saves || 0}
                isLiked={isLiked}
                isSaved={isSaved}
                onLike={onLike}
                onComment={onComment}
                onShare={onShare}
                onSave={onSave}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: colors.background.primary,
    },
    video: {
        ...StyleSheet.absoluteFillObject,
        width: "100%",
        height: "100%",
    },
    poster: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    playButton: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateX: -40 }, { translateY: -40 }],
    },
    playIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: 4,
    },
    muteButton: {
        position: "absolute",
        top: 60,
        left: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    durationBadge: {
        position: "absolute",
        top: 60,
        right: 16,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    durationText: {
        color: colors.text.primary,
        fontSize: 12,
        fontWeight: "600",
    },
    topGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 120,
    },
    bottomGradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 60,
        paddingBottom: 140, // Extra padding for tab bar
        paddingHorizontal: 16,
    },
    difficultyBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    difficultyText: {
        color: colors.text.primary,
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 1,
    },
    title: {
        color: colors.text.primary,
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 8,
    },
    description: {
        color: colors.text.secondary,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    tag: {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tagText: {
        color: colors.text.secondary,
        fontSize: 12,
    },
});
