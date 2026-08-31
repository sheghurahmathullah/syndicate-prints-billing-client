import { getApiUrl } from "./apiConfig";
import axios from "axios";

// Get API URL from environment variable (must be prefixed with VITE_ in Vite)
// Use relative path in production (via Vercel proxy) to avoid CORS
// Use relative path in dev (via Vite proxy) or fallback to localhost
const API_URL = getApiUrl();

export const latestOrders = async () => {
    return await axios.get(`${API_URL}api/v1.0/orders/latest`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}

export const createOrder = async (order) => {
    return await axios.post(`${API_URL}api/v1.0/orders`, order, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}

export const deleteOrder = async (id) => {
    return await axios.delete(`${API_URL}api/v1.0/orders/${id}`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}

export const getPendingCreditOrders = async () => {
    return await axios.get(`${API_URL}api/v1.0/orders/pending-credits`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}

export const completeCreditOrder = async (orderId) => {
    return await axios.put(`${API_URL}api/v1.0/orders/${orderId}/complete-credit`, {}, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}});
}