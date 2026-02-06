import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
<<<<<<< HEAD
import { axiosClient } from "@/services/axiosClient";
=======
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757

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
<<<<<<< HEAD
    error: string | null;
=======
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757

    // Actions
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    login: (user: User, token: string, isAdmin?: boolean) => void;
<<<<<<< HEAD
    loginUser: (email: string, password: string) => Promise<boolean>;
    register: (username: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    updateProfile: (profile: Partial<User["profile"]>) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
=======
    logout: () => void;
    updateProfile: (profile: Partial<User["profile"]>) => void;
    setLoading: (loading: boolean) => void;
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
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
<<<<<<< HEAD
        (set) => ({
=======
        (set, get) => ({
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
            user: null,
            token: null,
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
<<<<<<< HEAD
            error: null,
=======
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757

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
<<<<<<< HEAD
                    error: null,
                }),

            loginUser: async (email: string, password: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosClient.post<{
                        message: string;
                        isAdmin: boolean;
                        token: string;
                        user: { id?: string; username?: string; email: string };
                    }>("/auth/login", { email, password });

                    const { token, user: userData, isAdmin } = response.data;
                    const user: User = {
                        id: userData.id || "",
                        username: userData.username || userData.email,
                        email: userData.email,
                    };

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isAdmin: isAdmin || false,
                        isLoading: false,
                        error: null,
                    });
                    return true;
                } catch (error: any) {
                    const message = error?.response?.data?.error || error?.message || "Login failed";
                    set({ isLoading: false, error: message });
                    return false;
                }
            },

            register: async (username: string, email: string, password: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosClient.post<{
                        message: string;
                        token: string;
                        user: { id: string; username: string; email: string };
                    }>("/auth/register", { username, email, password });

                    const { token, user: userData } = response.data;
                    const user: User = {
                        id: userData.id,
                        username: userData.username,
                        email: userData.email,
                    };

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isAdmin: false,
                        isLoading: false,
                        error: null,
                    });
                    return true;
                } catch (error: any) {
                    const message = error?.response?.data?.error || error?.message || "Registration failed";
                    set({ isLoading: false, error: message });
                    return false;
                }
            },

=======
                }),

>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
            logout: () =>
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isAdmin: false,
<<<<<<< HEAD
                    error: null,
                }),

            updateProfile: (profile) => {
                set((state) => {
                    if (state.user) {
                        return {
                            user: {
                                ...state.user,
                                profile: {
                                    ...state.user.profile,
                                    ...profile,
                                },
                            },
                        };
                    }
                    return {};
                });
            },

            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),
=======
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
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
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

