import { getApiUrl } from "./apiConfig";
import axios from "axios";

// Get API URL from environment variable (must be prefixed with VITE_ in Vite)
// Use relative path in production (via Vercel proxy) to avoid CORS
// Use relative path in dev (via Vite proxy) or fallback to localhost
const API_URL = getApiUrl();

export const fetchDashboardData = async (filter = "today", startDate = null, endDate = null, paymentType = null) => {
    const params = new URLSearchParams();
    params.append('filter', filter);
    
    // Only append dates if they're provided
    if (startDate) {
        params.append('startDate', startDate);
    }
    if (endDate) {
        params.append('endDate', endDate);
    }
    
    // Only append payment type if it's provided
    if (paymentType) {
        params.append('paymentType', paymentType);
    }
    
    return await axios.get(`${API_URL}api/v1.0/dashboard/dashboard-all?${params.toString()}`, {
        headers: {'Authorization': `Bearer ${localStorage.getItem("token")}`}
    });
}

export const fetchAnalyticsData = async (filter = "month", startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    if (filter) {
        params.append('filter', filter);
    }
    if (startDate) {
        params.append('startDate', startDate);
    }
    if (endDate) {
        params.append('endDate', endDate);
    }
    
    return await axios.get(`${API_URL}api/v1.0/dashboard/bills-dashboard?${params.toString()}`, {
        headers: {'Authorization': `Bearer ${localStorage.getItem("token")}`}
    });
}

export const fetchTodayBills = async (page = 0, size = 15) => {
    return await axios.get(`${API_URL}api/v1.0/dashboard/today-bills`, {
        params: { page, size },
        headers: {'Authorization': `Bearer ${localStorage.getItem("token")}`}
    });
};
