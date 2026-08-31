import { getApiUrl } from "./apiConfig";
import axios from "axios";

// Get API URL from environment variable (must be prefixed with VITE_ in Vite)
// Use relative path in production (via Vercel proxy) to avoid CORS
// Use relative path in dev (via Vite proxy) or fallback to localhost
const API_URL = getApiUrl();

export const addCategory = async (category) => {
    return await axios.post(`${API_URL}api/v1.0/admin/categories`, category, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}

export const deleteCategory = async (categoryId) => {
    return await axios.delete(`${API_URL}api/v1.0/admin/categories/${categoryId}`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}

export const fetchCategories = async () => {
    return await axios.get(`${API_URL}api/v1.0/categories`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}
