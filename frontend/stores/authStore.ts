import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

export interface User {
    id: string;
    username: string;
    email: string;
    profile?: {
        name?: string;
        avatarUrl?: string;
        bio?: string;
        chessRating?: number;
    };
    stats?: {
        reelsWatched?: number;
        puzzlesSolved?: number;
        followers?: number;
        following?: number;
    };
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;

    // Actions
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    login: (user: User, token: string, isAdmin?: boolean) => void;
    logout: () => void;
    updateProfile: (profile: Partial<User["profile"]>) => void;
    setLoading: (loading: boolean) => void;
}

// Custom storage adapter for Expo SecureStore
const secureStoreAdapter = {
    getItem: async (name: string): Promise<string | null> => {
        return await SecureStore.getItemAsync(name);
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await SecureStore.setItemAsync(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
        await SecureStore.deleteItemAsync(name);
    },
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,

            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: !!user,
                }),

            setToken: (token) => set({ token }),

            login: (user, token, isAdmin = false) =>
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    isAdmin,
                    isLoading: false,
                }),

            logout: () =>
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isAdmin: false,
                }),

            updateProfile: (profile) => {
                const currentUser = get().user;
                if (currentUser) {
                    set({
                        user: {
                            ...currentUser,
                            profile: {
                                ...currentUser.profile,
                                ...profile,
                            },
                        },
                    });
                }
            },

            setLoading: (isLoading) => set({ isLoading }),
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => secureStoreAdapter),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                isAdmin: state.isAdmin,
            }),
        }
    )
);

