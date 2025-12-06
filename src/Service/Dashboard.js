import axios from "axios";

// Get API URL from environment variable (must be prefixed with VITE_ in Vite)
// Use relative path in production (via Vercel proxy) to avoid CORS
// Use relative path in dev (via Vite proxy) or fallback to localhost
const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  // If VITE_API_URL is "/" or empty, use relative path (for Vercel/Vite proxy)
  if (!url || url === "/") {
    return "/";
  }
  // Otherwise use the provided URL (for local dev with direct backend)
  return url.endsWith('/') ? url : url + '/';
};

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

