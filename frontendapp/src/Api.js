import axios from "axios";
import api from "./BackendURL";

const BackendURL = api.Main;

// Create separate axios instances for each role
export const adminApi = axios.create({
    baseURL: `${BackendURL}/admin`,
});

export const sellerApi = axios.create({
    baseURL: `${BackendURL}/seller`,
});

export const userApi = axios.create({
    baseURL: `${BackendURL}/user`,
});

// Request interceptors to add auth tokens
adminApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

sellerApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("sellerToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

userApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("userToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
