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

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
            // Token expired or invalid - logout user
            useAuthStore.getState().logout();
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
