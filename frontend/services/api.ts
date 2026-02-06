<<<<<<< HEAD
import { InternalAxiosRequestConfig } from "axios";
import { QueryClient } from "@tanstack/react-query";
import { axiosClient } from "./axiosClient";

// Re-export the axios client for backwards compatibility
export const apiClient = axiosClient;

// Lazy import to avoid circular dependency
// We use a function to get the store instead of importing at module level
const getAuthStore = () => {
    // Dynamic require to break the circular dependency
    const { useAuthStore } = require("@/stores/authStore");
    return useAuthStore;
};
=======
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { QueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";

// API base URL - use environment variable or fallback
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
<<<<<<< HEAD
        try {
            const token = getAuthStore().getState().token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            // Store not initialized yet, skip token
=======
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
<<<<<<< HEAD
            try {
                // Token expired or invalid - logout user
                getAuthStore().getState().logout();
            } catch (e) {
                // Store not initialized yet, skip logout
            }
=======
            // Token expired or invalid - logout user
            useAuthStore.getState().logout();
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
        }
        return Promise.reject(error);
    }
);

// Create React Query client
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 2,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 1,
        },
    },
});

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// Common API functions
export async function fetchApi<T>(endpoint: string): Promise<T> {
    const response = await apiClient.get<T>(endpoint);
    return response.data;
}

export async function postApi<T, D = unknown>(
    endpoint: string,
    data: D
): Promise<T> {
    const response = await apiClient.post<T>(endpoint, data);
    return response.data;
}

export async function putApi<T, D = unknown>(
    endpoint: string,
    data: D
): Promise<T> {
    const response = await apiClient.put<T>(endpoint, data);
    return response.data;
}

export async function deleteApi<T>(endpoint: string): Promise<T> {
    const response = await apiClient.delete<T>(endpoint);
    return response.data;
}
